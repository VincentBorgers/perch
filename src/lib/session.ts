import crypto from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE_NAME = 'perch_session'
const MAX_AGE = 60 * 60 * 24 * 7 // seven days in seconds

function secret(): string {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short. Run "npm run setup" or set it in .env')
  }
  return value
}

function sign(body: string): string {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url')
}

export function createSession(): string {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false
  const [body, sig] = token.split('.')
  if (!body || !sig) return false

  const expected = sign(body)
  if (sig.length !== expected.length) return false
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString()) as { exp?: number }
    return typeof parsed.exp === 'number' && parsed.exp > Date.now()
  } catch {
    return false
  }
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies()
  return verifySession(store.get(COOKIE_NAME)?.value)
}

export const cookieOptions = {
  httpOnly: true as const,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
}
