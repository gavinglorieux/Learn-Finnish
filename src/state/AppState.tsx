import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  loadProgress,
  saveProgress,
  awardXp,
  recordSessionEnd as recordSession,
  resetProgress as resetProg,
  type Progress,
  type Achievement
} from '@/lib/progress'
import { loadSrs, saveSrs, review as srsReview, type SrsStore } from '@/lib/srs'
import { loadSettings, saveSettings, applyTheme, type Settings } from './settings'
import { migrateWordId } from '@/data/vocabulary'

type Toast = { id: string; title: string; emoji?: string; body?: string }

type AppContextValue = {
  progress: Progress
  settings: Settings
  srs: SrsStore
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  award: (xp: number) => { leveledUp: boolean; newAchievements: Achievement[] }
  reviewWord: (wordId: string, correct: boolean) => void
  endSession: () => void
  updateSettings: (s: Partial<Settings>) => void
  resetAll: () => void
  celebrate: boolean
  triggerCelebrate: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// Content v2 renamed word ids; carry SRS boxes over (keeping the better box on collisions).
// Non-word keys (verb drills, course exercises) are kept as-is.
const migrateSrs = (store: SrsStore): SrsStore => {
  let changed = false
  const next: SrsStore = {}
  for (const [key, entry] of Object.entries(store)) {
    const isWordLike = /^[0-9a-f]{12}-/.test(key)
    const id = isWordLike ? migrateWordId(key) : key
    if (!id) { changed = true; continue }
    if (id !== key) changed = true
    const prev = next[id]
    if (!prev || entry.box > prev.box) next[id] = { ...entry, wordId: id }
  }
  if (changed) saveSrs(next)
  return next
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [srs, setSrs] = useState<SrsStore>(() => migrateSrs(loadSrs()))
  const [toasts, setToasts] = useState<Toast[]>([])
  const [celebrate, setCelebrate] = useState(false)
  const celebrateTimer = useRef<number | null>(null)

  useEffect(() => applyTheme(settings.theme), [settings.theme])

  // Apply stored dailyGoal to progress if they differ
  useEffect(() => {
    if (progress.dailyGoalXp !== settings.dailyGoal) {
      setProgress((p) => {
        const next = { ...p, dailyGoalXp: settings.dailyGoal }
        saveProgress(next)
        return next
      })
    }
  }, [settings.dailyGoal, progress.dailyGoalXp])

  // Listen for system theme changes when using 'system'
  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3800)
  }, [])

  const triggerCelebrate = useCallback(() => {
    setCelebrate(true)
    if (celebrateTimer.current) window.clearTimeout(celebrateTimer.current)
    celebrateTimer.current = window.setTimeout(() => setCelebrate(false), 1800)
  }, [])

  const award = useCallback(
    (xp: number) => {
      const { p, newAchievements, leveledUp } = awardXp({ ...progress }, xp)
      saveProgress(p)
      setProgress(p)
      if (leveledUp) {
        addToast({ title: `Level up! → ${p.level}`, emoji: '⭐', body: `Great work! You're getting stronger.` })
        triggerCelebrate()
      }
      newAchievements.forEach((a) => addToast({ title: a.title, emoji: a.emoji, body: a.description }))
      if (newAchievements.some((a) => a.id === 'goal-reached')) triggerCelebrate()
      return { leveledUp, newAchievements }
    },
    [progress, addToast, triggerCelebrate]
  )

  const reviewWord = useCallback((wordId: string, correct: boolean) => {
    setSrs((prev) => {
      const next = { ...prev }
      srsReview(next, wordId, correct)
      saveSrs(next)
      return next
    })
  }, [])

  const endSession = useCallback(() => {
    setProgress((p) => {
      const next = recordSession({ ...p })
      saveProgress(next)
      return next
    })
  }, [])

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s }
      saveSettings(next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    const fresh = resetProg()
    setProgress(fresh)
    setSrs({})
    saveSrs({})
    addToast({ title: 'Progress reset', emoji: '🧹' })
  }, [addToast])

  const value = useMemo<AppContextValue>(
    () => ({
      progress,
      settings,
      srs,
      toasts,
      addToast,
      award,
      reviewWord,
      endSession,
      updateSettings,
      resetAll,
      celebrate,
      triggerCelebrate
    }),
    [progress, settings, srs, toasts, addToast, award, reviewWord, endSession, updateSettings, resetAll, celebrate, triggerCelebrate]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
