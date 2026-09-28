import type LocomotiveScroll from 'locomotive-scroll'
import { gsap, ScrollTrigger } from './gsap'
import { QUERIES, matches } from './media'
import { cubicBezier, EASE } from './ease'

/**
 * THE scroll engine. Exactly one smooth scroller (Locomotive v5 → Lenis) and exactly one rAF:
 * Locomotive's render callback is registered on gsap.ticker through `initCustomTicker`, and
 * every Lenis scroll event forwards to ScrollTrigger.update. With reduced motion nothing is
 * created and the page uses native scrolling; every API below still works.
 */
type Target = number | string | HTMLElement
interface ScrollToOptions {
  immediate?: boolean
  offset?: number
  duration?: number
  onComplete?: () => void
}

let loco: LocomotiveScroll | null = null
const easeInOut = cubicBezier(...EASE.inout)

function resolveTop(target: Target, offset = 0): number {
  if (typeof target === 'number') return target + offset
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return window.scrollY
  return el.getBoundingClientRect().top + window.scrollY + offset
}

export const scroller = {
  get isSmooth() {
    return loco !== null
  },
  get y(): number {
    return loco?.lenisInstance?.scroll ?? (typeof window === 'undefined' ? 0 : window.scrollY)
  },
  scrollTo(target: Target, opts: ScrollToOptions = {}) {
    const { immediate = false, offset = 0, duration = 1.2, onComplete } = opts
    if (loco) {
      loco.scrollTo(target, {
        immediate,
        offset,
        duration,
        easing: easeInOut,
        onComplete,
        force: true,
      })
      return
    }
    const top = resolveTop(target, offset)
    const reduce = matches(QUERIES.reducedMotion)
    window.scrollTo({ top, behavior: immediate || reduce ? 'instant' : 'smooth' })
    onComplete?.()
  },
  /** Pause smooth scrolling (dialogs). Native scroll locking is handled by Radix. */
  stop() {
    loco?.lenisInstance?.stop()
  },
  start() {
    loco?.lenisInstance?.start()
  },
  resize() {
    loco?.resize()
    ScrollTrigger.refresh()
  },
}

export async function initScroll(): Promise<() => void> {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (matches(QUERIES.reducedMotion)) return () => {}

  const { default: Locomotive } = await import('locomotive-scroll')
  loco = new Locomotive({
    lenisOptions: {
      lerp: 0.105,
      smoothWheel: true,
      syncTouch: false, // native momentum on touch devices — faster and less surprising
      wheelMultiplier: 1,
      anchors: false,
    },
    scrollCallback: () => ScrollTrigger.update(),
    initCustomTicker: (render) => gsap.ticker.add(render),
    destroyCustomTicker: (render) => gsap.ticker.remove(render),
  })
  document.documentElement.classList.add('is-smooth')

  return () => {
    loco?.destroy()
    loco = null
    document.documentElement.classList.remove('is-smooth')
  }
}
