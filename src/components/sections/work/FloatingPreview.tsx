import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Project } from '@/content/schema'
import { projects } from '@/content/projects'
import { gsap } from '@/engine/gsap'
import { pointer } from '@/engine/pointer'
import { ProjectCover } from '@/components/art/ProjectCover'
import { useUI } from '@/stores/ui'
import s from './Work.module.css'

export interface PreviewHandle {
  /** The visible cover element (for the shared transition). */
  el: () => HTMLElement | null
  rotation: () => number
}

/**
 * Cursor-following preview for the desktop list. Eased lag + velocity-based tilt via quickTo;
 * covers swap with a clip-path wipe. Decorative (aria-hidden) — rows carry the content.
 */
interface Props {
  active: Project | null
  visible: boolean
  /** Keyboard focus: park the preview beside this element instead of following the pointer. */
  anchor: HTMLElement | null
}

export const FloatingPreview = forwardRef<PreviewHandle, Props>(function FloatingPreview(
  { active, visible, anchor },
  ref,
) {
  const root = useRef<HTMLDivElement>(null)
  const rot = useRef(0)
  const handingOff = useUI((st) => st.sharedCover.phase !== 'idle')

  useImperativeHandle(ref, () => ({
    el: () => root.current,
    rotation: () => rot.current,
  }))

  useEffect(() => {
    const el = root.current
    if (!el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' })
    let lastX = pointer.x
    let placed = pointer.known
    if (pointer.known) gsap.set(el, { x: pointer.x, y: pointer.y })
    const move = (e: PointerEvent) => {
      if (!placed) {
        gsap.set(el, { x: e.clientX, y: e.clientY })
        placed = true
      }
      xTo(e.clientX)
      yTo(e.clientY)
      const vx = e.clientX - lastX
      lastX = e.clientX
      const r = gsap.utils.clamp(-7, 7, vx * 0.35)
      rot.current = r
      rTo(r)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    if (!anchor || !root.current) return
    const r = anchor.getBoundingClientRect()
    gsap.to(root.current, {
      x: r.left + r.width * 0.62,
      y: r.top + r.height / 2,
      rotation: 0,
      duration: 0.7,
      ease: 'power3.out',
    })
  }, [anchor])

  return (
    <div
      ref={root}
      className={s.preview}
      data-visible={visible && !handingOff}
      data-handoff={handingOff}
      aria-hidden="true"
    >
      <div className={s.previewInner}>
        {projects.map((p) => (
          <div key={p.slug} className={s.previewItem} data-active={active?.slug === p.slug}>
            <ProjectCover media={p.cover} />
          </div>
        ))}
      </div>
    </div>
  )
})
