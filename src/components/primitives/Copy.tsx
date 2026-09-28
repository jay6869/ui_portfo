import { Fragment } from 'react'
import { PLACEHOLDER_RE } from '@/content/placeholders'
import { Rich } from './Rich'
import s from './Copy.module.css'

/**
 * Renders content copy. `[PLACEHOLDER]` and `[EDIT ME: note]` become visible mono tags so
 * unfinished content is obvious (and still looks intentional); `*word*` becomes the accent.
 */
export function Copy({ text, rich = false }: { text: string; rich?: boolean }) {
  const parts: Array<{ kind: 'text' | 'token'; value: string; label?: string }> = []
  let last = 0
  for (const m of text.matchAll(PLACEHOLDER_RE)) {
    const i = m.index ?? 0
    if (i > last) parts.push({ kind: 'text', value: text.slice(last, i) })
    parts.push({ kind: 'token', value: m[2] ?? '', label: m[1] })
    last = i + m[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) })

  return parts.map((p, i) =>
    p.kind === 'text' ? (
      <Fragment key={i}>
        {rich ? (
          <Rich text={p.value.replace(/^\s+/, i > 0 ? ' ' : '')} />
        ) : (
          p.value.replace(/^\s+/, i > 0 ? ' ' : '')
        )}
      </Fragment>
    ) : (
      <Fragment key={i}>
        <span className={s.token} title="Placeholder — edit in src/content">
          {p.label === 'EDIT ME' ? 'Edit me' : 'Placeholder'}
        </span>
        {p.value ? <span className={s.note}> {p.value}</span> : null}
      </Fragment>
    ),
  )
}
