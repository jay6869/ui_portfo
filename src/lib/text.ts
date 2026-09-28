import { PLACEHOLDER_RE } from '@/content/placeholders'

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

/** Strip `*emphasis*` markers. */
export const plain = (input: string) => input.replace(/\*([^*]+)\*/g, '$1')

/** Remove [PLACEHOLDER] / [EDIT ME: …] markers (meta tags, wipes, aria-labels). */
export function stripTokens(text: string): string {
  return plain(text)
    .replace(PLACEHOLDER_RE, (_m, _kind, note?: string) => note ?? '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function hasToken(text: string): boolean {
  return new RegExp(PLACEHOLDER_RE.source).test(text)
}

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')
