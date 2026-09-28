import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Becomes true (once) when the element comes within `rootMargin` of the viewport.
 * Used to lazy-load heavy chunks (Three, p5, Tone, D3, Leaflet, Swiper, the form).
 */
export function useNearViewport<T extends Element>(
  rootMargin = '600px 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    if (!('IntersectionObserver' in window)) {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, near])
  return [ref, near]
}

/** Live visibility (for pausing render loops when off-screen). */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  rootMargin = '0px',
): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}
