import type { MouseEvent } from 'react'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scroller } from './scroll'

/**
 * In-page section navigation. On the home page: smooth scroll (through Locomotive). Elsewhere:
 * route to /#id, which triggers the wipe and then jumps to the section. Links keep a real
 * href (/#id) so they work without JS and open in new tabs.
 */
export function useSectionNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return useCallback(
    (id: string, e?: MouseEvent) => {
      if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return
      e?.preventDefault()
      if (pathname === '/') {
        const el = document.getElementById(id)
        if (el) {
          scroller.scrollTo(el, { offset: id === 'top' ? 0 : -8 })
          history.replaceState(null, '', id === 'top' ? '/' : `/#${id}`)
          // Move focus for keyboard/screen-reader users without a second scroll jump
          window.setTimeout(() => el.focus({ preventScroll: true }), 50)
        }
      } else {
        navigate(id === 'top' ? '/' : `/#${id}`)
      }
    },
    [pathname, navigate],
  )
}
