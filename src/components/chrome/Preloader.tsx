import { useEffect, useRef } from 'react'
import { site } from '@/content/site'
import { gsap } from '@/engine/gsap'
import { useUI } from '@/stores/ui'
import { KEYS, store } from '@/lib/storage'
import { HERO_INTRO_EVENT } from '@/components/sections/Hero'
import s from './Preloader.module.css'

/**
 * First-visit theatre, layered over an already-rendered page. The markup is prerendered and only
 * shown when the head script set html[data-preloader] (first visit this session). The hero is
 * painted underneath from the first frame, so this never delays real content — it just decides
 * when you get to see it. Any key or click skips it.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const status = useUI((st) => st.preloader)
  const setStatus = useUI((st) => st.setPreloader)

  useEffect(() => {
    const html = document.documentElement
    const mode = html.dataset.preloader
    const el = root.current
    if (!mode || !el) {
      setStatus('done')
      return
    }
    setStatus('running')
    store.set(KEYS.seen, '1', true)

    const finish = () => {
      html.removeAttribute('data-preloader')
      setStatus('done')
    }
    const reveal = () => {
      setStatus('revealing')
      window.dispatchEvent(new Event(HERO_INTRO_EVENT))
    }

    const q = gsap.utils.selector(el)
    const lines = q('[data-line]')
    const chars = q('[data-pchar]')
    const panels = q('[data-panel]')
    const content = q('[data-content]')

    if (mode === 'short') {
      const tl = gsap.timeline({ onComplete: finish })
      tl.set(lines, { opacity: 1 })
        .call(reveal, [], 0.25)
        .to(el, { opacity: 0, duration: 0.3, ease: 'none' }, 0.25)
      return () => {
        tl.kill()
      }
    }

    const count = { v: 0 }
    const tl = gsap.timeline({ onComplete: finish })
    tl.fromTo(
      chars,
      { yPercent: 110, y: 0 },
      { yPercent: 0, y: 0, duration: 0.8, stagger: 0.035, ease: 'workshop' },
      0.1,
    )
      .to(
        count,
        {
          v: 100,
          duration: 1.25,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counter.current)
              counter.current.textContent = String(Math.round(count.v)).padStart(3, '0')
          },
        },
        0,
      )
      .fromTo(lines[0]!, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35 }, 0.1)
      .fromTo(lines[1]!, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35 }, 0.55)
      .fromTo(lines[2]!, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35 }, 1.05)
      .addLabel('reveal', 1.35)
      .to(content, { yPercent: -30, opacity: 0, duration: 0.35, ease: 'power2.in' }, 'reveal')
      .call(reveal, [], 'reveal+=0.1')
      .to(panels, { yPercent: -100, duration: 0.8, stagger: 0.08, ease: 'wipe' }, 'reveal+=0.1')

    const skip = () => {
      if (tl.time() < tl.labels.reveal!) tl.seek('reveal')
      tl.timeScale(1.6)
    }
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      tl.kill()
    }
  }, [setStatus])

  if (status === 'done') return null

  return (
    <div ref={root} className={s.preloader} aria-hidden="true">
      <div className={s.panels}>
        <div className={s.panel} data-panel />
        <div className={s.panel} data-panel />
      </div>
      <div className={s.content} data-content>
        <p className={s.name}>
          {Array.from(site.name).map((c, i) => (
            <span key={i} className={s.mask}>
              <span className={s.char} data-pchar>
                {c === ' ' ? ' ' : c}
              </span>
            </span>
          ))}
        </p>
        <ul className={`${s.lines} mono`}>
          {site.preloader.lines.map((l, i) => (
            <li key={l} data-line>
              <span className={s.lineIndex}>0{i + 1}</span> {l}
            </li>
          ))}
        </ul>
        <p className={s.counter}>
          <span ref={counter}>000</span>
        </p>
        <p className={`${s.skip} mono`}>Press any key to skip</p>
      </div>
    </div>
  )
}
