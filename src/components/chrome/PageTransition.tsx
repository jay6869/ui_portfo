import { m } from 'framer-motion'
import { EASE, DUR } from '@/engine/ease'
import { useReducedMotion } from '@/engine/media'
import type { TransitionPhase } from '@/engine/transition'
import s from './PageTransition.module.css'

interface Props {
  phase: TransitionPhase
  title: { kicker: string; title: string }
  onCovered: () => void
  onRevealed: () => void
}

/** Charcoal panel wipe with the destination title, ~500ms each way. */
export function PageTransition({ phase, title, onCovered, onRevealed }: Props) {
  const reduce = useReducedMotion()
  const variants = reduce
    ? {
        idle: { opacity: 0, y: '0%', transition: { duration: 0 } },
        cover: { opacity: 1, y: '0%', transition: { duration: 0.2 } },
        reveal: { opacity: 0, y: '0%', transition: { duration: 0.2 } },
      }
    : {
        idle: { y: '100%', opacity: 1, transition: { duration: 0 } },
        cover: { y: '0%', opacity: 1, transition: { duration: DUR.wipe, ease: EASE.inout } },
        reveal: {
          y: '-100%',
          opacity: 1,
          transition: { duration: DUR.wipe + 0.1, ease: EASE.inout, delay: 0.08 },
        },
      }

  return (
    <m.div
      className={s.panel}
      data-phase={phase}
      aria-hidden="true"
      initial={false}
      animate={phase}
      variants={variants}
      onAnimationComplete={(def) => {
        if (def === 'cover') onCovered()
        else if (def === 'reveal') onRevealed()
      }}
    >
      <div className={s.inner}>
        <span className="mono">{title.kicker}</span>
        <span className={s.title}>{title.title}</span>
      </div>
    </m.div>
  )
}
