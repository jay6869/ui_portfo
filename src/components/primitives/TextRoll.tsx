import type { CSSProperties } from 'react'
import { cx } from '@/lib/text'
import s from './TextRoll.module.css'

interface Props {
  text: string
  className?: string
  /** Stagger per character (default) or roll the whole label as one piece. */
  mode?: 'chars' | 'whole'
}

/**
 * Hover/focus text roll: the label slides up and an identical copy follows from below.
 * Triggered by the nearest interactive ancestor (a, button, label) — no JS.
 * Screen readers get the plain text once; the animated copies are aria-hidden.
 */
export function TextRoll({ text, className, mode = 'chars' }: Props) {
  const pieces = mode === 'chars' ? Array.from(text) : [text]
  return (
    <span className={cx(s.roll, className)}>
      <span className="sr-only">{text}</span>
      <span className={s.visual} aria-hidden="true">
        {pieces.map((ch, i) => (
          <span key={i} className={s.char} style={{ '--i': i } as CSSProperties}>
            <span className={s.a}>{ch === ' ' ? ' ' : ch}</span>
            <span className={s.b}>{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
