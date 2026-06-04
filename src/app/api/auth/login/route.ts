import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth'
import { createSession, COOKIE_NAME, cookieOptions } from '@/lib/session'
import { allowAttempt } from '@/lib/ratelimit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!allowAttempt(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const password = typeof (body as { password?: unknown })?.password === 'string'
    ? (body as { password: string }).password
    : ''

  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, createSession(), cookieOptions)
  return response
}
