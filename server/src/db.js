import mysql from 'mysql2/promise'

const required = ['DB_HOST', 'DB_USER', 'DB_NAME']
const missing = required.filter(key => !process.env[key])
if (missing.length) {
  console.warn(`Database configuration is incomplete; missing: ${missing.join(', ')}`)
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'uni_reas',
  waitForConnections: true,
  connectionLimit: Math.min(Math.max(Number(process.env.DB_CONNECTION_LIMIT || 10), 1), 30),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  dateStrings: true
})

export async function checkDatabase() {
  const absent = required.filter(key => !process.env[key])
  if (absent.length) throw new Error(`Missing database settings: ${absent.join(', ')}. Check root .env.local.`)
  await pool.query('SELECT 1')
}
