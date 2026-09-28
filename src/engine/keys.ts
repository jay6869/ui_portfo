import { useEffect } from 'react'
import { useUI, selectAnyDialogOpen } from '@/stores/ui'
import { toggleTheme } from '@/lib/theme'
import { setSoundEnabled } from '@/lib/sound'

const typingIn = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

/** Section ids in index order, for the 1–6 shortcuts. */
export const SECTION_IDS = ['work', 'services', 'stack', 'lab', 'about', 'contact'] as const

/**
 * Global keyboard layer: ⌘/Ctrl+K palette, "?" or typing "dev" for the shortcuts sheet,
 * T theme, S sound, 1–6 jump to sections. Ignored while typing or when a dialog is open.
 */
export function useGlobalKeys(goTo: (id: string) => void) {
  useEffect(() => {
    let buffer = ''
    let timer = 0
    const onKey = (e: KeyboardEvent) => {
      const ui = useUI.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ui.setPaletteOpen(!ui.paletteOpen)
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target) || selectAnyDialogOpen(ui))
        return

      buffer = (buffer + e.key.toLowerCase()).slice(-3)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => (buffer = ''), 900)
      if (e.key === '?' || buffer === 'dev') {
        buffer = ''
        ui.setShortcutsOpen(true)
        return
      }
      if (buffer.endsWith('de')) return // mid-"dev": don't fire single-key shortcuts
      const k = e.key.toLowerCase()
      if (k === 't') toggleTheme()
      else if (k === 's')
        void setSoundEnabled(!ui.sound).then(() => ui.toast(`Sound ${!ui.sound ? 'on' : 'off'}`))
      else if (/^[1-6]$/.test(k)) goTo(SECTION_IDS[Number(k) - 1]!)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [goTo])
}

export const shortcutList = [
  { keys: ['⌘/Ctrl', 'K'], label: 'Command palette' },
  { keys: ['T'], label: 'Toggle paper / charcoal' },
  { keys: ['S'], label: 'Toggle interface sound' },
  { keys: ['1', '–', '6'], label: 'Jump to a section' },
  { keys: ['?'], label: 'This sheet' },
  { keys: ['Esc'], label: 'Close anything' },
] as const
