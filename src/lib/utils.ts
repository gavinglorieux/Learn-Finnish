// Small helpers.

export const shuffle = <T,>(arr: readonly T[]): T[] => {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const sample = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const sampleN = <T,>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, Math.min(n, arr.length))

export const distinct = <T,>(arr: readonly T[]): T[] => Array.from(new Set(arr))

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    // keep Finnish special chars
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/\s+/g, ' ')

// Loose equality for typing — ignores punctuation and case.
export const answerMatches = (input: string, target: string): boolean => {
  const a = normalize(input).replace(/[.!?,]/g, '')
  const b = normalize(target).replace(/[.!?,]/g, '')
  return a === b
}

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export const percent = (n: number) => `${Math.round(n * 100)}%`

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

export const randomId = () => Math.random().toString(36).slice(2, 10)
