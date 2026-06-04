import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/session'
import { getData } from '@/lib/store'
import { Editor } from './Editor'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAuthed())) {
    redirect('/admin/login')
  }
  const { profile, links, theme } = await getData()
  return <Editor initial={{ profile, links, theme }} />
}
