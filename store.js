import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data')
const usersFile = path.join(dataDir, 'users.json')
const pendingFile = path.join(dataDir, 'pending-verifications.json')

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}
async function writeJson(file, value) {
  await fs.mkdir(dataDir, { recursive: true })
  const temp = file + '.tmp'
  await fs.writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 })
  await fs.rename(temp, file)
}
export const getUsers = () => readJson(usersFile, [])
export const saveUsers = users => writeJson(usersFile, users)
export const getPending = () => readJson(pendingFile, [])
export const savePending = entries => writeJson(pendingFile, entries)
