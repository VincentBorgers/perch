const ALLOWED = new Set(['http:', 'https:', 'mailto:'])

/** Returns the url when it uses a safe scheme, otherwise a harmless fallback. */
export function safeHref(url: string): string {
  try {
    const parsed = new URL(url)
    return ALLOWED.has(parsed.protocol) ? url : '#'
  } catch {
    return '#'
  }
}
