import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/haptics'

// Pull-to-refresh for the standalone iOS PWA. iOS strips the URL bar so
// there's no native way to refresh — this gives users a familiar gesture
// that also nudges the service worker to pick up the latest build.

const THRESHOLD = 70 // pixels of pull required to trigger
const MAX_PULL = 140 // damped maximum so the indicator doesn't fly off

export default function PullToRefresh() {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const armed = useRef(false) // crossed threshold during this gesture
  const pullRef = useRef(0)
  const refreshingRef = useRef(false)

  pullRef.current = pull
  refreshingRef.current = refreshing

  useEffect(() => {
    const isInteractive = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null
      return !!el?.closest('input, textarea, select, [contenteditable="true"]')
    }

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current) return
      if (window.scrollY > 0) return
      if (e.touches.length !== 1) return
      if (isInteractive(e.target)) return
      startY.current = e.touches[0].clientY
      armed.current = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null || refreshingRef.current) return
      if (window.scrollY > 0) {
        // user scrolled the page underneath us — bail out
        startY.current = null
        if (pullRef.current !== 0) setPull(0)
        return
      }
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) {
        if (pullRef.current !== 0) setPull(0)
        return
      }
      // Damped pull — feels like rubber band.
      const damped = Math.min(MAX_PULL, dy * 0.55)
      setPull(damped)
      // Light tap when threshold first crossed.
      if (!armed.current && damped >= THRESHOLD) {
        armed.current = true
        haptic(8)
      }
      if (armed.current && damped < THRESHOLD) armed.current = false
      if (e.cancelable && dy > 6) e.preventDefault()
    }

    const onTouchEnd = async () => {
      if (startY.current == null) return
      const triggered = pullRef.current >= THRESHOLD
      startY.current = null
      if (refreshingRef.current) return
      if (!triggered) {
        setPull(0)
        return
      }
      setRefreshing(true)
      setPull(THRESHOLD)
      haptic([10, 30, 10])
      // Best-effort: pull a fresh service worker before reloading so the user
      // gets the latest build, not a re-render of cached assets.
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) {
            await reg.update()
            if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      } catch {
        /* ignore — still reload */
      }
      // Short delay so the spinner is visible; full reload bypasses any
      // stale module graph in memory.
      setTimeout(() => window.location.reload(), 350)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove as EventListener)
      window.removeEventListener('touchend', onTouchEnd as EventListener)
      window.removeEventListener('touchcancel', onTouchEnd as EventListener)
    }
  }, [])

  const visible = pull > 0 || refreshing
  const progress = Math.min(1, pull / THRESHOLD)
  const armedNow = pull >= THRESHOLD

  return (
    <div
      aria-hidden={!visible}
      role={refreshing ? 'status' : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center"
      style={{
        transform: `translateY(${refreshing ? THRESHOLD * 0.55 : pull * 0.55}px)`,
        transition: refreshing || (!visible && pull === 0) ? 'transform 220ms ease' : 'none',
        opacity: visible ? 1 : 0,
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <div className="mt-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <span
          aria-hidden
          className={`inline-flex h-4 w-4 items-center justify-center text-finnish-500 dark:text-finnish-200 ${refreshing ? 'animate-spin' : ''}`}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
            transition: refreshing ? 'none' : 'transform 60ms linear'
          }}
        >
          {refreshing ? '⟳' : armedNow ? '⤴' : '⤓'}
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {refreshing ? 'Updating…' : armedNow ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )
}
