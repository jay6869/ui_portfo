import { stack } from '@/content/stack'
import { Marquee } from '@/components/primitives/Marquee'
import s from './StackMarquee.module.css'

/** Full-bleed typographic band of the tools I use. Speed follows scroll velocity. */
export function StackMarquee() {
  return (
    <section className={s.band} aria-label="Tools I use">
      <Marquee
        label="Tools I use"
        duration={42}
        items={stack.marquee.map((tool, i) => (
          <span key={tool} className={i % 2 ? s.italic : s.upright}>
            {tool}
          </span>
        ))}
      />
    </section>
  )
}
