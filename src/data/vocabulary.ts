// Thin adapter over content.ts so pages/exercises can keep their Word/Category imports.
// Words and groups come from content/vocab.json — edit content/, not this file.

import { VOCAB_WORDS, VOCAB_GROUPS, wordsInGroup, POS_LABEL, type VocabWord } from './content'
import { answerMatches, glossKey, shuffle } from '@/lib/utils'

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

// ---------- synonyms & distractors ----------
// Several entries share one English gloss (mummo / mummi / isoäiti → "grandma"). A typed
// answer that matches any of them is right, and none of them may appear as a distractor.
const BY_GLOSS = new Map<string, Word[]>()
for (const w of WORDS) {
  const k = glossKey(w.en)
  const list = BY_GLOSS.get(k)
  if (list) list.push(w)
  else BY_GLOSS.set(k, [w])
}

/** Every Finnish entry with the same English meaning as `word` (including itself). */
export const synonymsOf = (word: Word): Word[] => BY_GLOSS.get(glossKey(word.en)) ?? [word]

/** True when `input` is `word` or one of its synonyms. */
export const isCorrectFinnish = (input: string, word: Word): boolean =>
  synonymsOf(word).some((w) => answerMatches(input, w.fi))

/**
 * `n` wrong options for `word`, distinct in the shown language and never equal to the
 * right answer (or a synonym of it). Same-group words first, then anything.
 */
export const pickDistractors = (word: Word, lang: 'fi' | 'en', n: number, pool: Word[] = WORDS): Word[] => {
  const taken = new Set([glossKey(word.en), ...synonymsOf(word).map((w) => glossKey(w[lang]))])
  taken.add(glossKey(word[lang]))
  const ok = (w: Word) => w.id !== word.id && !taken.has(glossKey(w[lang])) && !taken.has(glossKey(w.en))
  const out: Word[] = []
  const add = (candidates: Word[]) => {
    for (const w of shuffle(candidates)) {
      if (out.length >= n) return
      if (!ok(w)) continue
      taken.add(glossKey(w[lang]))
      out.push(w)
    }
  }
  add(pool.filter((w) => w.category === word.category))
  if (out.length < n) add(pool)
  if (out.length < n && pool !== WORDS) add(WORDS)
  return out
}

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
