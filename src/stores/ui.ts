import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { KEYS, store } from '@/lib/storage'

export type Theme = 'charcoal' | 'paper'
export type CursorVariant = 'default' | 'link' | 'view' | 'drag' | 'hidden'
export type PreloaderStatus = 'pending' | 'running' | 'revealing' | 'done'

export interface Toast {
  id: number
  message: string
  tone?: 'default' | 'success' | 'error'
}

export interface Rect {
  top: number
  left: number
  width: number
  height: number
  rotate?: number
}

export type SharedCoverPhase = 'idle' | 'out' | 'in'

interface UIState {
  theme: Theme
  sound: boolean
  cursor: { variant: CursorVariant; label: string }
  paletteOpen: boolean
  menuOpen: boolean
  shortcutsOpen: boolean
  preloader: PreloaderStatus
  section: { index: string; label: string }
  toasts: Toast[]
  /** Scroll position of the home page, restored when coming back from a case study. */
  homeScroll: number
  /** Shared-element cover transition between the work list and a case study. */
  sharedCover: { phase: SharedCoverPhase; slug: string | null; from: Rect | null }

  setTheme: (t: Theme) => void
  setSound: (on: boolean) => void
  setCursor: (variant: CursorVariant, label?: string) => void
  setPaletteOpen: (open: boolean) => void
  setMenuOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  setPreloader: (s: PreloaderStatus) => void
  setSection: (index: string, label: string) => void
  toast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
  setHomeScroll: (y: number) => void
  startSharedCover: (phase: Exclude<SharedCoverPhase, 'idle'>, slug: string, from: Rect) => void
  endSharedCover: () => void
}

let toastId = 0

/**
 * Global UI store. Initial values are server-safe (the prerendered HTML matches the first client
 * render); real preferences are synced from the DOM/storage in `useSyncPreferences`.
 */
export const useUI = create<UIState>()(
  immer((set) => ({
    theme: 'charcoal',
    sound: false,
    cursor: { variant: 'default', label: '' },
    paletteOpen: false,
    menuOpen: false,
    shortcutsOpen: false,
    preloader: 'pending',
    section: { index: '00', label: 'Intro' },
    toasts: [],
    homeScroll: 0,
    sharedCover: { phase: 'idle', slug: null, from: null },

    setTheme: (t) =>
      set((s) => {
        s.theme = t
        store.set(KEYS.theme, t)
      }),
    setSound: (on) =>
      set((s) => {
        s.sound = on
        store.set(KEYS.sound, on ? '1' : '0')
      }),
    setCursor: (variant, label = '') =>
      set((s) => {
        s.cursor.variant = variant
        s.cursor.label = label
      }),
    setPaletteOpen: (open) =>
      set((s) => {
        s.paletteOpen = open
        if (open) s.menuOpen = false
      }),
    setMenuOpen: (open) =>
      set((s) => {
        s.menuOpen = open
      }),
    setShortcutsOpen: (open) =>
      set((s) => {
        s.shortcutsOpen = open
      }),
    setPreloader: (status) =>
      set((s) => {
        s.preloader = status
      }),
    setSection: (index, label) =>
      set((s) => {
        s.section.index = index
        s.section.label = label
      }),
    toast: (message, tone = 'default') =>
      set((s) => {
        s.toasts.push({ id: ++toastId, message, tone })
        if (s.toasts.length > 3) s.toasts.shift()
      }),
    dismissToast: (id) =>
      set((s) => {
        s.toasts = s.toasts.filter((t) => t.id !== id)
      }),
    setHomeScroll: (y) =>
      set((s) => {
        s.homeScroll = y
      }),
    startSharedCover: (phase, slug, from) =>
      set((s) => {
        s.sharedCover = { phase, slug, from }
      }),
    endSharedCover: () =>
      set((s) => {
        s.sharedCover = { phase: 'idle', slug: null, from: null }
      }),
  })),
)

/** Any modal UI open → smooth scroll should pause. */
export const selectAnyDialogOpen = (s: UIState) => s.paletteOpen || s.menuOpen || s.shortcutsOpen
