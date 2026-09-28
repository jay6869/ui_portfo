import { useRef, type CSSProperties } from 'react'
import { site } from '@/content/site'
import { services } from '@/content/services'
import { gsap, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import s from './Services.module.css'

function Title({ title, emphasis }: { title: string; emphasis: string }) {
  const i = title.indexOf(emphasis)
  if (i < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, i)}
      <em className="accent">{emphasis}</em>
      {title.slice(i + emphasis.length)}
    </>
  )
}

/**
 * Sticky stacked cards. Pinning is CSS `position: sticky` (robust, no pin-spacers, works without
 * JS); ScrollTrigger only scrubs the covered card's scale and a shade layer (transform/opacity —
 * no blur filter, which would repaint every frame).
 */
export function Services() {
  const root = useRef<HTMLElement>(null)
  const h = site.sections.services!

  useGSAP(
    () => {
      if (matches(QUERIES.reducedMotion)) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        const inner = card.querySelector('[data-card-inner]')
        const shade = card.querySelector('[data-shade]')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: 0.4 },
        })
        tl.to(inner, { scale: 0.93, yPercent: -3, ease: 'none' }, 0).to(
          shade,
          { opacity: 0.62, ease: 'none' },
          0,
        )
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="services"
      className={s.section}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="services-title"
      tabIndex={-1}
    >
      <SectionHeading
        id="services-title"
        index={h.index}
        label={h.label}
        title={h.title}
        kicker={h.kicker}
      />
      <ol className={s.stack} role="list">
        {services.map((sv, i) => (
          <li key={sv.id} className={s.card} data-card style={{ '--i': i } as CSSProperties}>
            <article className={s.inner} data-card-inner aria-labelledby={`svc-${sv.id}`}>
              <div className={s.top}>
                <span className="mono dim">
                  {String(i + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                </span>
                <span className={s.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 id={`svc-${sv.id}`} className={s.title}>
                <Title title={sv.title} emphasis={sv.emphasis} />
              </h3>
              <p className={s.body}>{sv.body}</p>
              <ul className={`${s.tools} mono`} role="list" aria-label="Related tools">
                {sv.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className={s.shade} data-shade aria-hidden="true" />
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
