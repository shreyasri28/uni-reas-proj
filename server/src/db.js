import mysql from 'mysql2/promise'

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PASSWORD']

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
})

export async function checkDatabase() {
  const missing = required.filter(key => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing ${missing.join(', ')} in .env.local`)
  }

  await pool.query('SELECT 1')
}
