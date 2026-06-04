const WINDOW_MS = 10 * 60 * 1000 // ten minutes
const MAX_ATTEMPTS = 10

const attempts = new Map<string, number[]>()

/** Returns true when the request is allowed, false when the limit is reached. */
export function allowAttempt(key: string): boolean {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  attempts.set(key, recent)
  return recent.length <= MAX_ATTEMPTS
}
