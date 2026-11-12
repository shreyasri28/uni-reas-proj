import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const express = (await import('express')).default
const cors = (await import('cors')).default
const helmet = (await import('helmet')).default
const rateLimit = (await import('express-rate-limit')).default
const bcrypt = (await import('bcryptjs')).default
const jwt = (await import('jsonwebtoken')).default
const { randomInt, randomUUID, createHash, timingSafeEqual } = await import('node:crypto')
const { pool, checkDatabase } = await import('./db.js')
const { sendVerificationEmail } = await import('./mailer.js')

const app = express()
const PORT = Number(process.env.PORT || 3000)
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Set JWT_SECRET in .env.local to a random string of at least 32 characters.')
  process.exit(1)
}

app.use(helmet())
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(v => v.trim()),
  credentials: true
}))
app.use(express.json({ limit: '20kb' }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }))

const normalizeEmail = value => String(value || '').trim().toLowerCase()
const hashCode = code => createHash('sha256').update(code).digest()
const sameHash = (left, right) => {
  const a = Buffer.from(left, 'hex')
  const b = hashCode(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
const makeToken = user => jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' })
const publicUser = row => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
  verified: Boolean(row.verified),
  profileComplete: Boolean(row.profile_complete),
  profilePicture: row.profile_picture || null,
  createdAt: row.created_at
})

const authRequired = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const payload = jwt.verify(token, JWT_SECRET)
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? AND verified = 1 LIMIT 1', [payload.sub])

    if (!rows.length) {
      return res.status(401).json({ message: 'Please sign in again.' })
    }

    req.user = rows[0]
    return next()
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' })
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase()
    return res.json({ status: 'ok', database: 'connected', service: 'Uni-Reas API' })
  } catch (error) {
    console.error('Health check database error:', error.message)
    return res.status(503).json({ status: 'error', database: 'disconnected', service: 'Uni-Reas API' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = normalizeEmail(req.body.email)
    const password = String(req.body.password || '')
    const role = ['student', 'faculty', 'researcher'].includes(req.body.role) ? req.body.role : 'student'
    const department = String(req.body.department || '').trim()

    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: 'Enter a valid full name.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' })

    const domain = String(process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase()
    if (domain && email.split('@')[1] !== domain) {
      return res.status(400).json({ message: `Use your university email ending in @${domain}.` })
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' })
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const code = String(randomInt(100000, 1000000))
    const id = randomUUID()
    await sendVerificationEmail(email, code, name)

    await pool.execute(
      `INSERT INTO pending_verifications
       (id, name, email, password_hash, role, department, code_hash, expires_at, attempts, last_sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), 0, UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE id=VALUES(id), name=VALUES(name), password_hash=VALUES(password_hash),
       role=VALUES(role), department=VALUES(department), code_hash=VALUES(code_hash),
       expires_at=VALUES(expires_at), attempts=0, last_sent_at=UTC_TIMESTAMP()`,
      [id, name, email, passwordHash, role, department, hashCode(code).toString('hex')]
    )

    return res.status(200).json({ message: 'A 6-digit verification code has been sent to your email address.' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' })
    console.error('Registration error:', error)
    return res.status(503).json({ message: error.message.includes('not configured') ? error.message : 'Registration could not be completed. Check database and email settings.' })
  }
})

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const [rows] = await pool.execute('SELECT * FROM pending_verifications WHERE email = ? LIMIT 1', [email])

    if (!rows.length) return res.status(404).json({ message: 'Registration not found. Please register again.' })

    const entry = rows[0]
    const secondsSinceLastSent = Math.floor((Date.now() - new Date(entry.last_sent_at).getTime()) / 1000)

    if (secondsSinceLastSent < 60) {
      return res.status(429).json({ message: `Please wait ${60 - secondsSinceLastSent} seconds before requesting another code.` })
    }

    const code = String(randomInt(100000, 1000000))
    await sendVerificationEmail(email, code, entry.name)

    await pool.execute(
      `UPDATE pending_verifications SET code_hash = ?, expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE),
       attempts = 0, last_sent_at = UTC_TIMESTAMP() WHERE email = ?`,
      [hashCode(code).toString('hex'), email]
    )

    return res.json({ message: 'A new verification code has been sent.' })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(503).json({ message: 'Could not resend the code. Check email settings and try again.' })
  }
})

app.post('/api/auth/verify-email', async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const code = String(req.body.code || '').trim()

  if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({ message: 'Enter the 6-digit code.' })

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT * FROM pending_verifications WHERE email = ? LIMIT 1 FOR UPDATE', [email])

    if (!rows.length) {
      await connection.rollback()
      return res.status(400).json({ message: 'No pending registration found. Please register again.' })
    }

    const entry = rows[0]
    if (new Date(entry.expires_at).getTime() < Date.now()) {
      await connection.execute('DELETE FROM pending_verifications WHERE email = ?', [email])
      await connection.commit()
      return res.status(400).json({ message: 'The code has expired. Please register again.' })
    }

    if (entry.attempts >= 5) {
      await connection.rollback()
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' })
    }

    if (!sameHash(entry.code_hash, code)) {
      await connection.execute('UPDATE pending_verifications SET attempts = attempts + 1 WHERE email = ?', [email])
      await connection.commit()
      return res.status(400).json({ message: 'Incorrect verification code.' })
    }

    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role, department, verified, profile_complete, profile_picture)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0, ? )`,
      [entry.id, entry.name, entry.email, entry.password_hash, entry.role, entry.department,
       `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(entry.name)}`]
    )

    await connection.execute('DELETE FROM pending_verifications WHERE email = ?', [email])
    await connection.commit()

    const user = {
      id: entry.id,
      name: entry.name,
      email: entry.email,
      role: entry.role,
      department: entry.department,
      verified: true,
      profile_complete: 0,
      profile_picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(entry.name)}`,
      created_at: new Date()
    }

    return res.json({ message: 'Email verified successfully.', token: makeToken(user), user: publicUser(user) })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This email is already registered.' })
    console.error('Verification error:', error)
    return res.status(500).json({ message: 'Email verification failed.' })
  } finally {
    connection.release()
  }
})

app.post('/api/auth/signin', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const password = String(req.body.password || '')
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
    const user = rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' })
    }

    if (!user.verified) return res.status(403).json({ message: 'Please verify your email before signing in.' })

    return res.json({ token: makeToken(user), user: publicUser(user) })
  } catch (error) {
    console.error('Sign in error:', error)
    return res.status(500).json({ message: 'Sign in failed. Please try again.' })
  }
})

app.get('/api/auth/me', authRequired, (req, res) => res.json({ user: publicUser(req.user) }))

app.listen(PORT, async () => {
  try {
    await checkDatabase()
    console.log('MySQL database connected.')
  } catch (error) {
    console.error('MySQL connection failed:', error.message)
    console.error('Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME and create the schema in server/database/schema.sql.')
  }

  console.log(`Uni-Reas API running at http://localhost:${PORT}`)
})
