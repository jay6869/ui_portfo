import { flushSync } from 'react-dom'
import { useUI, type Theme } from '@/stores/ui'
import { QUERIES, matches } from '@/engine/media'
import { EASE } from '@/engine/ease'

const THEME_COLOR: Record<Theme, string> = { charcoal: '#1d1c1a', paper: '#efeae0' }

function apply(next: Theme) {
  const html = document.documentElement
  html.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next])
  flushSync(() => useUI.getState().setTheme(next))
}

/**
 * Switch theme with a circular reveal from `origin` (View Transitions API). Falls back to a
 * short colour cross-fade, or an instant swap with reduced motion.
 */
export function switchTheme(next: Theme, origin?: { x: number; y: number }) {
  const reduce = matches(QUERIES.reducedMotion)
  if (reduce) return apply(next)

  if (!document.startViewTransition || document.visibilityState !== 'visible') {
    const html = document.documentElement
    html.classList.add('theme-fade')
    apply(next)
    window.setTimeout(() => html.classList.remove('theme-fade'), 500)
    return
  }

  const x = origin?.x ?? window.innerWidth - 48
  const y = origin?.y ?? 36
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  // The update callback needs a rendering opportunity; in a throttled or hidden frame it may
  // never come. Never let the theme depend on it: apply directly after a short grace period.
  let applied = false
  const vt = document.startViewTransition(() => {
    applied = true
    apply(next)
  })
  window.setTimeout(() => {
    if (applied) return
    vt.skipTransition()
    applied = true
    apply(next)
  }, 600)
  void vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      {
        duration: 750,
        easing: `cubic-bezier(${EASE.inout.join(',')})`,
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}

export function toggleTheme(origin?: { x: number; y: number }) {
  const current = useUI.getState().theme
  switchTheme(current === 'paper' ? 'charcoal' : 'paper', origin)
}
