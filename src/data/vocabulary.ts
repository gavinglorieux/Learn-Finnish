// Thin adapter over content.ts so pages/exercises can keep their Word/Category imports.
// Words and groups come from content/vocab.json — edit content/, not this file.

import { VOCAB_WORDS, VOCAB_GROUPS, wordsInGroup, POS_LABEL, type VocabWord } from './content'

export type CategoryId = string
export type Word = {
  id: string
  fi: string
  en: string
  category: CategoryId
  notes?: string
  pos?: string
  verbType?: number
  isVerb?: boolean
}
export type Category = {
  id: CategoryId
  title: string
  emoji: string
  description: string
  wordCount: number
  virtual?: boolean
}

const toWord = (w: VocabWord): Word => ({
  id: w.id,
  fi: w.fi,
  en: w.en,
  category: w.group,
  notes: [w.verbType ? `verb type ${w.verbType}` : POS_LABEL[w.pos], w.note].filter(Boolean).join(' · ') || undefined,
  pos: w.pos,
  verbType: w.verbType,
  isVerb: w.pos === 'verb'
})

export const WORDS: Word[] = VOCAB_WORDS.map(toWord)
/** Kept for older call sites: every word appears exactly once now. */
export const WORDS_ALL = WORDS
const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]))
export const wordById = (id: string): Word | undefined => WORD_BY_ID.get(id)

export const CATEGORIES: Category[] = VOCAB_GROUPS.map((g) => ({
  id: g.id,
  title: g.title,
  emoji: g.emoji,
  description: g.description,
  wordCount: wordsInGroup(g.id).length,
  virtual: g.virtual
})).filter((c) => c.wordCount > 0)

export const wordsByCategory = (cat: CategoryId): Word[] =>
  wordsInGroup(cat).map((w) => WORD_BY_ID.get(w.id)!).filter(Boolean)

export const getCategory = (id: CategoryId): Category | undefined => CATEGORIES.find((c) => c.id === id)
export const TOTAL_WORDS = WORDS.length

// ---------- SRS id migration ----------
// v1 word ids looked like "<12-hex item id>-<slug of the Finnish>-<english hint>".
// v2 ids are just the slug of the Finnish word. Map old progress onto the new ids so
// existing learners keep their boxes.
const OLD_ID = /^[0-9a-f]{12}-(.+)$/
export const migrateWordId = (id: string): string | null => {
  if (WORD_BY_ID.has(id)) return id
  const m = OLD_ID.exec(id)
  if (!m) return null
  const parts = m[1].split('-')
  for (let n = parts.length; n > 0; n--) {
    const candidate = parts.slice(0, n).join('-')
    if (WORD_BY_ID.has(candidate)) return candidate
  }
  return null
}
