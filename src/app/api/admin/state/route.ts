import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { isAuthed } from '@/lib/session'
import { getData, saveContent } from '@/lib/store'
import { parseContent } from '@/lib/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { profile, links, theme } = await getData()
  return NextResponse.json({ profile, links, theme })
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  try {
    const content = parseContent(body)
    await saveContent(content)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.errors[0]
      const where = first?.path.join('.') || 'input'
      return NextResponse.json({ error: `${where}: ${first?.message || 'invalid'}` }, { status: 422 })
    }
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}
