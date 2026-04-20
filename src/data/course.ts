// Single source of truth derived from /content JSON files produced by scripts/normalize.py.
// Anything the UI needs is selected from these typed views — add new content by extending
// the content/ files (re-run the parser), not by editing this module.

import itemsJson from '../../content/items.json'
import topicsJson from '../../content/topics.json'
import lessonsJson from '../../content/lessons.json'
import reportJson from '../../content/report.json'

// --------- raw types that mirror the JSON ----------

export type Bilingual = { fi: string | null; en: string | null }

export type ItemType =
  | 'vocabulary_table'
  | 'verb_conjugation'
  | 'number_list'
  | 'alphabet_chart'
  | 'grammar_rule'
  | 'exercise'
  | 'phrase_list'
  | 'notes'
  | 'document'

type RawLessonRef = { term: string; number: number; date: string; folder: string }
type RawSource = { path: string; kind: string }

// Items have heterogeneous content shapes depending on type.
type MarkdownContent = { format: 'markdown'; body: string }

type StructuredSection = {
  heading?: { fi?: string; en?: string }
  note?: string
  items?: Array<Record<string, unknown>>
}

type StructuredContent = {
  format: 'structured'
  sections: StructuredSection[]
  note?: string
  verb?: Bilingual
}

export type CourseItem = {
  id: string
  title: { fi: string | null; en: string | null }
  type: ItemType
  topics: string[]
  content: MarkdownContent | StructuredContent
  lessons: RawLessonRef[]
  sources: RawSource[]
}

export type Lesson = {
  id: string
  term: string
  number: number
  date: string
  item_ids: string[]
}

export type TopicMap = Record<string, string[]> // topic slug -> item ids

// --------- strongly typed, filtered views ----------

export const ITEMS = itemsJson as CourseItem[]
export const LESSONS = (lessonsJson as Lesson[]).slice().sort((a, b) => {
  if (a.term !== b.term) return a.term.localeCompare(b.term)
  return a.number - b.number
})
export const TOPICS_MAP = topicsJson as TopicMap
export const REPORT = reportJson as {
  source_files: number
  unique_items: number
  duplicates_merged: number
  lessons: number
  topics: number
  types: Record<ItemType, number>
}

export const itemById = (id: string): CourseItem | undefined => ITEMS.find((i) => i.id === id)

export const lessonNumberFor = (item: CourseItem): number | null =>
  item.lessons[0]?.number ?? null

// --------- word extraction ----------

export type CourseWord = {
  id: string // stable id across runs
  fi: string
  en: string
  itemId: string
  sectionHeading?: string
  topics: string[]
  lesson?: number
  abbreviation?: string
}

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

// Word extraction only pulls from item types that genuinely list vocabulary.
// We skip exercise/notes/documents because their `fi` fields are sentences or prose, not words.
// Verb conjugations are handled separately (see COURSE_VERB_CONJUGATIONS).
const WORD_EXTRACT_TYPES: ItemType[] = ['vocabulary_table', 'phrase_list', 'number_list', 'alphabet_chart']

// Heuristic: an item-row is a valid {fi,en} word if both strings are non-empty,
// Finnish is short (≤ 60 chars) and contains no obvious English-only markers.
const isWordRow = (fi: unknown, en: unknown): fi is string =>
  typeof fi === 'string' && fi.trim().length > 0 && fi.length <= 80 &&
  typeof en === 'string' && (en as string).trim().length > 0

export const extractWords = (): CourseWord[] => {
  const out: CourseWord[] = []
  for (const item of ITEMS) {
    if (!WORD_EXTRACT_TYPES.includes(item.type)) continue
    if (item.content.format !== 'structured') continue
    const sections = item.content.sections ?? []
    const lesson = lessonNumberFor(item) ?? undefined
    // Dedup only within an item so the same word can appear in multiple categories/items.
    const seenInItem = new Set<string>()
    for (const sec of sections) {
      const heading = sec.heading?.en || sec.heading?.fi
      for (const row of sec.items ?? []) {
        const fi = row['fi'] as string | undefined
        const en = row['en'] as string | undefined
        const abbreviation = row['abbreviation'] as string | undefined
        if (isWordRow(fi, en)) {
          const key = `${fi.toLowerCase()}|${(en as string).toLowerCase()}`
          if (seenInItem.has(key)) continue
          seenInItem.add(key)
          out.push({
            id: `${item.id}-${slug(fi)}`.slice(0, 80),
            fi: fi.trim(),
            en: (en as string).trim(),
            itemId: item.id,
            sectionHeading: heading,
            topics: item.topics,
            lesson,
            abbreviation
          })
          continue
        }
        // verb conjugation row: pronoun_fi + form → surface as "olen / I am" style pair
        const pronounFi = row['pronoun_fi'] as string | undefined
        const pronounEn = row['pronoun_en'] as string | undefined
        const form = row['form'] as string | undefined
        if (form && pronounFi && pronounEn) {
          const verb = (item.content as StructuredContent).verb
          const fiText = `${pronounFi} ${form}`
          const enText = `${pronounEn} ${(verb?.en ?? '').replace(/^to\s+/i, '')}`.trim()
          const key = `${fiText.toLowerCase()}|${enText.toLowerCase()}`
          if (enText && !seenInItem.has(key)) {
            seenInItem.add(key)
            out.push({
              id: `${item.id}-${slug(fiText)}`,
              fi: fiText,
              en: enText,
              itemId: item.id,
              sectionHeading: heading,
              topics: item.topics,
              lesson
            })
          }
          continue
        }
      }
    }
  }
  return out
}

// Returns one entry per distinct (fi, en) pair — useful for the "all vocabulary" browser.
export const uniqueCourseWords = (): CourseWord[] => {
  const seen = new Set<string>()
  const out: CourseWord[] = []
  for (const w of COURSE_WORDS) {
    const k = `${w.fi.toLowerCase()}|${w.en.toLowerCase()}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(w)
  }
  return out
}

// Memoise
let _words: CourseWord[] | null = null
export const COURSE_WORDS = ((): CourseWord[] => {
  if (_words) return _words
  _words = extractWords()
  return _words
})()

// --------- categories derived from vocabulary_table + phrase_list items ----------

export type CourseCategory = {
  id: string
  title: string
  emoji: string
  description: string
  lessons: number[]
  itemId: string
  wordCount: number
}

// Emoji hinting based on title/topics — fallback to book.
const emojiFor = (item: CourseItem): string => {
  const hay = [item.title.en ?? '', ...(item.topics ?? [])].join(' ').toLowerCase()
  const rules: [RegExp, string][] = [
    [/greet|hello|tervehdys/, '👋'],
    [/family|relative|perhe/, '👨‍👩‍👧'],
    [/profess|occupation|job/, '💼'],
    [/number|numeral/, '🔢'],
    [/color|colour/, '🎨'],
    [/day|week|month|time|clock/, '📅'],
    [/weather|sää|rain|snow/, '🌦️'],
    [/direction|compass|north/, '🧭'],
    [/clothing|vaate|shirt/, '👕'],
    [/room|house|home|housing|furniture/, '🏠'],
    [/bag|wallet|object|everyday/, '🎒'],
    [/food|drink|cafe|restaurant|bread|berry|coffee|beverage/, '🍽️'],
    [/diet|vegan|vegetarian|allergen/, '🥬'],
    [/verb.*conjug|olla/, '🧠'],
    [/verb|type 1|type 2|type 3|tehdä|nähdä/, '⚙️'],
    [/locative|case|partitive|genitive|adessive|inessive|elative|illative|ablative|allative/, '📍'],
    [/pronoun/, '🙋'],
    [/question|kysymys/, '❓'],
    [/nationalit|lainen|country/, '🌍'],
    [/christmas|joulu/, '🎄'],
    [/place|kaupunki|city/, '🏙️'],
    [/adjective/, '✨'],
    [/location|here|there/, '🧷'],
    [/ill|sick|body|health|doctor/, '🩺'],
    [/outdoor|outside|sport|ski/, '🎿'],
    [/farm|animal|agriculture/, '🐄'],
    [/alphabet|letter/, '🔤'],
    [/travel|transport|bus|train/, '🚌'],
    [/phone|call|soittaa/, '📞'],
    [/phrase|idiom/, '💬']
  ]
  for (const [re, e] of rules) if (re.test(hay)) return e
  return '📘'
}

export const CATEGORIES: CourseCategory[] = ITEMS
  .filter((i) => i.type === 'vocabulary_table' || i.type === 'phrase_list' || i.type === 'number_list')
  .map((i) => {
    const wordCount = COURSE_WORDS.filter((w) => w.itemId === i.id).length
    const lessons = Array.from(new Set(i.lessons.map((l) => l.number))).sort((a, b) => a - b)
    return {
      id: i.id,
      title: (i.title.en ?? i.title.fi ?? 'Untitled').trim(),
      emoji: emojiFor(i),
      description: describeItem(i),
      lessons,
      itemId: i.id,
      wordCount
    }
  })
  .filter((c) => c.wordCount > 0)
  .sort((a, b) => (a.lessons[0] ?? 99) - (b.lessons[0] ?? 99))

function describeItem(item: CourseItem): string {
  if (item.content.format === 'markdown') return 'Reference document from the course.'
  const sec = item.content.sections?.[0]
  if (sec?.note) return sec.note
  const heading = sec?.heading?.en ?? sec?.heading?.fi
  if (heading) return `Includes: ${heading}`
  return `Topics: ${item.topics.slice(0, 3).join(', ') || 'vocabulary'}`
}

// --------- grammar rules ----------

export type CourseGrammar = {
  id: string
  title: string
  emoji: string
  summary: string
  lesson?: number
  sections: Array<{
    heading?: string
    body?: string
    note?: string
    table?: { headers: string[]; rows: string[][] }
    examples?: Array<{ fi: string; en: string }>
    bullets?: string[]
  }>
}

// Convert a row from a grammar_rule section into something our renderer can show.
// Strategy: if the row has a specific set of keys, turn it into a table row; otherwise
// render {fi, en} as examples.
const GRAMMAR_ROW_PRIORITIES = [
  ['case_fi', 'case_en', 'question_fi', 'question_en', 'ending', 'example_fi', 'example_en'],
  ['pronoun_fi', 'pronoun_en', 'form', 'stem', 'ending'],
  ['ending', 'description', 'example_fi', 'example_en'],
  ['fi', 'en']
] as const

const pickHeaders = (items: Array<Record<string, unknown>>): string[] => {
  if (!items.length) return []
  const keys = new Set<string>()
  for (const it of items) for (const k of Object.keys(it)) keys.add(k)
  for (const priority of GRAMMAR_ROW_PRIORITIES) {
    const present = priority.filter((k) => keys.has(k))
    if (present.length >= 2) return present
  }
  return Array.from(keys).filter((k) => k !== 'number')
}

const humanHeader = (k: string): string =>
  k
    .replace(/_/g, ' ')
    .replace(/^case fi$/, 'Case (FI)')
    .replace(/^case en$/, 'Case (EN)')
    .replace(/^question fi$/, 'Question (FI)')
    .replace(/^question en$/, 'Question (EN)')
    .replace(/^example fi$/, 'Example (FI)')
    .replace(/^example en$/, 'Example (EN)')
    .replace(/^pronoun fi$/, 'Person')
    .replace(/^pronoun en$/, 'Meaning')
    .replace(/^(fi|en)$/i, (m) => m.toUpperCase())
    .replace(/^form$/, 'Form')
    .replace(/^stem$/, 'Stem')
    .replace(/^ending$/, 'Ending')
    .replace(/^description$/, 'Description')

export const COURSE_GRAMMAR: CourseGrammar[] = ITEMS
  .filter((i) => i.type === 'grammar_rule' && i.content.format === 'structured')
  .map((i) => {
    const c = i.content as StructuredContent
    const sections = (c.sections ?? []).map((sec) => {
      const rows = sec.items ?? []
      const headers = pickHeaders(rows)
      const hasExampleOnly = headers.length === 2 && headers.every((h) => h === 'fi' || h === 'en')
      let table: { headers: string[]; rows: string[][] } | undefined
      const examples: Array<{ fi: string; en: string }> = []
      if (!hasExampleOnly && headers.length > 0) {
        const tableRows = rows
          .map((r) => headers.map((h) => String(r[h] ?? '')))
          .filter((r) => r.some((c) => c.trim().length > 0))
        if (tableRows.length > 0) table = { headers: headers.map(humanHeader), rows: tableRows }
      } else {
        for (const r of rows) {
          const fi = r['fi'] as string | undefined
          const en = r['en'] as string | undefined
          if (fi && en) examples.push({ fi, en })
        }
      }
      return {
        heading: sec.heading?.en ?? sec.heading?.fi,
        note: sec.note,
        table,
        examples: examples.length ? examples : undefined
      }
    })
    return {
      id: i.id,
      title: (i.title.en ?? i.title.fi ?? 'Grammar rule').trim(),
      emoji: emojiFor(i),
      summary: c.note ?? sections[0]?.note ?? (i.topics.slice(0, 3).join(', ') || ''),
      lesson: lessonNumberFor(i) ?? undefined,
      sections
    }
  })

// --------- verb conjugations ----------

export type ConjugationForm = {
  pronounFi: string
  pronounEn: string
  form: string
  stem?: string
  ending?: string
  note?: string
}

export type CourseVerbConjugation = {
  id: string
  verbFi: string
  verbEn: string
  title: string
  lesson?: number
  sections: Array<{ heading?: string; note?: string; forms: ConjugationForm[] }>
}

export const COURSE_VERB_CONJUGATIONS: CourseVerbConjugation[] = ITEMS
  .filter((i) => i.type === 'verb_conjugation' && i.content.format === 'structured')
  .map((i) => {
    const c = i.content as StructuredContent
    const sections = (c.sections ?? []).map((sec) => ({
      heading: sec.heading?.en ?? sec.heading?.fi,
      note: sec.note,
      forms: (sec.items ?? []).map<ConjugationForm>((r) => ({
        pronounFi: String(r['pronoun_fi'] ?? ''),
        pronounEn: String(r['pronoun_en'] ?? ''),
        form: String(r['form'] ?? ''),
        stem: r['stem'] != null ? String(r['stem']) : undefined,
        ending: r['ending'] != null ? String(r['ending']) : undefined,
        note: r['note'] != null ? String(r['note']) : undefined
      }))
    }))
    return {
      id: i.id,
      verbFi: c.verb?.fi ?? i.title.fi ?? 'verbi',
      verbEn: c.verb?.en ?? i.title.en ?? '',
      title: (i.title.en ?? i.title.fi ?? '').trim(),
      lesson: lessonNumberFor(i) ?? undefined,
      sections
    }
  })

// --------- course exercises with answers (real class exercises) ----------

export type CourseExerciseItem = {
  number?: number
  sentenceFi: string
  sentenceEn?: string
  promptNoun?: string
  answer: string
}

export type CourseExercise = {
  id: string
  title: string
  instruction?: string
  lesson?: number
  items: CourseExerciseItem[]
}

export const COURSE_EXERCISES: CourseExercise[] = ITEMS
  .filter((i) => i.type === 'exercise' && i.content.format === 'structured')
  .map((i) => {
    const c = i.content as StructuredContent
    const items: CourseExerciseItem[] = []
    let instruction: string | undefined
    for (const sec of c.sections ?? []) {
      if (!instruction && sec.heading?.en) instruction = sec.heading.en
      for (const r of sec.items ?? []) {
        const sentenceFi = (r['sentence_fi'] ?? r['fi']) as string | undefined
        const sentenceEn = (r['sentence_en'] ?? r['en']) as string | undefined
        const answer = r['answer'] as string | undefined
        if (sentenceFi && answer) {
          items.push({
            number: r['number'] as number | undefined,
            sentenceFi,
            sentenceEn,
            promptNoun: r['prompt_noun'] as string | undefined,
            answer
          })
        }
      }
    }
    return {
      id: i.id,
      title: (i.title.en ?? i.title.fi ?? 'Exercise').trim(),
      instruction,
      lesson: lessonNumberFor(i) ?? undefined,
      items
    }
  })
  .filter((ex) => ex.items.length > 0)
  .sort((a, b) => (a.lesson ?? 99) - (b.lesson ?? 99))

// --------- topic display helpers ----------

export const prettyTopic = (slug: string): string =>
  slug
    .replace(/_/g, ' ')
    .replace(/\bkpt\b/gi, 'K-P-T')
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())

export const TOPICS_SORTED = Object.keys(TOPICS_MAP).sort()

// --------- dataset totals (used on the About / Home screens) ----------

export const DATA_STATS = {
  totalItems: ITEMS.length,
  totalLessons: LESSONS.length,
  totalTopics: Object.keys(TOPICS_MAP).length,
  totalWords: COURSE_WORDS.length,
  totalCategories: CATEGORIES.length,
  totalGrammarRules: COURSE_GRAMMAR.length,
  totalExercises: COURSE_EXERCISES.length
}
