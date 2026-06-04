'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
        return
      }
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Login failed')
    } catch {
      setError('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your admin password to edit your page.</p>

        <label className="block mt-5 text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
