import { lazy, Suspense, useRef } from 'react'
import { site } from '@/content/site'
import { about } from '@/content/about'
import { gsap, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { useNearViewport } from '@/engine/near'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { Copy } from '@/components/primitives/Copy'
import { ProjectCover } from '@/components/art/ProjectCover'
import { LocalTime } from '@/components/chrome/LocalTime'
import s from './About.module.css'

const SriLankaMap = lazy(() => import('./SriLankaMap'))

function Portrait() {
  const p = about.portrait
  if (p.type !== 'placeholder') {
    return (
      <div className={`${s.portraitMedia} ${s.duotone}`}>
        <ProjectCover media={p} sizes="(min-width: 1024px) 40vw, 100vw" />
      </div>
    )
  }
  return (
    <div className={s.portraitMedia} role="img" aria-label={p.alt}>
      <svg
        className={s.portraitArt}
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="400" height="500" fill="var(--art-2)" />
        <circle cx="200" cy="205" r="92" fill="var(--art-1)" />
        <path d="M40 520 C 60 360, 340 360, 360 520 Z" fill="var(--art-1)" />
        <text
          x="318"
          y="470"
          textAnchor="middle"
          fontFamily="Instrument Serif, serif"
          fontStyle="italic"
          fontSize="300"
          fill="var(--art-4)"
          fillOpacity="0.9"
        >
          J
        </text>
      </svg>
      <p className={`${s.portraitNote} mono`}>Photo pending. Picture someone friendly.</p>
    </div>
  )
}

export function About() {
  const root = useRef<HTMLElement>(null)
  const h = site.sections.about!
  const [mapRef, nearMap] = useNearViewport<HTMLDivElement>('300px 0px')

  useGSAP(
    () => {
      if (matches(QUERIES.reducedMotion)) return
      gsap.fromTo(
        '[data-portrait]',
        { clipPath: 'inset(14% 18% 14% 18% round 4px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 4px)',
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-portrait]',
            start: 'top 90%',
            end: 'top 30%',
            scrub: 0.5,
          },
        },
      )
      gsap.fromTo(
        '[data-portrait] > *',
        { scale: 1.18 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-portrait]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="about"
      className={s.section}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="about-title"
      tabIndex={-1}
    >
      <SectionHeading
        id="about-title"
        index={h.index}
        label={h.label}
        title={h.title}
        kicker={h.kicker}
      />

      <div className={`${s.main} grid`}>
        <figure className={s.portrait}>
          <div className={s.portraitFrame} data-portrait>
            <Portrait />
          </div>
          <figcaption className="mono dim">
            {site.name} · {site.location.country} · <LocalTime />
          </figcaption>
        </figure>

        <div className={s.text}>
          <div className={s.bio}>
            {about.bio.map((para, i) => (
              <p key={i} className={i === 0 ? s.lead : undefined}>
                <Copy text={para} />
              </p>
            ))}
          </div>

          <dl className={s.facts}>
            {about.facts.map((f) => (
              <div key={f.label} className={s.fact}>
                <dt className="mono dim">{f.label}</dt>
                <dd>
                  <Copy text={f.value} />
                </dd>
              </div>
            ))}
          </dl>

          {about.map.enabled ? (
            <figure className={s.mapFigure}>
              <div ref={mapRef} className={s.mapFrame}>
                {nearMap ? (
                  <Suspense fallback={null}>
                    <SriLankaMap />
                  </Suspense>
                ) : null}
              </div>
              <figcaption className="mono dim">
                {site.location.country} · {site.location.offsetLabel} · outline: Natural Earth
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>

      <div className={`${s.principles} grid`}>
        <h3 className={`${s.principlesTitle} mono`}>How I work</h3>
        <ol className={s.principleList} role="list">
          {about.principles.map((p, i) => (
            <li key={p.title} className={s.principle}>
              <span className="mono dim">{String(i + 1).padStart(2, '0')}</span>
              <h4 className={s.principleName}>{p.title}</h4>
              <p className="dim">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
