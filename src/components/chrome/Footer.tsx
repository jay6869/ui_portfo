import { useRef } from 'react'
import { site } from '@/content/site'
import { gsap, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { useSectionNav } from '@/engine/nav'
import { TextRoll } from '@/components/primitives/TextRoll'
import { ArrowUp } from '@/components/primitives/Icons'
import { LocalTime } from './LocalTime'
import s from './Footer.module.css'

/** Giant clipped name that rises into place, back-to-top, local time and the small print. */
export function Footer() {
  const root = useRef<HTMLElement>(null)
  const goTo = useSectionNav()

  useGSAP(
    () => {
      if (matches(QUERIES.reducedMotion)) return
      gsap.fromTo(
        '[data-giant]',
        { yPercent: 72 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <footer ref={root} className={s.footer}>
      <div className={`${s.top} grid`}>
        <button type="button" className={`${s.toTop} mono`} onClick={() => goTo('top')}>
          <ArrowUp size={14} />
          <TextRoll text="Back to top" />
        </button>
        <p className={`${s.time} mono`}>
          <span className="dim">{site.location.country}</span> <LocalTime seconds />
        </p>
        <p className={`${s.copy} mono dim`}>
          © {site.footer.year} {site.name}
        </p>
      </div>

      <div className={s.giantMask} aria-hidden="true">
        <svg
          className={s.giant}
          data-giant
          viewBox="0 0 1000 176"
          preserveAspectRatio="xMidYMax meet"
        >
          <text x="2" y="150" textLength="996" lengthAdjust="spacingAndGlyphs">
            <tspan className={s.giantAccent}>{site.name.slice(0, 1)}</tspan>
            {site.name.slice(1)}
          </text>
        </svg>
      </div>

      <div className={`${s.bottom} grid`}>
        <p className="mono dim">{site.footer.madeWith}</p>
        <p className={`${s.hint} mono dim`}>
          Press <kbd>?</kbd> for shortcuts
        </p>
      </div>
    </footer>
  )
}
