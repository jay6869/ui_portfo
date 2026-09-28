import { useEffect, useRef } from 'react'
import { gsap } from '@/engine/gsap'
import { useFinePointer } from '@/engine/media'
import { useUI, type CursorVariant } from '@/stores/ui'
import s from './Cursor.module.css'

/**
 * Custom cursor for fine pointers: a clay dot + a trailing ring. Positions run through
 * gsap.quickTo (the shared ticker); the visual state lives in the Zustand store and is set by
 * one delegated listener reading `data-cursor` / `data-cursor-label` from the hovered element.
 */
export function Cursor() {
  const fine = useFinePointer()
  if (!fine) return null
  return <CursorImpl />
}

function resolve(target: Element | null): { variant: CursorVariant; label: string } {
  if (!target) return { variant: 'default', label: '' }
  const tagged = target.closest<HTMLElement>('[data-cursor]')
  if (tagged) {
    return {
      variant: (tagged.dataset.cursor as CursorVariant) || 'link',
      label: tagged.dataset.cursorLabel ?? '',
    }
  }
  if (target.closest('input, textarea, select, [contenteditable="true"]'))
    return { variant: 'hidden', label: '' }
  const link = target.closest<HTMLElement>('a[href], button, [role="button"], label, summary')
  if (link) {
    const external = link instanceof HTMLAnchorElement && link.target === '_blank'
    return { variant: 'link', label: external ? 'Open' : '' }
  }
  return { variant: 'default', label: '' }
}

function CursorImpl() {
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const variant = useUI((st) => st.cursor.variant)
  const label = useUI((st) => st.cursor.label)

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('has-cursor')
    const setCursor = useUI.getState().setCursor

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' })

    let visible = false
    let last = ''
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!visible) {
        visible = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        root.current?.setAttribute('data-visible', 'true')
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const next = resolve(e.target as Element)
      const key = `${next.variant}|${next.label}`
      if (key !== last) {
        last = key
        setCursor(next.variant, next.label)
      }
    }
    const leave = () => {
      visible = false
      root.current?.setAttribute('data-visible', 'false')
    }
    const down = () => root.current?.setAttribute('data-down', 'true')
    const up = () => root.current?.setAttribute('data-down', 'false')

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('blur', leave)
    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('blur', leave)
    }
  }, [])

  return (
    <div
      ref={root}
      className={s.root}
      data-variant={variant}
      data-has-label={label ? 'true' : 'false'}
      data-visible="false"
      aria-hidden="true"
    >
      <div ref={ring} className={s.ringPos}>
        <div className={s.ring} />
        <span className={s.label}>{label}</span>
      </div>
      <div ref={dot} className={s.dotPos}>
        <div className={s.dot} />
      </div>
    </div>
  )
}
