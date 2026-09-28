import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { cx } from '@/lib/text'
import s from './Marquee.module.css'

interface Props {
  items: ReactNode[]
  /** Seconds for one full loop at rest. */
  duration?: number
  /** How strongly scroll velocity speeds the band up. */
  velocityFactor?: number
  /** Accessible label for the list (the surrounding section provides the landmark). */
  label: string
  className?: string
  separator?: ReactNode
}

/**
 * Infinite band. Speed and direction follow scroll velocity; the band skews slightly with
 * speed and eases to a stop on hover. Reduced motion: static list that wraps.
 * Only the first copy is exposed to assistive tech.
 */
export function Marquee({
  items,
  duration = 38,
  velocityFactor = 0.0022,
  label,
  className,
  separator,
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (matches(QUERIES.reducedMotion) || !track.current || !root.current) return
      // Starts paused: it only runs while the band is on screen (onToggle below)
      const loop = gsap.to(track.current, {
        xPercent: -50,
        duration,
        ease: 'none',
        repeat: -1,
        paused: true,
      })
      const skew = gsap.quickTo(track.current, 'skewX', { duration: 0.5, ease: 'power3.out' })
      let direction = 1
      let hover = false
      const speed = { v: 1 }

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
        onUpdate: (self) => {
          const v = self.getVelocity()
          if (Math.abs(v) > 20) direction = v > 0 ? 1 : -1
          skew(gsap.utils.clamp(-6, 6, -v * 0.0018))
          if (!hover) {
            const boost = 1 + Math.min(Math.abs(v) * velocityFactor, 5)
            gsap.to(speed, {
              v: direction * boost,
              duration: 0.25,
              overwrite: true,
              onUpdate: () => loop.timeScale(speed.v),
              onComplete: () =>
                gsap.to(speed, {
                  v: direction,
                  duration: 1.1,
                  ease: 'power2.out',
                  onUpdate: () => loop.timeScale(speed.v),
                }),
            })
          }
        },
      })
      if (st.isActive) loop.resume()
      const enter = () => {
        hover = true
        gsap.to(speed, {
          v: 0,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: true,
          onUpdate: () => loop.timeScale(speed.v),
        })
      }
      const leave = () => {
        hover = false
        gsap.to(speed, {
          v: direction,
          duration: 0.8,
          ease: 'power2.in',
          overwrite: true,
          onUpdate: () => loop.timeScale(speed.v),
        })
      }
      const el = root.current
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      return () => {
        st.kill()
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { scope: root },
  )

  const copy = (hidden: boolean) => (
    <ul className={s.copy} aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label} role="list">
      {items.map((item, i) => (
        <li key={i} className={s.item}>
          {item}
          <span className={s.sep} aria-hidden="true">
            {separator ?? '●'}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div ref={root} className={cx(s.marquee, className)}>
      <div ref={track} className={s.track}>
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  )
}
