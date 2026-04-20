// Thin adapter over course.ts so existing pages/exercises can keep their imports.
// The underlying content is derived from /content JSON — edit those files (re-run the
// parser pipeline) to extend vocabulary, not this file.

import { COURSE_WORDS, CATEGORIES as COURSE_CATEGORIES, uniqueCourseWords, type CourseWord, type CourseCategory } from './course'

export type CategoryId = string
export type Word = {
  id: string
  fi: string
  en: string
  category: CategoryId
  notes?: string
  lesson?: number
}
export type Category = {
  id: CategoryId
  title: string
  emoji: string
  description: string
  lessons: number[]
  wordCount: number
}

const toWord = (w: CourseWord): Word => ({
  id: w.id,
  fi: w.fi,
  en: w.en,
  category: w.itemId,
  notes: w.sectionHeading && w.abbreviation ? `${w.sectionHeading} · ${w.abbreviation}` : w.sectionHeading ?? w.abbreviation,
  lesson: w.lesson
})

const toCategory = (c: CourseCategory): Category => ({
  id: c.id,
  title: c.title,
  emoji: c.emoji,
  description: c.description,
  lessons: c.lessons,
  wordCount: c.wordCount
})

// All words including repeats across categories (for per-category pages).
export const WORDS_ALL: Word[] = COURSE_WORDS.map(toWord)
// De-duplicated list for the main vocabulary browser.
export const WORDS: Word[] = uniqueCourseWords().map(toWord)
export const CATEGORIES: Category[] = COURSE_CATEGORIES.map(toCategory)

export const wordsByCategory = (cat: CategoryId): Word[] => WORDS_ALL.filter((w) => w.category === cat)
export const getCategory = (id: CategoryId): Category | undefined => CATEGORIES.find((c) => c.id === id)
export const TOTAL_WORDS = WORDS.length
