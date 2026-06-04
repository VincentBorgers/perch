import type { CSSProperties } from 'react'
import type { AvatarShape, Profile, Theme } from '@/lib/types'
import { safeHref } from '@/lib/url'
import { SocialIcon } from './SocialIcon'

const FONT_STACKS: Record<Theme['font'], string> = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  rounded: 'ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, sans-serif',
}

const AVATAR_RADIUS: Record<AvatarShape, string> = {
  circle: '9999px',
  rounded: '20px',
  square: '0px',
}

function backgroundStyle(theme: Theme): CSSProperties {
  if (theme.backgroundType === 'gradient') {
    return { backgroundImage: `linear-gradient(${theme.gradientAngle}deg, ${theme.bgColor1}, ${theme.bgColor2})` }
  }
  if (theme.backgroundType === 'image' && theme.bgImageUrl) {
    return {
      backgroundImage: `url("${theme.bgImageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { backgroundColor: theme.bgColor1 }
}

function buttonStyle(theme: Theme): CSSProperties {
  const base: CSSProperties = {
    borderRadius: `${theme.buttonRadius}px`,
    color: theme.buttonTextColor,
  }
  if (theme.buttonStyle === 'outline') {
    return { ...base, background: 'transparent', border: `2px solid ${theme.buttonColor}`, color: theme.buttonColor }
  }
  if (theme.buttonStyle === 'soft') {
    return { ...base, background: `${theme.buttonColor}22`, color: theme.buttonColor }
  }
  return { ...base, background: theme.buttonColor }
}

export function BioView({
  profile,
  links,
  theme,
}: {
  profile: Profile
  links: { id: string; title: string; url: string; enabled: boolean }[]
  theme: Theme
}) {
  const visibleLinks = links.filter((link) => link.enabled && link.url)
  const initials = profile.name.trim().slice(0, 1).toUpperCase() || '?'

  return (
    <div
      style={{
        ...backgroundStyle(theme),
        color: theme.textColor,
        fontFamily: FONT_STACKS[theme.font],
        minHeight: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '56px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: AVATAR_RADIUS[theme.avatarShape],
            overflow: 'hidden',
            background: `${theme.buttonColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            fontWeight: 600,
          }}
        >
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {profile.name ? (
          <h1 style={{ margin: '18px 0 0', fontSize: 24, fontWeight: 700 }}>{profile.name}</h1>
        ) : null}

        {profile.bio ? (
          <p style={{ margin: '8px 0 0', fontSize: 15, opacity: 0.85, maxWidth: 420 }}>{profile.bio}</p>
        ) : null}

        <div style={{ width: '100%', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              className="perch-link"
              href={safeHref(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...buttonStyle(theme),
                display: 'block',
                padding: '15px 18px',
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {link.title}
            </a>
          ))}
        </div>

        {profile.socials.length > 0 ? (
          <div style={{ marginTop: 28, display: 'flex', gap: 18, color: theme.textColor }}>
            {profile.socials.map((social, index) => (
              <a
                key={`${social.platform}-${index}`}
                className="perch-link"
                href={safeHref(social.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', opacity: 0.9, display: 'inline-flex' }}
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        ) : null}

        <footer style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
          <a
            href="https://github.com/VincentBorgers/perch"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Built with Perch
          </a>
        </footer>
      </div>
    </div>
  )
}
