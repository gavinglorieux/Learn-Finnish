// Typed localStorage wrapper. Falls back to an in-memory map when localStorage is unavailable.

const mem = new Map<string, string>()

const ls = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null
    // Probe availability (Safari private mode etc.)
    window.localStorage.setItem('__probe', '1')
    window.localStorage.removeItem('__probe')
    return window.localStorage
  } catch {
    return null
  }
}

export const get = <T>(key: string, fallback: T): T => {
  const store = ls()
  const raw = store ? store.getItem(key) : mem.get(key) ?? null
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const set = <T>(key: string, value: T): void => {
  const raw = JSON.stringify(value)
  const store = ls()
  if (store) store.setItem(key, raw)
  else mem.set(key, raw)
}

export const remove = (key: string): void => {
  const store = ls()
  if (store) store.removeItem(key)
  else mem.delete(key)
}

export const STORAGE_KEYS = {
  progress: 'lf.progress.v1',
  srs: 'lf.srs.v1',
  settings: 'lf.settings.v1'
} as const
