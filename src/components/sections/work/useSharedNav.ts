import type { MouseEvent } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI, type Rect } from '@/stores/ui'
import { QUERIES, matches } from '@/engine/media'

export const SHARED_LEAD_MS = 360

/** Un-rotated box of an element (a tilted element's bounding box is larger than it is). */
function rectOf(el: Element, rotate = 0): Rect {
  const r = el.getBoundingClientRect()
  const w = el instanceof HTMLElement ? el.offsetWidth : r.width
  const h = el instanceof HTMLElement ? el.offsetHeight : r.height
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  return { top: cy - h / 2, left: cx - w / 2, width: w, height: h, rotate }
}

/**
 * Click handler for "open this project with the shared cover". Falls back to a normal link
 * (and the panel wipe) with modifier keys, reduced motion, or when no source cover is visible.
 */
export function useOpenProject() {
  const navigate = useNavigate()
  return useCallback(
    (e: MouseEvent, slug: string, source: Element | null, rotate = 0) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      if (matches(QUERIES.reducedMotion) || !source) return
      const rect = rectOf(source, rotate)
      if (rect.width < 4 || rect.top + rect.height < 0) return
      e.preventDefault()
      useUI.getState().startSharedCover('out', slug, rect)
      window.setTimeout(
        () => navigate(`/work/${slug}`, { state: { from: 'home' } }),
        SHARED_LEAD_MS,
      )
    },
    [navigate],
  )
}

export { rectOf }
