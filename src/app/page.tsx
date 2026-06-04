import type { Metadata } from 'next'
import { BioView } from '@/components/BioView'
import { getData } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getData()
  return {
    title: profile.name || 'Perch',
    description: profile.bio || 'A self hosted link in bio page.',
  }
}

export default async function HomePage() {
  const { profile, links, theme } = await getData()
  return <BioView profile={profile} links={links} theme={theme} />
}
