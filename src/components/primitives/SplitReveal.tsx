import { useRef, type CSSProperties, type ElementType } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { parseEmphasis, plain } from '@/lib/text'
import { STAGGER } from '@/engine/ease'
import { cx } from '@/lib/text'

interface Props {
  text: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  id?: string
  /** 'words' masks each word; 'chars' masks each letter (use for short display text). */
  split?: 'words' | 'chars'
  delay?: number
  /** ScrollTrigger start. */
  start?: string
}

/**
 * Words (or letters) mask up into view on scroll. The server renders the final, visible state
 * (so no-JS and failed-JS visitors read it normally); the client hides pieces just before they
 * enter the viewport. Elements already on screen at first load are left alone.
 */
export function SplitReveal({
  text,
  as: As = 'span',
  className,
  style,
  id,
  split = 'words',
  delay = 0,
  start = 'top 88%',
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const pieces = el.querySelectorAll('[data-piece]')
      const reduce = matches(QUERIES.reducedMotion)
      const firstLoad = !document.documentElement.dataset.navigated
      if (firstLoad && ScrollTrigger.isInViewport(el, 0.05)) return

      if (reduce) {
        gsap.set(el, { opacity: 0 })
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, duration: 0.3, ease: 'none' }),
        })
        return
      }
      gsap.set(pieces, { yPercent: 115 })
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () =>
          gsap.to(pieces, {
            yPercent: 0,
            duration: split === 'chars' ? 0.9 : 1.05,
            stagger: split === 'chars' ? STAGGER.char : STAGGER.word,
            delay,
            ease: 'workshop',
          }),
      })
    },
    { scope: ref, dependencies: [text] },
  )

  const segments = parseEmphasis(text)
  let n = 0
  return (
    <As ref={ref} id={id} className={cx('split', className)} style={style}>
      {split === 'chars' ? <span className="sr-only">{plain(text)}</span> : null}
      {segments.map((seg, si) => {
        const words = seg.text.split(/(\s+)/)
        const content = words.map((w, wi) => {
          if (!w) return null
          if (/^\s+$/.test(w)) return ' '
          if (split === 'chars') {
            return (
              <span key={wi} className="split-mask" aria-hidden="true">
                {Array.from(w).map((c, ci) => (
                  <span key={ci} className="split-char" data-piece data-i={n++}>
                    {c}
                  </span>
                ))}
              </span>
            )
          }
          return (
            <span key={wi} className="split-mask">
              <span className="split-word" data-piece data-i={n++}>
                {w}
              </span>
            </span>
          )
        })
        return seg.em ? (
          <em key={si} className="accent">
            {content}
          </em>
        ) : (
          <span key={si}>{content}</span>
        )
      })}
    </As>
  )
}
