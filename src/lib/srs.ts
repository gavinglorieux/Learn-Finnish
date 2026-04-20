// Lightweight SRS using a Leitner-box system with 5 boxes.
// box 0 = new / unknown, interval 0 min
// box 1 = 10 min  (reviewed soon in same session)
// box 2 = 1 day
// box 3 = 3 days
// box 4 = 7 days
// box 5 = 21 days (mastered)

import { get, set, STORAGE_KEYS } from './storage.ts'

export type SrsEntry = {
  wordId: string
  box: number
  correctStreak: number
  lastReviewed: number // epoch ms
  nextReview: number // epoch ms
  seenCount: number
  correctCount: number
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const INTERVALS = [0, 10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY]

export type SrsStore = Record<string, SrsEntry>

export const loadSrs = (): SrsStore => get<SrsStore>(STORAGE_KEYS.srs, {})
export const saveSrs = (s: SrsStore) => set(STORAGE_KEYS.srs, s)

export const ensureEntry = (store: SrsStore, wordId: string): SrsEntry => {
  let e = store[wordId]
  if (!e) {
    e = { wordId, box: 0, correctStreak: 0, lastReviewed: 0, nextReview: 0, seenCount: 0, correctCount: 0 }
    store[wordId] = e
  }
  return e
}

export const review = (store: SrsStore, wordId: string, correct: boolean): SrsEntry => {
  const e = ensureEntry(store, wordId)
  const now = Date.now()
  e.seenCount += 1
  e.lastReviewed = now
  if (correct) {
    e.correctCount += 1
    e.correctStreak += 1
    e.box = Math.min(e.box + 1, INTERVALS.length - 1)
  } else {
    e.correctStreak = 0
    e.box = Math.max(e.box - 1, 0)
  }
  e.nextReview = now + INTERVALS[e.box]
  return e
}

export const dueWordIds = (store: SrsStore, now: number = Date.now()): string[] =>
  Object.values(store)
    .filter((e) => e.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .map((e) => e.wordId)

export const masteryLevel = (entry: SrsEntry | undefined): number => {
  if (!entry) return 0
  // mastery 0..1
  return Math.min(1, entry.box / (INTERVALS.length - 1))
}

export const totalMastery = (store: SrsStore, allIds: string[]): number => {
  if (allIds.length === 0) return 0
  const sum = allIds.reduce((acc, id) => acc + masteryLevel(store[id]), 0)
  return sum / allIds.length
}
