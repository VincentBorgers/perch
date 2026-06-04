'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BioView } from '@/components/BioView'
import type {
  Content,
  FontChoice,
  LinkItem,
  SocialItem,
  SocialPlatform,
  Theme,
} from '@/lib/types'

const PLATFORMS: SocialPlatform[] = [
  'instagram',
  'x',
  'youtube',
  'tiktok',
  'linkedin',
  'github',
  'email',
  'website',
]

const FONTS: { value: FontChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'rounded', label: 'Rounded' },
]

function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const copy = list.slice()
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

export function Editor({ initial }: { initial: Content }) {
  const router = useRouter()
  const [content, setContent] = useState<Content>(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const { profile, links, theme } = content

  function patchProfile(patch: Partial<typeof profile>) {
    setContent((c) => ({ ...c, profile: { ...c.profile, ...patch } }))
  }
  function patchTheme(patch: Partial<Theme>) {
    setContent((c) => ({ ...c, theme: { ...c.theme, ...patch } }))
  }
  function setLinks(next: LinkItem[]) {
    setContent((c) => ({ ...c, links: next }))
  }
  function setSocials(next: SocialItem[]) {
    patchProfile({ socials: next })
  }

  async function save() {
    setStatus('saving')
    setMessage('')
    try {
      const res = await fetch('/api/admin/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 1500)
        return
      }
      const data = await res.json().catch(() => ({}))
      setStatus('error')
      setMessage(data.error || 'Could not save')
    } catch {
      setStatus('error')
      setMessage('Could not reach the server')
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-slate-900">Perch admin</span>
          <div className="flex items-center gap-3">
            {status === 'saved' ? <span className="text-sm text-green-600">Saved</span> : null}
            {status === 'error' ? <span className="text-sm text-red-600">{message}</span> : null}
            <a href="/" target="_blank" className="text-sm text-slate-600 hover:text-slate-900">
              View page
            </a>
            <button
              onClick={save}
              disabled={status === 'saving'}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm text-white font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {status === 'saving' ? 'Saving' : 'Save'}
            </button>
            <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <Section title="Profile">
            <Field label="Name">
              <input
                className={inputClass}
                value={profile.name}
                onChange={(e) => patchProfile({ name: e.target.value })}
              />
            </Field>
            <Field label="Bio">
              <textarea
                className={inputClass}
                rows={2}
                value={profile.bio}
                onChange={(e) => patchProfile({ bio: e.target.value })}
              />
            </Field>
            <Field label="Avatar image URL">
              <input
                className={inputClass}
                placeholder="https://..."
                value={profile.avatarUrl}
                onChange={(e) => patchProfile({ avatarUrl: e.target.value })}
              />
            </Field>
          </Section>

          <Section title="Links">
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={link.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) =>
                        setLinks(links.map((l) => (l.id === link.id ? { ...l, title: e.target.value } : l)))
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      className={inputClass}
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) =>
                        setLinks(links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <label className="flex items-center gap-2 text-slate-600">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) =>
                          setLinks(links.map((l) => (l.id === link.id ? { ...l, enabled: e.target.checked } : l)))
                        }
                      />
                      Visible
                    </label>
                    <div className="flex items-center gap-2">
                      <button className={ghostBtn} onClick={() => setLinks(move(links, index, index - 1))}>
                        Up
                      </button>
                      <button className={ghostBtn} onClick={() => setLinks(move(links, index, index + 1))}>
                        Down
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => setLinks(links.filter((l) => l.id !== link.id))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setLinks([...links, { id: newId(), title: '', url: '', enabled: true }])}
            >
              Add link
            </button>
          </Section>

          <Section title="Social icons">
            <div className="space-y-3">
              {profile.socials.map((social, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    className={`${inputClass} max-w-[140px]`}
                    value={social.platform}
                    onChange={(e) =>
                      setSocials(
                        profile.socials.map((s, i) =>
                          i === index ? { ...s, platform: e.target.value as SocialPlatform } : s,
                        ),
                      )
                    }
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder={social.platform === 'email' ? 'mailto:you@example.com' : 'https://...'}
                    value={social.url}
                    onChange={(e) =>
                      setSocials(profile.socials.map((s, i) => (i === index ? { ...s, url: e.target.value } : s)))
                    }
                  />
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => setSocials(profile.socials.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setSocials([...profile.socials, { platform: 'website', url: '' }])}
            >
              Add social
            </button>
          </Section>

          <Section title="Theme">
            <Field label="Background">
              <select
                className={inputClass}
                value={theme.backgroundType}
                onChange={(e) => patchTheme({ backgroundType: e.target.value as Theme['backgroundType'] })}
              >
                <option value="solid">Solid color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label={theme.backgroundType === 'gradient' ? 'Color one' : 'Background color'}
                value={theme.bgColor1}
                onChange={(v) => patchTheme({ bgColor1: v })}
              />
              {theme.backgroundType === 'gradient' ? (
                <ColorField label="Color two" value={theme.bgColor2} onChange={(v) => patchTheme({ bgColor2: v })} />
              ) : null}
            </div>

            {theme.backgroundType === 'gradient' ? (
              <Field label={`Gradient angle (${theme.gradientAngle})`}>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={theme.gradientAngle}
                  onChange={(e) => patchTheme({ gradientAngle: Number(e.target.value) })}
                  className="w-full"
                />
              </Field>
            ) : null}

            {theme.backgroundType === 'image' ? (
              <Field label="Background image URL">
                <input
                  className={inputClass}
                  placeholder="https://..."
                  value={theme.bgImageUrl}
                  onChange={(e) => patchTheme({ bgImageUrl: e.target.value })}
                />
              </Field>
            ) : null}

            <ColorField label="Text color" value={theme.textColor} onChange={(v) => patchTheme({ textColor: v })} />

            <Field label="Button style">
              <select
                className={inputClass}
                value={theme.buttonStyle}
                onChange={(e) => patchTheme({ buttonStyle: e.target.value as Theme['buttonStyle'] })}
              >
                <option value="solid">Solid</option>
                <option value="soft">Soft</option>
                <option value="outline">Outline</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Button color"
                value={theme.buttonColor}
                onChange={(v) => patchTheme({ buttonColor: v })}
              />
              <ColorField
                label="Button text"
                value={theme.buttonTextColor}
                onChange={(v) => patchTheme({ buttonTextColor: v })}
              />
            </div>

            <Field label={`Corner radius (${theme.buttonRadius}px)`}>
              <input
                type="range"
                min={0}
                max={40}
                value={theme.buttonRadius}
                onChange={(e) => patchTheme({ buttonRadius: Number(e.target.value) })}
                className="w-full"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Font">
                <select
                  className={inputClass}
                  value={theme.font}
                  onChange={(e) => patchTheme({ font: e.target.value as FontChoice })}
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Avatar shape">
                <select
                  className={inputClass}
                  value={theme.avatarShape}
                  onChange={(e) => patchTheme({ avatarShape: e.target.value as Theme['avatarShape'] })}
                >
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                </select>
              </Field>
            </div>
          </Section>
        </div>

        <div className="lg:sticky lg:top-20 h-fit">
          <p className="text-sm font-medium text-slate-500 mb-2">Live preview</p>
          <div className="rounded-[28px] border-4 border-slate-800 overflow-hidden shadow-lg bg-black">
            <div style={{ height: 640, overflowY: 'auto' }}>
              <BioView profile={profile} links={links} theme={theme} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400'

const ghostBtn = 'rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 rounded border border-slate-300 bg-white p-0.5"
        />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  )
}
