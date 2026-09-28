import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '@/content/projects'
import { useNearViewport } from '@/engine/near'
import { ProjectCover } from '@/components/art/ProjectCover'
import { Tag } from '@/components/primitives/Tag'
import { hasToken, stripTokens } from '@/lib/text'
import { useOpenProject } from './useSharedNav'
import s from './Work.module.css'

/**
 * Mobile/touch: card carousel with a peek of the next card. Server-rendered as a CSS
 * scroll-snap track; upgraded to Swiper (lazy chunk) when it nears the viewport.
 */
export function WorkCarousel() {
  const [host, near] = useNearViewport<HTMLDivElement>('400px 0px')
  const swiperEl = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const open = useOpenProject()

  useEffect(() => {
    if (!near || !swiperEl.current) return
    if (!matchMedia('(max-width: 1023px), (hover: none), (pointer: coarse)').matches) return
    let sw: { destroy: (a?: boolean, b?: boolean) => void } | null = null
    let cancelled = false
    void import('./swiper').then(({ initSwiper }) => {
      if (cancelled || !swiperEl.current) return
      sw = initSwiper(swiperEl.current, setIndex)
    })
    return () => {
      cancelled = true
      sw?.destroy(true, true)
    }
  }, [near])

  return (
    <div ref={host} className={s.carousel}>
      <div ref={swiperEl} className={`swiper ${s.swiper}`}>
        <ul className={`swiper-wrapper ${s.track}`} role="list">
          {projects.map((p, i) => (
            <li key={p.slug} className={`swiper-slide ${s.slide}`}>
              <Link
                to={`/work/${p.slug}`}
                className={s.card}
                onClick={(e) =>
                  open(e, p.slug, e.currentTarget.querySelector('[data-cover-source]'))
                }
              >
                <div className={s.cardCover} data-cover-source={p.slug}>
                  <ProjectCover media={p.cover} sizes="85vw" />
                </div>
                <div className={s.cardMeta}>
                  <span className="mono dim">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mono dim">{p.year}</span>
                </div>
                <h3 className={s.cardTitle}>
                  {stripTokens(p.title)}
                  {hasToken(p.title) ? (
                    <Tag tone="placeholder" className={s.cardTag}>
                      Placeholder
                    </Tag>
                  ) : null}
                </h3>
                <p className={`${s.cardDiscipline} mono dim`}>{p.discipline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.progress} aria-hidden="true">
        <span className="mono">{String(index + 1).padStart(2, '0')}</span>
        <span className={s.progressTrack}>
          <span
            className={s.progressBar}
            style={{ transform: `scaleX(${(index + 1) / projects.length})` }}
          />
        </span>
        <span className="mono dim">{String(projects.length).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
