/**
 * Motion vocabulary. One primary curve for entrances, one snappy curve for micro-interactions
 * and one symmetric curve for wipes. Shared by GSAP (registered eases), Framer Motion (arrays)
 * and CSS (custom properties in tokens.css). See DESIGN.md → Motion principles.
 */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  snap: [0.32, 0.72, 0, 1],
  inout: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>

export const DUR = {
  micro: 0.4,
  enter: 0.9,
  long: 1.1,
  wipe: 0.5,
} as const

export const STAGGER = {
  char: 0.03,
  word: 0.06,
  row: 0.08,
} as const

/** Cubic-bezier solver (same maths as the CSS timing function) so GSAP can use our curves. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  const solveX = (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x
      if (Math.abs(err) < 1e-6) return t
      const d = slopeX(t)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    // Bisection fallback
    let lo = 0
    let hi = 1
    t = x
    while (lo < hi) {
      const v = sampleX(t)
      if (Math.abs(v - x) < 1e-6) return t
      if (x > v) lo = t
      else hi = t
      t = (hi - lo) / 2 + lo
      if (hi - lo < 1e-6) break
    }
    return t
  }
  return (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : sampleY(solveX(p)))
}
