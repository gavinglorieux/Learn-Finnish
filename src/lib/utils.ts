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

/** Keep the first element for each key (e.g. one word per English gloss). */
export const uniqueBy = <T,>(arr: readonly T[], key: (t: T) => string): T[] => {
  const seen = new Set<string>()
  return arr.filter((t) => {
    const k = key(t)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    // keep Finnish special chars
    .replace(/[‘’']/g, "'")
    // en/em dashes typed as a plain hyphen (ei – eikä)
    .replace(/[–—]/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')

const stripPunctuation = (s: string) => normalize(s).replace(/[.!?,]/g, '').trim()

/** Key for comparing glosses: "the grandma", "grandma (mother's side)" and "Grandma" all collide. */
export const glossKey = (s: string) =>
  stripPunctuation(s).replace(/\s*\(.*?\)\s*/g, ' ').replace(/^(to|the|a|an) /, '').trim()

/**
 * Forms of a vocabulary entry a learner may legitimately type: the entry itself, and
 * for "mitä (sinulle) kuuluu?" both with and without the optional part in brackets.
 */
export const answerVariants = (target: string): string[] => {
  const out = [target]
  if (/\(.+?\)/.test(target)) {
    out.push(target.replace(/\s*\(.+?\)\s*/g, ' '))
    out.push(target.replace(/[()]/g, ''))
  }
  return distinct(out.map((t) => t.trim()))
}

// Loose equality for typing — ignores punctuation, case and bracketed optional parts.
export const answerMatches = (input: string, target: string): boolean => {
  const a = stripPunctuation(input)
  return answerVariants(target).some((t) => stripPunctuation(t) === a)
}

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export const percent = (n: number) => `${Math.round(n * 100)}%`

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

export const randomId = () => Math.random().toString(36).slice(2, 10)
