import { Fragment, type ReactNode } from 'react'

export interface Segment {
  text: string
  em: boolean
}

/** "Selected *work*" → [{text:'Selected ', em:false}, {text:'work', em:true}] */
export function parseEmphasis(input: string): Segment[] {
  const out: Segment[] = []
  const re = /\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    if (m.index > last) out.push({ text: input.slice(last, m.index), em: false })
    out.push({ text: m[1]!, em: true })
    last = m.index + m[0].length
  }
  if (last < input.length) out.push({ text: input.slice(last), em: false })
  return out
}

export const plain = (input: string) => input.replace(/\*([^*]+)\*/g, '$1')

/** Render `*word*` emphasis as the italic clay accent. */
export function Rich({ text }: { text: string }): ReactNode {
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

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')
