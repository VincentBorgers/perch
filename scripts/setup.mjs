import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

const root = process.cwd()
const dataDir = process.env.PERCH_DATA_DIR ? path.resolve(process.env.PERCH_DATA_DIR) : path.join(root, 'data')
const dataFile = path.join(dataDir, 'db.json')
const envFile = path.join(root, '.env')

const password = process.argv[2] || process.env.ADMIN_PASSWORD || ''

if (!password) {
  console.error('Usage: npm run setup <password>')
  console.error('Or:    ADMIN_PASSWORD=<password> npm run setup')
  process.exit(1)
}

if (password.length < 8) {
  console.error('Please use a password of at least 8 characters.')
  process.exit(1)
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {
    return {}
  }
}

async function writeAdminPassword() {
  const data = await readJson(dataFile)
  data.auth = { passwordHash: bcrypt.hashSync(password, 12) }
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8')
}

async function ensureSessionSecret() {
  let lines = []
  try {
    lines = (await fs.readFile(envFile, 'utf8')).split(/\r?\n/)
  } catch {
    lines = []
  }

  const index = lines.findIndex((line) => line.startsWith('SESSION_SECRET='))
  const hasValue = index >= 0 && lines[index].slice('SESSION_SECRET='.length).trim().length > 0
  if (hasValue) {
    return false
  }

  const secret = crypto.randomBytes(32).toString('base64url')
  if (index >= 0) {
    lines[index] = `SESSION_SECRET=${secret}`
  } else {
    lines.push(`SESSION_SECRET=${secret}`)
  }
  await fs.writeFile(envFile, lines.join('\n').replace(/\n+$/, '\n'), 'utf8')
  return true
}

await writeAdminPassword()
const createdSecret = await ensureSessionSecret()

console.log('Admin password saved to', path.relative(root, dataFile))
console.log(createdSecret ? 'A new SESSION_SECRET was written to .env' : 'SESSION_SECRET already set, left as is')
console.log('Done. Start the app with "npm run dev".')
