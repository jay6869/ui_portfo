import { useSyncExternalStore } from 'react'

export const QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
  desktop: '(min-width: 1024px)',
  tablet: '(min-width: 768px)',
} as const

const lists = new Map<string, MediaQueryList>()
/** Cached MediaQueryList (creating one per call is surprisingly expensive). */
export function mql(query: string): MediaQueryList {
  let list = lists.get(query)
  if (!list) {
    list = window.matchMedia(query)
    lists.set(query, list)
  }
  return list
}

export function matches(query: string): boolean {
  return typeof window !== 'undefined' && mql(query).matches
}

/**
 * Media query hook that is safe for prerendering: the server (and the first client render,
 * during hydration) use `serverValue`, then React re-renders with the real value.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = mql(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => mql(query).matches,
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

/**
 * True only for hardware-accelerated WebGL. Software rasterisers (SwiftShader, llvmpipe — e.g.
 * GPU-less VMs, blocklisted drivers, headless browsers) run shaders on the CPU and would turn a
 * decorative blob into seconds of main-thread work, so they get the static fallback.
 */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(renderer)
  } catch {
    return false
  }
}
