import { useEffect, type CSSProperties } from 'react'
import { site } from '@/content/site'
import { useUI } from '@/stores/ui'
import { KEYS, store } from '@/lib/storage'
import { HERO_INTRO_EVENT } from '@/components/sections/Hero'
import s from './Preloader.module.css'

/** Keep in sync with the keyframe timings in Preloader.module.css. */
export const PRELOADER = { revealMs: 1100, doneMs: 1900, shortMs: 450, skipMs: 650 } as const

/**
 * First-visit theatre. It is pure CSS and starts at first paint, so it never waits for (or
 * delays) JavaScript; the hero underneath is painted from the first frame. JS only marks the
 * session, tells the hero when the curtain opens (so GSAP can run the letter stagger), and
 * cleans up. Any key/click skips — handled by the head script, so it works before hydration.
 */
export function Preloader() {
  const status = useUI((st) => st.preloader)
  const setStatus = useUI((st) => st.setPreloader)

  useEffect(() => {
    const html = document.documentElement
    const mode = html.dataset.preloader
    if (!mode) {
      setStatus('done')
      return
    }
    setStatus('running')
    store.set(KEYS.seen, '1', true)

    // CSS animations started at first paint ≈ navigation start + FCP; this is close enough.
    const t0 = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
    const now = performance.now()
    const skipped = () => html.classList.contains('pl-skip')
    const revealAt = mode === 'short' ? 0 : t0 + PRELOADER.revealMs
    const doneAt = mode === 'short' ? t0 + PRELOADER.shortMs : t0 + PRELOADER.doneMs

    let revealed = false
    const reveal = (late: boolean) => {
      if (revealed) return
      revealed = true
      setStatus('revealing')
      window.dispatchEvent(new CustomEvent(HERO_INTRO_EVENT, { detail: { late } }))
    }
    const finish = () => {
      reveal(true)
      html.removeAttribute('data-preloader')
      html.classList.remove('pl-skip')
      setStatus('done')
    }

    const timers: number[] = []
    if (skipped()) {
      reveal(now - (window.__jgSkipAt ?? now) > 120)
      timers.push(window.setTimeout(finish, PRELOADER.skipMs))
    } else {
      // Hydrated before the curtain opens → the hero letters can rise with it (GSAP).
      timers.push(
        window.setTimeout(
          () => reveal(performance.now() - revealAt > 150),
          Math.max(0, revealAt - now),
        ),
      )
      timers.push(window.setTimeout(finish, Math.max(0, doneAt - now) + 50))
      const onSkip = () => {
        timers.forEach(window.clearTimeout)
        reveal(false)
        timers.push(window.setTimeout(finish, PRELOADER.skipMs))
      }
      window.addEventListener('keydown', onSkip, { once: true })
      window.addEventListener('pointerdown', onSkip, { once: true })
      return () => {
        timers.forEach(window.clearTimeout)
        window.removeEventListener('keydown', onSkip)
        window.removeEventListener('pointerdown', onSkip)
      }
    }
    return () => timers.forEach(window.clearTimeout)
  }, [setStatus])

  if (status === 'done') return null

  return (
    <div className={s.preloader} aria-hidden="true">
      <div className={s.panels}>
        <div className={s.panel} />
        <div className={s.panel} />
      </div>
      <div className={s.content}>
        <p className={s.name}>
          {Array.from(site.name).map((c, i) => (
            <span key={i} className={s.mask}>
              <span className={s.char} style={{ '--i': i } as CSSProperties}>
                {c === ' ' ? ' ' : c}
              </span>
            </span>
          ))}
        </p>
        <ul className={`${s.lines} mono`}>
          {site.preloader.lines.map((l, i) => (
            <li key={l} style={{ '--i': i } as CSSProperties}>
              <span className={s.lineIndex}>0{i + 1}</span> {l}
            </li>
          ))}
        </ul>
        <p className={s.counter}>
          <span className={s.num} />
        </p>
        <p className={`${s.skip} mono`}>Press any key to skip</p>
      </div>
    </div>
  )
}
