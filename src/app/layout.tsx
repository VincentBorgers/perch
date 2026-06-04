import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Perch',
  description: 'A self hosted link in bio page.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  )
}
