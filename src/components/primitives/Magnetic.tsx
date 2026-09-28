import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { cx } from '@/lib/text'
import s from './Magnetic.module.css'

interface Props {
  children: ReactNode
  /** How far the element follows the pointer (0–1). */
  strength?: number
  /** Extra pull applied to `[data-magnetic-inner]` for a subtle parallax. */
  innerStrength?: number
  /** Activation radius around the element, in px. */
  padding?: number
  className?: string
}

/**
 * Eased pull toward the pointer. Fine pointers only, off with reduced motion. Uses one
 * pointermove listener and gsap.quickTo (the shared ticker).
 */
export function Magnetic({
  children,
  strength = 0.35,
  innerStrength = 0.15,
  padding = 24,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !matches(QUERIES.finePointer) || matches(QUERIES.reducedMotion)) return
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]')
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' }) : null
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' }) : null
    let active = false

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      // Use the un-transformed rect: subtract our own current offset
      const ox = Number(gsap.getProperty(el, 'x')) || 0
      const oy = Number(gsap.getProperty(el, 'y')) || 0
      const cxp = r.left - ox + r.width / 2
      const cyp = r.top - oy + r.height / 2
      const dx = e.clientX - cxp
      const dy = e.clientY - cyp
      const inside = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding
      if (inside) {
        active = true
        x(dx * strength)
        y(dy * strength)
        ix?.(dx * innerStrength)
        iy?.(dy * innerStrength)
      } else if (active) {
        active = false
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.killTweensOf([el, inner].filter(Boolean))
      gsap.set([el, inner].filter(Boolean), { x: 0, y: 0 })
    }
  }, [strength, innerStrength, padding])

  return (
    <span ref={ref} className={cx(s.magnetic, className)}>
      {children}
    </span>
  )
}
