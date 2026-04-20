// Finnish text-to-speech via the Web Speech API. Gracefully no-ops when unavailable.

let cachedVoice: SpeechSynthesisVoice | null = null
let voicesReady: Promise<void> | null = null

const loadVoices = (): Promise<void> => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve()
  if (voicesReady) return voicesReady
  voicesReady = new Promise((resolve) => {
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      cachedVoice =
        voices.find((v) => v.lang === 'fi-FI') ??
        voices.find((v) => v.lang.toLowerCase().startsWith('fi')) ??
        null
      resolve()
    }
    pick()
    if (!cachedVoice) {
      window.speechSynthesis.addEventListener('voiceschanged', pick, { once: true })
      // Fallback timeout
      setTimeout(() => resolve(), 1200)
    }
  })
  return voicesReady
}

export const ttsAvailable = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

export const speak = async (text: string, rate = 0.95): Promise<void> => {
  if (!ttsAvailable()) return
  await loadVoices()
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    if (cachedVoice) u.voice = cachedVoice
    u.lang = 'fi-FI'
    u.rate = rate
    u.pitch = 1
    window.speechSynthesis.speak(u)
  } catch {
    // ignore
  }
}

// Warm voices up early (call once at app start)
export const warmTts = () => {
  void loadVoices()
}
