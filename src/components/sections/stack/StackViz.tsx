import { lazy, Suspense, useMemo, useState } from 'react'
import { site } from '@/content/site'
import { stack } from '@/content/stack'
import github from '@/content/generated/github.json'
import { useNearViewport } from '@/engine/near'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { ArrowUpRight } from '@/components/primitives/Icons'
import { buildToolData } from './data'
import s from './StackViz.module.css'

const Orbit = lazy(() => import('./Orbit'))

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthYear = (iso: string) => {
  const d = new Date(iso)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/**
 * "Stack, in practice". The grouped list is the accessible source of truth (and the no-JS
 * view); the D3 orbit is a lazy, decorative enhancement that mirrors whatever the list selects.
 */
export function StackViz() {
  const h = site.sections.stack!
  const tools = useMemo(buildToolData, [])
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const active = hovered ?? pinned
  const info = tools.find((t) => t.name === active)
  const [vizRef, near] = useNearViewport<HTMLDivElement>('500px 0px')
  const related = new Set(info?.related ?? [])

  return (
    <section
      id="stack"
      className={s.section}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="stack-title"
      tabIndex={-1}
    >
      <SectionHeading
        id="stack-title"
        index={h.index}
        label={h.label}
        title={h.title}
        kicker={h.kicker}
      />

      <div className={`${s.layout} grid`}>
        <div ref={vizRef} className={s.viz}>
          <div className={s.vizFrame}>
            {near ? (
              <Suspense fallback={null}>
                <Orbit tools={tools} active={active} onActive={setHovered} />
              </Suspense>
            ) : null}
          </div>
          <p className={`${s.caption} mono dim`}>
            Dot size = projects below that used it · hollow = I use it, not in anything listed yet
          </p>
        </div>

        <div className={s.side}>
          <div className={s.legend}>
            {stack.layers.map((layer) => (
              <div key={layer.id} className={s.group}>
                <h3 className={`${s.groupTitle} mono dim`}>{layer.label}</h3>
                <ul role="list" className={s.tools}>
                  {layer.tools.map((name) => {
                    const t = tools.find((x) => x.name === name)!
                    const state = !info
                      ? 'idle'
                      : name === active
                        ? 'active'
                        : related.has(name)
                          ? 'related'
                          : 'dim'
                    return (
                      <li key={name}>
                        <button
                          type="button"
                          className={s.tool}
                          data-state={state}
                          aria-pressed={pinned === name}
                          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(name)}
                          onPointerLeave={() => setHovered(null)}
                          onFocus={() => setHovered(name)}
                          onBlur={() => setHovered(null)}
                          onClick={() => setPinned((p) => (p === name ? null : name))}
                        >
                          {name}
                          <span className={s.count}>{t.projects.length}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className={s.readout} aria-live="polite">
            {info ? (
              <>
                <p className={s.readoutTitle}>
                  <em className="accent">{info.name}</em>{' '}
                  <span className="dim">
                    —{' '}
                    {info.projects.length
                      ? `used in ${info.projects.length} of the projects above`
                      : 'in my toolbox, not in a listed project yet'}
                  </span>
                </p>
                {info.projects.length ? (
                  <ul role="list" className={`${s.readoutList} mono`}>
                    {info.projects.map((p) => (
                      <li key={p.slug}>{p.title}</li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : (
              <p className="dim">Point at (or tab to) a tool. Tap to pin it.</p>
            )}
          </div>
        </div>
      </div>

      {github.repos.length ? (
        <div className={`${s.github} grid`}>
          <p className={`${s.githubTitle} mono`}>
            Recently pushed <span className="dim">· github.com/{github.user}</span>
          </p>
          <ul role="list" className={s.repos}>
            {github.repos.slice(0, 4).map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noreferrer" className={s.repo}>
                  <span className={s.repoName}>{r.name}</span>
                  <span className="mono dim">{r.language || '—'}</span>
                  <span className="mono dim">{monthYear(r.pushedAt)}</span>
                  <ArrowUpRight size={14} className={s.repoArrow} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
