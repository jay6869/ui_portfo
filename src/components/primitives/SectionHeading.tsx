import { SplitReveal } from './SplitReveal'
import { cx } from '@/lib/text'
import s from './SectionHeading.module.css'

interface Props {
  index: string
  label: string
  title: string
  kicker?: string
  id?: string
  className?: string
  /** Heading level for the title. */
  level?: 'h2' | 'h1'
}

/**
 * Section opener: mono index/label rail with a hairline, an oversized outlined numeral and a
 * serif headline whose words mask up on scroll.
 */
export function SectionHeading({
  index,
  label,
  title,
  kicker,
  id,
  className,
  level = 'h2',
}: Props) {
  return (
    <header className={cx(s.heading, 'grid', className)}>
      <div className={s.rail}>
        <span className="mono">({index})</span>
        <span className={s.line} aria-hidden="true" />
        <span className="mono">{label}</span>
      </div>
      <span className={s.numeral} aria-hidden="true">
        {index}
      </span>
      <SplitReveal as={level} id={id} text={title} className={s.title} />
      {kicker ? <p className={cx(s.kicker, 'dim')}>{kicker}</p> : null}
    </header>
  )
}
