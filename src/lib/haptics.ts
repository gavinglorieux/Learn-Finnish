// Soft haptic feedback on mobile — gracefully no-ops where unsupported.

export const haptic = (pattern: number | number[] = 10) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    /* noop */
  }
}

export const hapticSuccess = () => haptic([8, 30, 10])
export const hapticError = () => haptic([30, 50, 30])
