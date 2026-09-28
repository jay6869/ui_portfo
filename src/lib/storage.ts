/** Storage access that never throws (private mode, blocked cookies, SSR). */
function safe(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window[kind]
  } catch {
    return null
  }
}

export const KEYS = {
  theme: 'jg:theme',
  sound: 'jg:sound',
  seen: 'jg:seen',
  placeholderBanner: 'jg:placeholder-banner',
} as const

export const store = {
  get(key: string, session = false): string | null {
    try {
      return safe(session ? 'sessionStorage' : 'localStorage')?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  set(key: string, value: string, session = false) {
    try {
      safe(session ? 'sessionStorage' : 'localStorage')?.setItem(key, value)
    } catch {
      /* storage full or blocked: preference just won't persist */
    }
  },
}
