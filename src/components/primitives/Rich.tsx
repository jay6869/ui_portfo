import { Fragment } from 'react'
import { parseEmphasis } from '@/lib/text'

/** Render `*word*` emphasis as the italic clay accent. */
export function Rich({ text }: { text: string }) {
  return parseEmphasis(text).map((s, i) =>
    s.em ? (
      <em key={i} className="accent">
        {s.text}
      </em>
    ) : (
      <Fragment key={i}>{s.text}</Fragment>
    ),
  )
}
