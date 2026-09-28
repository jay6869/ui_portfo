import { useSyncExternalStore } from 'react'

export const QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
  desktop: '(min-width: 1024px)',
  tablet: '(min-width: 768px)',
} as const

export function matches(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

/**
 * Media query hook that is safe for prerendering: the server (and the first client render,
 * during hydration) use `serverValue`, then React re-renders with the real value.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

export const useReducedMotion = () => useMediaQuery(QUERIES.reducedMotion, false)
export const useFinePointer = () => useMediaQuery(QUERIES.finePointer, false)
export const useIsDesktop = () => useMediaQuery(QUERIES.desktop, true)

/** Rough low-power heuristic used to skip WebGL. */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return true
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  if (nav.connection?.saveData) return true
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return true
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return true
  return false
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
