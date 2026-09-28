import type { ReactNode } from 'react'
import { cx } from '@/lib/text'
import s from './Tag.module.css'

interface Props {
  children: ReactNode
  tone?: 'default' | 'accent' | 'placeholder'
  as?: 'span' | 'li'
  className?: string
}

/** Small mono pill for disciplines, tools, statuses. */
export function Tag({ children, tone = 'default', as: As = 'span', className }: Props) {
  return <As className={cx(s.tag, s[tone], className)}>{children}</As>
}
