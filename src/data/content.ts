// Typed views over the generated content/*.json (scripts/build-content.py).
// Add or fix content in content/sources or content/curated and rebuild — not here.

import vocabJson from '../../content/vocab.json'
import grammarJson from '../../content/grammar.json'
import textsJson from '../../content/texts.json'
import exercisesJson from '../../content/exercises.json'
import courseJson from '../../content/course.json'

// ---------- vocabulary ----------

export type VocabWord = {
  id: string
  fi: string
  en: string
  pos: string
  group: string
  lessons: string[]
  verbType?: number
  forms?: Record<string, string>
  note?: string
  uncertain?: boolean
}

export type VocabGroup = { id: string; title: string; emoji: string; description: string; virtual?: boolean }
export type VocabSection = { id: string; title: string; groups: string[] }

export const VOCAB_WORDS = vocabJson.words as VocabWord[]
export const VOCAB_GROUPS = vocabJson.groups as VocabGroup[]
export const VOCAB_SECTIONS = vocabJson.sections as VocabSection[]

export const POS_LABEL: Record<string, string> = {
  noun: 'noun', verb: 'verb', adj: 'adjective', adv: 'adverb', pron: 'pronoun', num: 'number',
  prep: 'preposition', postp: 'postposition', conj: 'conjunction', phrase: 'phrase',
  interj: 'interjection', question: 'question word', proper: 'name', other: ''
}

/** Virtual groups collect words across themes (all verbs, verbs of one type). */
export const wordsInGroup = (groupId: string): VocabWord[] => {
  if (groupId === 'verbs') return VOCAB_WORDS.filter((w) => w.pos === 'verb')
  const m = /^verbs-type-(\d)$/.exec(groupId)
  if (m) {
    const t = Number(m[1])
    return VOCAB_WORDS.filter((w) => w.pos === 'verb' && (w.verbType === t || (t === 5 && w.verbType === 6)))
  }
  if (groupId === 'adjectives') return VOCAB_WORDS.filter((w) => w.group === 'adjectives' || (w.pos === 'adj' && w.group === 'other'))
  return VOCAB_WORDS.filter((w) => w.group === groupId)
}

// ---------- grammar ----------

export type GrammarSection = {
  heading?: string
  body?: string
  bullets?: string[]
  table?: { headers: string[]; rows: string[][] }
  examples?: Array<{ fi: string; en: string }>
  tip?: string
  note?: string
}

export type GrammarTopic = {
  id: string
  title: string
  fi?: string
  emoji: string
  summary: string
  part: string
  requires?: string[]
  related?: string[]
  practice?: Array<{ label: string; to: string }>
  lessons: string[]
  sections: GrammarSection[]
}

export type GrammarPart = { id: string; title: string; emoji: string; description: string; topics: string[] }

export const GRAMMAR_PARTS = grammarJson.parts as GrammarPart[]
export const GRAMMAR_TOPICS = grammarJson.topics as GrammarTopic[]
export const grammarById = (id: string): GrammarTopic | undefined => GRAMMAR_TOPICS.find((t) => t.id === id)
/** 1-based position in the recommended learning order. */
export const grammarNumber = (id: string): number => GRAMMAR_TOPICS.findIndex((t) => t.id === id) + 1

// ---------- texts ----------

export type TextLine = { speaker?: string; fi: string; en?: string }
export type ReadingText = {
  id: string
  title: { fi: string; en: string }
  kind: 'reading' | 'dialogue' | string
  lessons: string[]
  topics: string[]
  source: string
  lines: TextLine[]
  glossary: Array<{ form: string; fi: string; en: string }>
}

export const TEXTS = textsJson as ReadingText[]
export const textById = (id: string): ReadingText | undefined => TEXTS.find((t) => t.id === id)

// ---------- exercises ----------

export type ExerciseItem = { prompt: string; answer: string; base?: string; en?: string; accept?: string[] }
export type Exercise = {
  id: string
  title: string
  instruction?: string
  topic?: string
  lessons: string[]
  source?: string
  kind: 'course' | 'drill'
  answerSource: string
  items: ExerciseItem[]
}

export const EXERCISES = exercisesJson as Exercise[]
export const exerciseById = (id: string): Exercise | undefined => EXERCISES.find((e) => e.id === id)
export const DRILLS = EXERCISES.filter((e) => e.kind === 'drill')
export const COURSE_EXERCISES = EXERCISES.filter((e) => e.kind === 'course')

// ---------- course: terms & lessons ----------

export type Term = { id: string; title: string; subtitle: string }
export type Material = { title: { fi?: string; en?: string }; kind?: string; summary?: string; source: string }

/** Full handout transcripts, split into their own chunk because they're large. */
let handoutsPromise: Promise<Record<string, string>> | null = null
export const loadHandouts = (): Promise<Record<string, string>> =>
  (handoutsPromise ??= import('../../content/handouts.json').then((m) => m.default as Record<string, string>))
export type Lesson = {
  id: string
  term: string
  number: number
  date: string
  title: string
  summary: string
  topics: string[]
  groups: string[]
  wordCount: number
  texts: string[]
  exercises: string[]
  materials: Material[]
  pending?: string[]
}

export const TERMS = courseJson.terms as Term[]
export const LESSONS = (courseJson.lessons as Lesson[]).slice().sort((a, b) => a.date.localeCompare(b.date))
export const lessonById = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id)
export const termById = (id: string): Term | undefined => TERMS.find((t) => t.id === id)
export const lessonLabel = (l: Lesson): string => `${termById(l.term)?.title ?? ''} · Lesson ${l.number}`

export const wordsForLesson = (lessonId: string): VocabWord[] => VOCAB_WORDS.filter((w) => w.lessons.includes(lessonId))

export const formatDate = (iso: string, style: 'short' | 'long' = 'short'): string => {
  const d = new Date(`${iso}T12:00:00`)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, style === 'long'
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' })
}

// ---------- totals ----------

export const DATA_STATS = {
  words: VOCAB_WORDS.length,
  groups: VOCAB_GROUPS.length,
  grammarTopics: GRAMMAR_TOPICS.length,
  lessons: LESSONS.length,
  texts: TEXTS.length,
  exercises: EXERCISES.length,
  exerciseItems: EXERCISES.reduce((n, e) => n + e.items.length, 0)
}
