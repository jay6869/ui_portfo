import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { getProject } from '@/content/projects'
import { useUI, type Rect } from '@/stores/ui'
import { EASE } from '@/engine/ease'
import { ProjectCover } from '@/components/art/ProjectCover'
import s from './SharedCover.module.css'

function visibleRect(el: Element): Rect | null {
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.bottom < 0 || r.top > window.innerHeight) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/** Rows are wide strips: land on a cover-shaped box at the row's right side instead. */
function coverBoxForRow(r: Rect): Rect {
  const h = Math.min(r.height * 1.9, 220)
  const w = (h * 16) / 9
  return {
    top: r.top + r.height / 2 - h / 2,
    left: r.left + r.width * 0.62 - w / 2,
    width: w,
    height: h,
  }
}

/**
 * Shared-element transition between the work list/carousel and a case study. A fixed layer
 * holds one cover. Once the target is known, the frame mounts at the target box with an inverted
 * transform (FLIP) and Framer Motion animates it to identity — transform-only, and immune to the
 * scroll reset between routes (Framer's layoutId measures in page coordinates, which broke
 * here; see DECISIONS.md). Source and target share an aspect ratio, so the scale is uniform.
 */
export function SharedCover() {
  const { phase, slug, from } = useUI((st) => st.sharedCover)
  const end = useUI((st) => st.endSharedCover)
  const [to, setTo] = useState<Rect | null>(null)
  const [landed, setLanded] = useState(false)
  const [lost, setLost] = useState(false)
  const project = getProject(slug ?? undefined)

  useEffect(() => {
    setTo(null)
    setLanded(false)
    setLost(false)
    if (phase === 'idle' || !slug) return
    const path = phase === 'out' ? `/work/${slug}` : '/'
    const selector =
      phase === 'out' ? `[data-cover-target="${slug}"]` : `[data-cover-source="${slug}"]`
    let frames = 0
    let raf = 0
    let settle = 0
    const look = () => {
      frames++
      if (window.location.pathname === path) {
        const candidates = Array.from(document.querySelectorAll(selector))
        const hit = candidates.map(visibleRect).find(Boolean)
        // Wait two frames after the route renders so scroll restoration has applied
        if (hit && ++settle > 2) {
          const isRow = candidates.some(
            (c) => c.tagName === 'A' && c.getBoundingClientRect().width > window.innerWidth * 0.6,
          )
          setTo(phase === 'in' && isRow ? coverBoxForRow(hit) : hit)
          return
        }
      }
      if (frames > 120) {
        setLost(true) // target never showed up: just fade the layer out
        return
      }
      raf = requestAnimationFrame(look)
    }
    raf = requestAnimationFrame(look)
    return () => cancelAnimationFrame(raf)
  }, [phase, slug])

  useEffect(() => {
    if (!lost && !landed) return
    const t = window.setTimeout(end, 480)
    return () => window.clearTimeout(t)
  }, [lost, landed, end])

  // Safety: never leave the layer up
  useEffect(() => {
    if (phase === 'idle') return
    const t = window.setTimeout(end, 4000)
    return () => window.clearTimeout(t)
  }, [phase, end])

  if (phase === 'idle' || !project || !from) return null
  const fading = landed || lost
  const box = to ?? from
  const flip = to
    ? {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scaleX: from.width / to.width,
        scaleY: from.height / to.height,
        rotate: from.rotate ?? 0,
      }
    : null

  return (
    <div className={s.layer} aria-hidden="true">
      <m.div
        className={s.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: fading ? 0.45 : 0.32, ease: EASE.out }}
      />
      <m.div
        key={to ? 'to' : 'from'}
        className={s.frame}
        style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        initial={flip ?? { rotate: from.rotate ?? 0, opacity: 1 }}
        animate={
          flip
            ? {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotate: 0,
                opacity: lost || (phase === 'in' && landed) ? 0 : 1,
              }
            : { opacity: lost ? 0 : 1 }
        }
        transition={{
          default: { duration: phase === 'out' ? 1 : 0.85, ease: EASE.inout },
          rotate: { duration: 0.9, ease: EASE.out },
          opacity: { duration: 0.35 },
        }}
        onAnimationComplete={() => {
          if (to) setLanded(true)
        }}
      >
        <ProjectCover media={project.cover} />
      </m.div>
    </div>
  )
}
