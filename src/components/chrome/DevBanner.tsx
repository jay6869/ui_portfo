import { useEffect, useState } from 'react'
import { placeholderReport } from '@/content/placeholders'
import { KEYS, store } from '@/lib/storage'
import s from './DevBanner.module.css'

/** DEV ONLY (tree-shaken from production): what's still placeholder content. */
export default function DevBanner() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const report = placeholderReport()
  const total = report.reduce((n, r) => n + r.count, 0)

  useEffect(() => {
    setOpen(store.get(KEYS.placeholderBanner) !== 'dismissed')
  }, [])
  if (!open || !report.length) return null

  return (
    <aside className={s.banner} aria-label="Placeholder content report (development only)">
      <button
        type="button"
        className={`${s.head} mono`}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className={s.dot} aria-hidden="true" />
        {total} placeholders left
      </button>
      {expanded ? (
        <ul className={s.list}>
          {report.map((r) => (
            <li key={r.file}>
              <span className="mono">src/content/{r.file}</span> — {r.count} marker
              {r.count === 1 ? '' : 's'}
              {r.notes.length ? <span className={s.notes}>{r.notes.join(' · ')}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        className={`${s.dismiss} mono`}
        onClick={() => {
          store.set(KEYS.placeholderBanner, 'dismissed')
          setOpen(false)
        }}
      >
        Hide
      </button>
    </aside>
  )
}
