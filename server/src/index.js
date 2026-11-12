import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomInt, randomUUID, createHash, timingSafeEqual } from 'node:crypto'
import { pool, checkDatabase } from './db.js'
import { sendVerificationEmail, verifyEmailTransport } from './mailer.js'

const app = express()
const PORT = Number(process.env.PORT || 3000)
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Startup blocked: set JWT_SECRET in the root .env.local to at least 32 characters.')
  process.exit(1)
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(value => value.trim()).filter(Boolean)
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '50kb' }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }))

const normalizeEmail = value => String(value || '').trim().toLowerCase()
const hashCode = code => createHash('sha256').update(code).digest()
const sameHash = (stored, supplied) => {
  const left = Buffer.from(String(stored || ''), 'hex')
  const right = hashCode(supplied)
  return left.length === right.length && timingSafeEqual(left, right)
}
const parseJson = value => {
  if (Array.isArray(value)) return value
  if (!value) return []
  try { return JSON.parse(value) } catch { return [] }
}
const makeToken = user => jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' })
const publicUser = row => ({
  id: row.id, name: row.name, email: row.email, role: row.role,
  department: row.department || '', verified: Boolean(row.verified),
  profileComplete: Boolean(row.profile_complete),
  profilePicture: row.profile_picture || null,
  bio: row.bio || '',
  researchInterests: parseJson(row.research_interests),
  skills: parseJson(row.skills),
  yearsExperience: Number(row.years_experience || 0),
  createdAt: row.created_at
})
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)

const authRequired = asyncRoute(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' })
  let payload
  try { payload = jwt.verify(token, JWT_SECRET) }
  catch { return res.status(401).json({ message: 'Your session has expired. Please sign in again.' }) }
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? AND verified = 1 LIMIT 1', [payload.sub])
  if (!rows.length) return res.status(401).json({ message: 'Your account is unavailable. Please sign in again.' })
  req.user = rows[0]
  next()
})
const adminRequired = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' })
  next()
}
const notify = async (userId, title, detail, type = 'info') => {
  await pool.execute('INSERT INTO notifications (id,user_id,title,detail,type) VALUES (?,?,?,?,?)',
    [randomUUID(), userId, title, detail, type])
}
const projectSummary = async (id, userId) => {
  const [rows] = await pool.execute(
    `SELECT p.*, u.name AS owner_name,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id=p.id) AS member_count
     FROM research_projects p JOIN users u ON u.id=p.owner_id
     JOIN project_members mine ON mine.project_id=p.id AND mine.user_id=?
     WHERE p.id=? LIMIT 1`, [userId, id])
  return rows[0]
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  await checkDatabase()
  res.json({ status: 'ok', database: 'connected', service: 'Uni-Reas API' })
}))
app.get('/api/health/email', asyncRoute(async (_req, res) => {
  await verifyEmailTransport()
  res.json({ status: 'ok', email: 'smtp-connected' })
}))

// Registration only creates a pending record. The user account is created after a valid OTP.
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')
  const role = ['student', 'faculty', 'researcher'].includes(req.body.role) ? req.body.role : 'student'
  const department = String(req.body.department || '').trim().slice(0, 150)
  if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Enter a name between 2 and 100 characters.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' })
  const domain = String(process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase()
  if (domain && email.split('@')[1] !== domain) return res.status(400).json({ message: `Use your university email ending in @${domain}.` })
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ message: 'Password must be 8–72 bytes long.' })

  const [existing] = await pool.execute('SELECT id FROM users WHERE email=? LIMIT 1', [email])
  if (existing.length) return res.status(409).json({ message: 'This email is already registered. Please sign in.' })

  const id = randomUUID()
  const passwordHash = await bcrypt.hash(password, 12)
  const code = String(randomInt(100000, 1000000))
  // Persist first; if SMTP fails, the user can retry registration and receive a fresh code.
  await pool.execute(
    `INSERT INTO pending_verifications
      (id,name,email,password_hash,role,department,code_hash,expires_at,attempts,last_sent_at)
     VALUES (?,?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE),0,UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE id=VALUES(id),name=VALUES(name),password_hash=VALUES(password_hash),
      role=VALUES(role),department=VALUES(department),code_hash=VALUES(code_hash),
      expires_at=VALUES(expires_at),attempts=0,last_sent_at=UTC_TIMESTAMP()`,
    [id,name,email,passwordHash,role,department,hashCode(code).toString('hex')])
  try {
    await sendVerificationEmail(email, code, name)
  } catch (error) {
    console.error('OTP email delivery failed:', error.message)
    return res.status(503).json({ message: 'Your registration is saved temporarily, but the email could not be sent. Check SMTP settings and try again.' })
  }
  res.status(200).json({ message: 'A 6-digit verification code has been sent to your email address.' })
}))

app.post('/api/auth/resend-code', asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT * FROM pending_verifications WHERE email=? LIMIT 1 FOR UPDATE', [email])
    if (!rows.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'No pending registration found. Please register again.' })
    }
    const entry = rows[0]
    const [elapsedRows] = await connection.execute(
      'SELECT GREATEST(0, 60-TIMESTAMPDIFF(SECOND,last_sent_at,UTC_TIMESTAMP())) AS wait_seconds FROM pending_verifications WHERE email=?',
      [email])
    const waitSeconds = Number(elapsedRows[0]?.wait_seconds || 0)
    if (waitSeconds > 0) {
      await connection.rollback()
      return res.status(429).json({ message: `Please wait ${waitSeconds} seconds before requesting another code.` })
    }
    const code = String(randomInt(100000, 1000000))
    try { await sendVerificationEmail(email, code, entry.name) }
    catch (error) {
      await connection.rollback()
      console.error('OTP resend delivery failed:', error.message)
      return res.status(503).json({ message: 'Email could not be sent. Check your SMTP configuration and try again.' })
    }
    await connection.execute(
      'UPDATE pending_verifications SET code_hash=?,expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 10 MINUTE),attempts=0,last_sent_at=UTC_TIMESTAMP() WHERE email=?',
      [hashCode(code).toString('hex'), email])
    await connection.commit()
    res.json({ message: 'A new verification code has been sent.' })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally { connection.release() }
}))

app.post('/api/auth/verify-email', asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const code = String(req.body.code || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Enter a valid email address and the 6-digit code.' })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT * FROM pending_verifications WHERE email=? LIMIT 1 FOR UPDATE', [email])
    if (!rows.length) {
      await connection.rollback()
      return res.status(400).json({ message: 'No pending registration found. Please register again.' })
    }
    const entry = rows[0]
    const [expiryRows] = await connection.execute(
      'SELECT (expires_at <= UTC_TIMESTAMP()) AS expired FROM pending_verifications WHERE email=?', [email])
    if (Boolean(expiryRows[0]?.expired)) {
      await connection.execute('DELETE FROM pending_verifications WHERE email=?', [email])
      await connection.commit()
      return res.status(400).json({ message: 'The code has expired. Please register again.' })
    }
    if (Number(entry.attempts) >= 5) {
      await connection.rollback()
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' })
    }
    if (!sameHash(entry.code_hash, code)) {
      await connection.execute('UPDATE pending_verifications SET attempts=attempts+1 WHERE email=?', [email])
      await connection.commit()
      return res.status(400).json({ message: 'Incorrect verification code.' })
    }
    await connection.execute(
      `INSERT INTO users (id,name,email,password_hash,role,department,verified,profile_complete,profile_picture)
       VALUES (?,?,?,?,?,?,1,0,?)`,
      [entry.id,entry.name,entry.email,entry.password_hash,entry.role,entry.department,
       `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(entry.name)}`])
    await connection.execute('DELETE FROM pending_verifications WHERE email=?', [email])
    await connection.commit()
    const [created] = await pool.execute('SELECT * FROM users WHERE id=? LIMIT 1', [entry.id])
    const user = publicUser(created[0])
    res.json({ message: 'Email verified successfully.', token: makeToken(created[0]), user })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This email is already registered.' })
    throw error
  } finally { connection.release() }
}))

app.post('/api/auth/signin', asyncRoute(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
  const [rows] = await pool.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Incorrect email or password.' })
  if (!user.verified) return res.status(403).json({ message: 'Please verify your email before signing in.' })
  res.json({ token: makeToken(user), user: publicUser(user) })
}))
app.get('/api/auth/me', authRequired, (req, res) => res.json({ user: publicUser(req.user) }))

// User directory and profile endpoints
app.get('/api/users/search', authRequired, asyncRoute(async (req, res) => {
  const q = `%${String(req.query.q || '').trim().slice(0, 80)}%`
  const department = String(req.query.department || '').trim()
  const [rows] = await pool.execute(
    `SELECT * FROM users WHERE verified=1 AND id<>?
      AND (name LIKE ? OR department LIKE ? OR COALESCE(bio,'') LIKE ?)
      AND (?='' OR department=?) ORDER BY created_at DESC LIMIT 100`,
    [req.user.id,q,q,q,department,department])
  res.json({ users: rows.map(publicUser) })
}))
app.get('/api/users/:userId/recommendations', authRequired, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE verified=1 AND id<>? ORDER BY (department=?) DESC, created_at DESC LIMIT 10',
    [req.user.id,req.user.department])
  res.json({ users: rows.map(publicUser) })
}))
app.get('/api/users/:userId', authRequired, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id=? AND verified=1 LIMIT 1', [req.params.userId])
  if (!rows.length) return res.status(404).json({ message: 'User profile not found.' })
  res.json({ user: publicUser(rows[0]) })
}))
app.put('/api/users/:userId', authRequired, asyncRoute(async (req, res) => {
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only edit your own profile.' })
  const name = String(req.body.name ?? req.user.name).trim()
  const department = String(req.body.department ?? req.user.department).trim().slice(0,150)
  const bio = String(req.body.bio ?? req.user.bio ?? '').slice(0,5000)
  const years = Math.max(0, Math.min(80, Number(req.body.yearsExperience ?? req.user.years_experience) || 0))
  const interests = Array.isArray(req.body.researchInterests) ? req.body.researchInterests.slice(0,30).map(String) : parseJson(req.user.research_interests)
  const skills = Array.isArray(req.body.skills) ? req.body.skills.slice(0,50).map(String) : parseJson(req.user.skills)
  if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Enter a valid name.' })
  await pool.execute(
    'UPDATE users SET name=?,department=?,bio=?,years_experience=?,research_interests=?,skills=?,profile_complete=1 WHERE id=?',
    [name,department,bio,years,JSON.stringify(interests),JSON.stringify(skills),req.params.userId])
  const [rows] = await pool.execute('SELECT * FROM users WHERE id=?', [req.params.userId])
  res.json({ user: publicUser(rows[0]) })
}))

// Collaboration requests
app.post('/api/collaborations/requests', authRequired, asyncRoute(async (req, res) => {
  const recipientId = String(req.body.recipientId || req.body.toUserId || '')
  const topic = String(req.body.topic || req.body.title || '').trim().slice(0,180)
  const message = String(req.body.message || '').trim().slice(0,5000)
  if (!recipientId || recipientId === req.user.id || !topic || !message) return res.status(400).json({ message: 'Recipient, topic and message are required.' })
  const [target] = await pool.execute('SELECT id FROM users WHERE id=? AND verified=1', [recipientId])
  if (!target.length) return res.status(404).json({ message: 'The selected user was not found.' })
  const id = randomUUID()
  await pool.execute('INSERT INTO collaboration_requests (id,sender_id,recipient_id,topic,message) VALUES (?,?,?,?,?)',
    [id,req.user.id,recipientId,topic,message])
  await notify(recipientId,'New collaboration request',`${req.user.name} sent you a request: ${topic}`)
  res.status(201).json({ id,status:'pending',message:'Collaboration request sent.' })
}))
app.get('/api/collaborations/requests', authRequired, asyncRoute(async (req, res) => {
  const status = ['pending','accepted','rejected'].includes(req.query.status) ? req.query.status : ''
  const [rows] = await pool.execute(
    `SELECT cr.*,s.name AS sender_name,s.email AS sender_email,r.name AS recipient_name
     FROM collaboration_requests cr JOIN users s ON s.id=cr.sender_id JOIN users r ON r.id=cr.recipient_id
     WHERE (cr.sender_id=? OR cr.recipient_id=?) AND (?='' OR cr.status=?)
     ORDER BY cr.created_at DESC LIMIT 200`,
    [req.user.id,req.user.id,status,status])
  res.json({ requests: rows })
}))
app.put('/api/collaborations/requests/:requestId', authRequired, asyncRoute(async (req, res) => {
  const status = String(req.body.status || '')
  if (!['accepted','rejected'].includes(status)) return res.status(400).json({ message: 'Status must be accepted or rejected.' })
  const [rows] = await pool.execute('SELECT * FROM collaboration_requests WHERE id=? AND recipient_id=? LIMIT 1',
    [req.params.requestId,req.user.id])
  if (!rows.length) return res.status(404).json({ message: 'Collaboration request not found.' })
  if (rows[0].status !== 'pending') return res.status(409).json({ message: 'This request has already been answered.' })
  await pool.execute('UPDATE collaboration_requests SET status=? WHERE id=?', [status,req.params.requestId])
  await notify(rows[0].sender_id,'Collaboration request updated',`${req.user.name} ${status} your request.`,status==='accepted'?'success':'warning')
  res.json({ message:`Request ${status}.`,status })
}))
app.get('/api/collaborations', authRequired, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT DISTINCT p.* FROM research_projects p JOIN project_members pm ON pm.project_id=p.id
     WHERE pm.user_id=? ORDER BY p.updated_at DESC`, [req.user.id])
  res.json({ collaborations: rows })
}))

// Research projects and team chat
app.get('/api/projects', authRequired, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT p.*,u.name AS owner_name,(SELECT COUNT(*) FROM project_members pm WHERE pm.project_id=p.id) AS member_count
     FROM research_projects p JOIN project_members mine ON mine.project_id=p.id AND mine.user_id=?
     JOIN users u ON u.id=p.owner_id ORDER BY p.updated_at DESC`, [req.user.id])
  res.json({ projects: rows })
}))
app.post('/api/projects', authRequired, asyncRoute(async (req, res) => {
  const title = String(req.body.title || req.body.name || '').trim().slice(0,180)
  const description = String(req.body.description || '').trim()
  const domain = String(req.body.researchDomain || req.body.domain || '').trim().slice(0,120)
  if (title.length < 3 || !description) return res.status(400).json({ message: 'Project title and description are required.' })
  const id = randomUUID()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('INSERT INTO research_projects (id,owner_id,title,description,research_domain) VALUES (?,?,?,?,?)',
      [id,req.user.id,title,description,domain])
    await connection.execute('INSERT INTO project_members (project_id,user_id,role) VALUES (?,?,?)', [id,req.user.id,'owner'])
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error }
  finally { connection.release() }
  res.status(201).json({ id,title,description,researchDomain:domain,status:'open',message:'Project created.' })
}))
app.get('/api/projects/:projectId', authRequired, asyncRoute(async (req, res) => {
  const project = await projectSummary(req.params.projectId,req.user.id)
  if (!project) return res.status(404).json({ message: 'Project not found or you are not a member.' })
  const [members] = await pool.execute(
    'SELECT u.id,u.name,u.role,u.department,u.profile_picture FROM project_members pm JOIN users u ON u.id=pm.user_id WHERE pm.project_id=?',
    [req.params.projectId])
  res.json({ project:{...project,members} })
}))
app.get('/api/projects/:projectId/messages', authRequired, asyncRoute(async (req, res) => {
  const project = await projectSummary(req.params.projectId,req.user.id)
  if (!project) return res.status(404).json({ message: 'Project not found or you are not a member.' })
  const [rows] = await pool.execute(
    'SELECT m.id,m.message,m.created_at,u.id AS user_id,u.name,u.profile_picture FROM project_messages m JOIN users u ON u.id=m.sender_id WHERE m.project_id=? ORDER BY m.created_at ASC LIMIT 500',
    [req.params.projectId])
  res.json({ messages: rows })
}))
app.post('/api/projects/:projectId/messages', authRequired, asyncRoute(async (req, res) => {
  const project = await projectSummary(req.params.projectId,req.user.id)
  if (!project) return res.status(404).json({ message: 'Project not found or you are not a member.' })
  const message = String(req.body.message || '').trim()
  if (!message || message.length > 5000) return res.status(400).json({ message: 'Message must contain 1–5000 characters.' })
  const id = randomUUID()
  await pool.execute('INSERT INTO project_messages (id,project_id,sender_id,message) VALUES (?,?,?,?)',
    [id,req.params.projectId,req.user.id,message])
  res.status(201).json({ id,message,senderId:req.user.id,createdAt:new Date().toISOString() })
}))

// Notifications
app.get('/api/notifications', authRequired, asyncRoute(async (req,res) => {
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100',[req.user.id])
  res.json({ notifications:rows })
}))
app.patch('/api/notifications/:notificationId/read', authRequired, asyncRoute(async (req,res) => {
  const [result] = await pool.execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[req.params.notificationId,req.user.id])
  if (!result.affectedRows) return res.status(404).json({ message:'Notification not found.' })
  res.json({ message:'Notification marked as read.' })
}))

// Admin APIs: only an existing admin account can access these routes.
app.use('/api/admin', authRequired, adminRequired)
app.get('/api/admin/stats', asyncRoute(async (_req,res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS totalUsers, SUM(role IN ("student","faculty","researcher")) AS activeResearchers FROM users WHERE verified=1')
  const [[projects]] = await pool.query('SELECT COUNT(*) AS activeProjects FROM research_projects WHERE status IN ("open","active")')
  const [[requests]] = await pool.query('SELECT COUNT(*) AS approvedRequests FROM collaboration_requests WHERE status="accepted"')
  res.json({ totalUsers:Number(users.totalUsers),activeResearchers:Number(users.activeResearchers||0),activeProjects:Number(projects.activeProjects),approvedRequests:Number(requests.approvedRequests) })
}))
app.get('/api/admin/users', asyncRoute(async (req,res) => {
  const page=Math.max(1,Number(req.query.page)||1), limit=Math.min(100,Math.max(1,Number(req.query.limit)||10))
  const [rows]=await pool.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',[limit,(page-1)*limit])
  const [[count]]=await pool.query('SELECT COUNT(*) AS total FROM users')
  res.json({ users:rows.map(publicUser),page,limit,total:Number(count.total) })
}))
app.put('/api/admin/users/:userId', asyncRoute(async (req,res) => {
  const role=['student','faculty','researcher','admin'].includes(req.body.role)?req.body.role:null
  const verified=typeof req.body.verified==='boolean'?req.body.verified:null
  if (role===null && verified===null) return res.status(400).json({ message:'Provide a valid role or verified value.' })
  await pool.execute('UPDATE users SET role=COALESCE(?,role),verified=COALESCE(?,verified) WHERE id=?',[role,verified,req.params.userId])
  const [rows]=await pool.execute('SELECT * FROM users WHERE id=?',[req.params.userId])
  if (!rows.length) return res.status(404).json({ message:'User not found.' })
  res.json({ user:publicUser(rows[0]) })
}))
app.delete('/api/admin/users/:userId', asyncRoute(async (req,res) => {
  if (req.params.userId===req.user.id) return res.status(400).json({ message:'You cannot delete your own admin account.' })
  const [result]=await pool.execute('DELETE FROM users WHERE id=?',[req.params.userId])
  if (!result.affectedRows) return res.status(404).json({ message:'User not found.' })
  res.json({ message:'User deleted.' })
}))
app.get('/api/admin/collaboration-requests', asyncRoute(async (req,res) => {
  const status=['pending','accepted','rejected'].includes(req.query.status)?req.query.status:''
  const [rows]=await pool.execute(
    `SELECT cr.*,s.name AS sender_name,r.name AS recipient_name FROM collaboration_requests cr
     JOIN users s ON s.id=cr.sender_id JOIN users r ON r.id=cr.recipient_id
     WHERE (?='' OR cr.status=?) ORDER BY cr.created_at DESC LIMIT 500`,[status,status])
  res.json({ requests:rows })
}))

app.use((req,res) => res.status(404).json({ message:`API route not found: ${req.method} ${req.path}` }))
app.use((error,_req,res,_next) => {
  console.error('API error:',error.code || error.name,error.message)
  if (res.headersSent) return
  if (error.code === 'ER_NO_SUCH_TABLE') return res.status(503).json({ message:'Database tables are missing. Run server/database/schema.sql in MySQL Workbench.' })
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_BAD_DB_ERROR') {
    return res.status(503).json({ message:'Database connection failed. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME in .env.local.' })
  }
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message:'Invalid JSON request body.' })
  res.status(500).json({ message:'Unexpected server error. Check the backend terminal for details.' })
})

const server = app.listen(PORT, async () => {
  console.log(`Uni-Reas API listening at http://localhost:${PORT}`)
  try { await checkDatabase(); console.log('MySQL database connected.') }
  catch (error) { console.error('MySQL is not ready:',error.message) }
})
const shutdown = async () => {
  server.close(async () => { await pool.end(); process.exit(0) })
}
process.on('SIGINT',shutdown)
process.on('SIGTERM',shutdown)
