import { get, set, STORAGE_KEYS } from '@/lib/storage'

export type Settings = {
  theme: 'system' | 'light' | 'dark'
  sound: boolean
  haptics: boolean
  dailyGoal: 40 | 60 | 100 | 150
  autoSpeakFinnish: boolean
}

const DEFAULT: Settings = {
  theme: 'system',
  sound: true,
  haptics: true,
  dailyGoal: 40,
  autoSpeakFinnish: false
}

export const loadSettings = (): Settings => ({ ...DEFAULT, ...get<Partial<Settings>>(STORAGE_KEYS.settings, {}) })
export const saveSettings = (s: Settings) => set(STORAGE_KEYS.settings, s)

export const applyTheme = (theme: Settings['theme']) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
}
