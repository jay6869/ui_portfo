import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// useLayoutEffect on the client, useEffect during prerender (no warning, same behaviour)
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
import { useLocation, type Location } from 'react-router-dom'
import { scroller } from './scroll'
import { ScrollTrigger } from './gsap'
import { useUI } from '@/stores/ui'
import { QUERIES, matches } from './media'

const SHARED_LEAD_MS = 320
import { getProject } from '@/content/projects'
import { stripTokens } from '@/lib/text'

export type TransitionPhase = 'idle' | 'cover' | 'reveal'

export function routeTitle(pathname: string): { kicker: string; title: string } {
  if (pathname === '/') return { kicker: 'Index', title: 'Home' }
  const m = pathname.match(/^\/work\/([^/]+)\/?$/)
  const p = m ? getProject(m[1]) : undefined
  if (p) return { kicker: `Case study · ${p.year}`, title: stripTokens(p.title) }
  return { kicker: '404', title: 'Lost' }
}

/**
 * Keeps the rendered route (`display`) one step behind the router's location, so a panel can
 * cover the screen before the old page unmounts. Interruptible: navigating again mid-wipe just
 * retargets. The shared-cover transition (work → case study) bypasses the panel entirely.
 */
export function useRouteTransition() {
  const location = useLocation()
  const [display, setDisplay] = useState<Location>(location)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [title, setTitle] = useState(routeTitle(location.pathname))
  const pending = useRef(location)
  const displayRef = useRef(display)
  const prevPath = useRef(display.pathname)
  displayRef.current = display

  const swap = useCallback((loc: Location) => {
    if (displayRef.current.pathname === '/') useUI.getState().setHomeScroll(scroller.y)
    document.documentElement.dataset.navigated = 'true'
    setDisplay(loc)
  }, [])

  useEffect(() => {
    // Scroll restoration mode is stored per history entry; keep every entry on 'manual' so the
    // browser never jumps before our transition has measured the outgoing page.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    pending.current = location
    const current = displayRef.current
    if (location.pathname === current.pathname) {
      if (location.key !== current.key) setDisplay(location) // hash / same-page navigation
      return
    }
    if (useUI.getState().sharedCover.phase !== 'idle') {
      swap(location)
      return
    }
    // Case study → home (back button or browser back): shrink the cover back into its row/card
    if (
      current.pathname.startsWith('/work/') &&
      location.pathname === '/' &&
      !matches(QUERIES.reducedMotion)
    ) {
      const el = document.querySelector<HTMLElement>('[data-cover-target]')
      const r = el?.getBoundingClientRect()
      if (el && r && r.bottom > 80) {
        useUI.getState().startSharedCover('in', el.dataset.coverTarget!, {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        })
        const t = window.setTimeout(() => swap(pending.current), SHARED_LEAD_MS)
        return () => window.clearTimeout(t)
      }
    }
    setTitle(routeTitle(location.pathname))
    setPhase('cover')
  }, [location, swap])

  const onCovered = useCallback(() => {
    swap(pending.current)
    setPhase('reveal')
  }, [swap])
  const onRevealed = useCallback(() => setPhase('idle'), [])

  // Safety net: never get stuck behind the panel if an animation callback is lost.
  useEffect(() => {
    if (phase === 'idle') return
    const t = window.setTimeout(() => (phase === 'cover' ? onCovered() : onRevealed()), 1400)
    return () => window.clearTimeout(t)
  }, [phase, onCovered, onRevealed])

  // After the new route has mounted: scroll position, focus, trigger refresh.
  useIsoLayoutEffect(() => {
    const from = prevPath.current
    prevPath.current = display.pathname
    if (from === display.pathname && !display.hash) return

    const hashTarget = display.hash ? document.getElementById(display.hash.slice(1)) : null
    if (hashTarget) {
      if (from === display.pathname) scroller.scrollTo(hashTarget)
      else scroller.scrollTo(hashTarget, { immediate: true })
    } else if (from !== display.pathname) {
      const restoreHome = display.pathname === '/' && from.startsWith('/work/')
      scroller.scrollTo(restoreHome ? useUI.getState().homeScroll : 0, { immediate: true })
    }
    if (from !== display.pathname) {
      document.getElementById('main')?.focus({ preventScroll: true })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [display])

  return { display, phase, title, onCovered, onRevealed }
}
