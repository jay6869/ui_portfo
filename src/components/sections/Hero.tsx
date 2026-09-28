import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { site } from '@/content/site'
import { gsap, useGSAP } from '@/engine/gsap'
import { QUERIES, hasWebGL, isLowPower, matches } from '@/engine/media'
import { useSectionNav } from '@/engine/nav'
import { STAGGER } from '@/engine/ease'
import { BlobFallback } from '@/components/art/BlobFallback'
import s from './Hero.module.css'

const HeroBlob = lazy(() => import('@/components/three/HeroBlob'))

export const HERO_INTRO_EVENT = 'jg:hero-intro'

/**
 * Hero. The name is server-rendered and visible from the first frame (it's the LCP element);
 * intro animations only ever start from states that are hidden behind the preloader curtain
 * or by the head script on return visits, so nothing flashes.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [blob, setBlob] = useState(false)
  const goTo = useSectionNav()
  const [first, ...rest] = site.name.split(' ')
  const lines = [first ?? '', rest.join(' ')]

  // ── Intro timeline ─────────────────────────────────────────────
  useGSAP(
    () => {
      const html = document.documentElement
      const chars = gsap.utils.toArray<HTMLElement>('[data-char]', root.current)
      const fades = gsap.utils.toArray<HTMLElement>('[data-hero-fade]', root.current)
      const reduce = matches(QUERIES.reducedMotion)

      const play = (delay = 0) => {
        if (reduce) {
          gsap.set(chars, { yPercent: 0, y: 0 })
          gsap.to(fades, { opacity: 1, duration: 0.3, ease: 'none', delay })
          html.removeAttribute('data-intro')
          return
        }
        nameRef.current?.classList.add(s.masked!)
        const tl = gsap.timeline({
          delay,
          onComplete: () => {
            nameRef.current?.classList.remove(s.masked!)
            html.removeAttribute('data-intro') // lifts the first-paint mask (descenders)
          },
        })
        tl.fromTo(
          chars,
          { yPercent: 112, y: 0 },
          { yPercent: 0, y: 0, duration: 1.15, stagger: STAGGER.char * 1.6, ease: 'workshop' },
          0,
        ).fromTo(
          fades,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'workshop' },
          0.45,
        )
      }

      const onIntro = () => play(0)
      if (html.dataset.preloader) {
        // First visit: the preloader tells us when the curtain starts to open.
        window.addEventListener(HERO_INTRO_EVENT, onIntro, { once: true })
        return () => window.removeEventListener(HERO_INTRO_EVENT, onIntro)
      }
      if (html.dataset.intro === 'return' || html.dataset.navigated)
        play(html.dataset.navigated ? 0.35 : 0.1)
    },
    { scope: root },
  )

  // ── Letters lean away from the cursor (fine pointers, full motion only) ──
  useEffect(() => {
    const hero = root.current
    const name = nameRef.current
    if (!hero || !name || !matches(QUERIES.finePointer) || matches(QUERIES.reducedMotion)) return
    const chars = Array.from(name.querySelectorAll<HTMLElement>('[data-char-inner]'))
    const setters = chars.map((c) => ({
      y: gsap.quickTo(c, 'yPercent', { duration: 0.8, ease: 'power3.out' }),
      skew: gsap.quickTo(c, 'skewX', { duration: 0.8, ease: 'power3.out' }),
    }))
    let centers: Array<{ x: number; y: number }> = []
    const measure = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + window.scrollY + r.height / 2 }
      })
    }
    const radius = () => Math.max(window.innerWidth * 0.14, 160)
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!centers.length) measure()
      const R = radius()
      const py = e.clientY + window.scrollY
      centers.forEach((c, i) => {
        const dx = e.clientX - c.x
        const dy = py - c.y
        const d = Math.hypot(dx, dy)
        const f = Math.max(0, 1 - d / R)
        const ease = f * f * (3 - 2 * f) // smoothstep
        setters[i]!.y(-7 * ease)
        setters[i]!.skew(gsap.utils.clamp(-9, 9, (-dx / R) * 12 * ease))
      })
    }
    const leave = () => setters.forEach((st) => (st.y(0), st.skew(0)))
    const invalidate = () => (centers = [])
    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerleave', leave)
    window.addEventListener('resize', invalidate)
    void document.fonts?.ready.then(invalidate)
    return () => {
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', leave)
      window.removeEventListener('resize', invalidate)
    }
  }, [])

  // ── WebGL blob: after first paint, only where it'll run well ──
  useEffect(() => {
    if (matches(QUERIES.reducedMotion) || isLowPower() || !hasWebGL()) return
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setBlob(true), { timeout: 2500 })
    return () => cancel(id)
  }, [])

  let charIndex = 0
  return (
    <section ref={root} className={s.hero} id="top" aria-labelledby="hero-name" tabIndex={-1}>
      <div className={s.lamp} aria-hidden="true" />

      <p className={`${s.eyebrow} mono`} data-hero-fade>
        {site.eyebrow.split(' · ').map((part, i) => (
          <span key={i} className={s.eyebrowPart}>
            {part}
          </span>
        ))}
      </p>

      <div className={s.blob} aria-hidden="true">
        <BlobFallback />
        {blob ? (
          <Suspense fallback={null}>
            <HeroBlob />
          </Suspense>
        ) : null}
      </div>

      <h1 ref={nameRef} id="hero-name" className={s.name} aria-label={site.name}>
        {lines.map((line, li) => (
          <span key={li} className={`${s.line} ${li === 1 ? s.lineTwo : ''}`} aria-hidden="true">
            {Array.from(line).map((ch, ci) => {
              const accent = li === 0 && ci === 0
              const i = charIndex++
              return (
                <span key={ci} className={s.char} data-char data-i={i}>
                  <span className={accent ? s.accent : undefined} data-char-inner>
                    {ch}
                  </span>
                </span>
              )
            })}
          </span>
        ))}
      </h1>

      <p className={s.intro} data-hero-fade>
        {site.intro}
      </p>

      <ul className={`${s.facts} mono`} role="list" data-hero-fade>
        {site.hero.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div className={s.bottom} data-hero-fade>
        <p className={`${s.status} mono`} data-open={site.availability.open}>
          <span className={s.statusDot} aria-hidden="true" />
          {site.availability.open ? site.availability.label : site.availability.closedLabel}
        </p>
        <a href="/#work" className={`${s.scroll} mono`} onClick={(e) => goTo('work', e)}>
          <span>{site.hero.scrollLabel}</span>
          <span className={s.scrollLine} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
