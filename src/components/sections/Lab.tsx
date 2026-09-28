import { lazy, Suspense, useState } from 'react'
import { site } from '@/content/site'
import { lab } from '@/content/lab'
import type { LabItem } from '@/content/schema'
import { useNearViewport } from '@/engine/near'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { Tag } from '@/components/primitives/Tag'
import { ArrowUpRight } from '@/components/primitives/Icons'
import { TextRoll } from '@/components/primitives/TextRoll'
import SortSpecimen from '@/components/lab/SortSpecimen'
import ToneKeys from '@/components/lab/ToneKeys'
import TapeMeasure from '@/components/lab/TapeMeasure'
import s from '@/components/lab/Lab.module.css'

const P5Loom = lazy(() => import('@/components/lab/P5Loom'))

function Stage({ item, signal, near }: { item: LabItem; signal: number; near: boolean }) {
  switch (item.id) {
    case 'loom':
      return signal ? (
        <Suspense fallback={<LoomPoster loading />}>
          <P5Loom />
        </Suspense>
      ) : (
        <LoomPoster />
      )
    case 'specimen':
      return <SortSpecimen shuffleSignal={signal} enhance={near} />
    case 'keys':
      return <ToneKeys onSignal={signal} />
    case 'tape':
      return <TapeMeasure />
  }
}

function LoomPoster({ loading = false }: { loading?: boolean }) {
  return (
    <div className={s.poster} aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 26 }, (_, i) => (
          <path
            key={i}
            d={`M-10 ${40 + i * 9} C 90 ${10 + i * 11}, 220 ${120 + i * 4}, 410 ${60 + i * 8}`}
            fill="none"
            stroke={i === 17 ? 'var(--art-4)' : 'var(--art-3)'}
            strokeOpacity={i === 17 ? 0.9 : 0.18}
            strokeWidth={i === 17 ? 1.4 : 0.8}
          />
        ))}
      </svg>
      {loading ? <span className={`${s.posterNote} mono`}>Loading p5…</span> : null}
    </div>
  )
}

/** Lab: four small experiments. Heavy libraries load only when a card is used. */
export function Lab() {
  const h = site.sections.lab!
  const [signals, setSignals] = useState<Record<string, number>>({})
  const [ref, near] = useNearViewport<HTMLElement>('300px 0px')

  return (
    <section
      ref={ref}
      id="lab"
      className={s.section}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="lab-title"
      tabIndex={-1}
    >
      <SectionHeading
        id="lab-title"
        index={h.index}
        label={h.label}
        title={h.title}
        kicker={h.kicker}
      />
      <ul className={`${s.grid}`} role="list">
        {lab.map((item, i) => (
          <li key={item.id} className={s.card} data-id={item.id}>
            <div className={s.stage}>
              <Stage item={item} signal={signals[item.id] ?? 0} near={near} />
            </div>
            <div className={s.meta}>
              <div className={s.metaTop}>
                <span className="mono dim">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={s.title}>{item.title}</h3>
                {item.id !== 'tape' ? (
                  <button
                    type="button"
                    className={`${s.action} mono`}
                    onClick={() =>
                      setSignals((st) => ({ ...st, [item.id]: (st[item.id] ?? 0) + 1 }))
                    }
                  >
                    <TextRoll text={item.id === 'loom' && signals.loom ? 'Running' : item.action} />
                  </button>
                ) : (
                  <span className={`${s.action} ${s.actionStatic} mono`}>{item.action}</span>
                )}
              </div>
              <p className={s.blurb}>{item.blurb}</p>
              <div className={s.metaBottom}>
                <ul className={s.tags} role="list">
                  {item.tags.map((t) => (
                    <Tag as="li" key={t}>
                      {t}
                    </Tag>
                  ))}
                </ul>
                <a
                  className={`${s.source} mono`}
                  href={`${site.repo.url}/blob/main/${item.source}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TextRoll text="View source" /> <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
