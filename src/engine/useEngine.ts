import { useEffect } from 'react'
import { acquireScroll, scroller } from './scroll'
import { ScrollTrigger } from './gsap'
import { selectAnyDialogOpen, useUI, type Theme } from '@/stores/ui'
import { KEYS, store } from '@/lib/storage'

/** App-level side effects: scroll engine, preference sync, dialog scroll-lock, hydration flag. */
export function useEngine() {
  const anyDialog = useUI(selectAnyDialogOpen)

  useEffect(() => {
    window.__jgHydrated = true
    const html = document.documentElement
    const theme = (html.dataset.theme as Theme | undefined) ?? 'charcoal'
    useUI.setState((s) => {
      s.theme = theme === 'paper' ? 'paper' : 'charcoal'
      s.sound = store.get(KEYS.sound) === '1'
    })

    const releaseScroll = acquireScroll()

    // Fonts change line lengths → re-measure triggers once they're in.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return releaseScroll
  }, [])

  useEffect(() => {
    if (anyDialog) scroller.stop()
    else scroller.start()
  }, [anyDialog])
}
