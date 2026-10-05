import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { createScrollMemory, type Nav } from '@/lib/scrollMemory'

// BrowserRouter has no scroll restoration, so the window kept the previous
// page's offset and a link tapped near the bottom opened the next screen at
// its bottom. New screens start at the top; back/forward restores.

const memory = createScrollMemory()

export default function ScrollManager() {
  const location = useLocation()
  const type = useNavigationType()
  const prev = useRef<Nav | null>(null)
  const currentKey = useRef(location.key)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // Record on every scroll: by the time the route changes the DOM is already
    // the new page and window.scrollY may have been clamped.
    const onScroll = () => memory.save(currentKey.current, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    const next: Nav = { key: location.key, pathname: location.pathname, type }
    currentKey.current = location.key
    const y = memory.target(prev.current, next)
    prev.current = next
    if (y != null) window.scrollTo(0, y)
  }, [location.key, location.pathname, type])

  return null
}
