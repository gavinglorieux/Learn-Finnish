// Gamification: XP, level, streak, daily goal, achievements.

import { get, set, STORAGE_KEYS } from './storage.ts'

export type Achievement = {
  id: string
  title: string
  description: string
  emoji: string
  earnedAt?: number
}

export type Progress = {
  xp: number
  totalXp: number
  level: number
  streak: number
  lastActiveDate: string // YYYY-MM-DD
  dailyGoalXp: number
  xpToday: number
  todayDate: string
  completedAchievements: string[]
  sessionsCompleted: number
  firstUse: number
}

const todayKey = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const daysBetween = (a: string, b: string): number => {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  return Math.round((db - da) / (24 * 60 * 60 * 1000))
}

const DEFAULT: Progress = {
  xp: 0,
  totalXp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  dailyGoalXp: 40,
  xpToday: 0,
  todayDate: todayKey(),
  completedAchievements: [],
  sessionsCompleted: 0,
  firstUse: Date.now()
}

// XP required to reach level N from level 1: cumulative formula (quadratic-ish)
// level 1 -> 0 xp, level 2 -> 50 xp, level 3 -> 125 xp, ...
const xpForLevel = (lvl: number) => Math.round(25 * (lvl - 1) * (lvl - 1) + 25 * (lvl - 1))
export const xpForNextLevel = (currentLevel: number) => xpForLevel(currentLevel + 1) - xpForLevel(currentLevel)
export const levelFromTotal = (total: number): number => {
  let lvl = 1
  while (xpForLevel(lvl + 1) <= total) lvl++
  return lvl
}
export const xpProgressInLevel = (total: number, level: number) => ({
  current: total - xpForLevel(level),
  required: xpForLevel(level + 1) - xpForLevel(level)
})

export const loadProgress = (): Progress => {
  const p = get<Progress>(STORAGE_KEYS.progress, DEFAULT)
  // daily rollover
  const today = todayKey()
  if (p.todayDate !== today) {
    p.xpToday = 0
    p.todayDate = today
  }
  return p
}

export const saveProgress = (p: Progress) => set(STORAGE_KEYS.progress, p)

export const touchStreak = (p: Progress): Progress => {
  const today = todayKey()
  if (p.lastActiveDate === today) return p
  if (!p.lastActiveDate) {
    p.streak = 1
  } else {
    const gap = daysBetween(p.lastActiveDate, today)
    if (gap === 1) p.streak += 1
    else if (gap > 1) p.streak = 1
    // gap 0 covered above
  }
  p.lastActiveDate = today
  return p
}

export const awardXp = (p: Progress, amount: number): { p: Progress; newAchievements: Achievement[]; leveledUp: boolean } => {
  const prevLevel = p.level
  p.xp += amount
  p.totalXp += amount
  p.xpToday += amount
  p.level = levelFromTotal(p.totalXp)
  touchStreak(p)
  const newAchievements = checkAchievements(p)
  return { p, newAchievements, leveledUp: p.level > prevLevel }
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Complete your first exercise.', emoji: '🌱' },
  { id: 'word-apprentice', title: 'Word Apprentice', description: 'Earn 100 XP in total.', emoji: '📖' },
  { id: 'word-scholar', title: 'Word Scholar', description: 'Earn 500 XP in total.', emoji: '🎓' },
  { id: 'word-master', title: 'Word Master', description: 'Earn 2000 XP in total.', emoji: '🏆' },
  { id: 'three-day', title: '3-day streak', description: 'Practise for 3 days in a row.', emoji: '🔥' },
  { id: 'seven-day', title: 'Weekly warrior', description: '7-day streak.', emoji: '⚔️' },
  { id: 'thirty-day', title: 'Kuukauden sankari', description: '30-day streak. Hero of the month!', emoji: '👑' },
  { id: 'goal-reached', title: 'Daily goal', description: 'Hit your daily goal for the first time.', emoji: '🎯' },
  { id: 'ten-sessions', title: 'Consistent', description: 'Finish 10 practice sessions.', emoji: '💪' },
  { id: 'level-five', title: 'Level 5', description: 'Reach level 5.', emoji: '⭐' },
  { id: 'level-ten', title: 'Level 10', description: 'Reach level 10.', emoji: '🌟' }
]

const checkAchievements = (p: Progress): Achievement[] => {
  const earned: Achievement[] = []
  const has = (id: string) => p.completedAchievements.includes(id)
  const grant = (id: string) => {
    if (has(id)) return
    p.completedAchievements.push(id)
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    if (a) earned.push({ ...a, earnedAt: Date.now() })
  }
  if (p.totalXp >= 1) grant('first-steps')
  if (p.totalXp >= 100) grant('word-apprentice')
  if (p.totalXp >= 500) grant('word-scholar')
  if (p.totalXp >= 2000) grant('word-master')
  if (p.streak >= 3) grant('three-day')
  if (p.streak >= 7) grant('seven-day')
  if (p.streak >= 30) grant('thirty-day')
  if (p.xpToday >= p.dailyGoalXp) grant('goal-reached')
  if (p.sessionsCompleted >= 10) grant('ten-sessions')
  if (p.level >= 5) grant('level-five')
  if (p.level >= 10) grant('level-ten')
  return earned
}

export const recordSessionEnd = (p: Progress): Progress => {
  p.sessionsCompleted += 1
  return p
}

export const resetProgress = (): Progress => {
  const fresh = { ...DEFAULT, firstUse: Date.now(), todayDate: todayKey() }
  saveProgress(fresh)
  return fresh
}

export const DEFAULT_PROGRESS = DEFAULT
