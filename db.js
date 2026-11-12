import mysql from 'mysql2/promise'

const required = ['DB_HOST', 'DB_USER', 'DB_NAME']
const hasDatabaseConfig = required.every(key => Boolean(process.env[key]))

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uni_reas',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
})

export async function checkDatabase() {
  if (!hasDatabaseConfig) {
    throw new Error('Database not configured. Add DB_HOST, DB_USER, and DB_NAME to .env.local.')
  }
  await pool.query('SELECT 1')
}
