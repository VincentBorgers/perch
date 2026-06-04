import bcrypt from 'bcryptjs'
import { getData } from './store'

export async function verifyPassword(plain: string): Promise<boolean> {
  if (!plain) return false
  const { auth } = await getData()
  if (!auth.passwordHash) return false
  return bcrypt.compare(plain, auth.passwordHash)
}
