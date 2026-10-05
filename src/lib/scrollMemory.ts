// Pure scroll-position bookkeeping for ScrollManager, kept DOM-free so it can be unit tested.

export type NavigationType = 'POP' | 'PUSH' | 'REPLACE'

export interface Nav {
  key: string
  pathname: string
  type: NavigationType
}

export function createScrollMemory(limit = 100) {
  const positions = new Map<string, number>()

  return {
    save(key: string, y: number) {
      positions.delete(key)
      positions.set(key, y)
      if (positions.size > limit) positions.delete(positions.keys().next().value!)
    },
    // Where to scroll after navigating from `prev` to `next`, or null to leave it alone.
    // Back/forward restores the saved position; a new screen starts at the top; a
    // push/replace that only changes the query string or state stays put.
    target(prev: Nav | null, next: Nav): number | null {
      if (next.type === 'POP') return positions.get(next.key) ?? 0
      if (prev && prev.pathname === next.pathname) return null
      return 0
    }
  }
}
