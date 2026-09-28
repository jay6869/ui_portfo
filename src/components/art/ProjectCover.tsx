import { memo, useEffect, useRef } from 'react'
import type { ArtVariant, Media } from '@/content/schema'
import { cx } from '@/lib/text'
import s from './ProjectCover.module.css'

/** Deterministic PRNG so the same seed always draws the same artwork (server and client). */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const r1 = (n: number) => Math.round(n * 10) / 10

const W = 1600
const H = 1000

function Orbit({ rnd }: { rnd: () => number }) {
  const cx0 = W * (0.55 + rnd() * 0.2)
  const cy0 = H * (0.45 + rnd() * 0.15)
  const rings = Array.from({ length: 11 }, (_, i) => 60 + i * (58 + rnd() * 14))
  const pick = 3 + Math.floor(rnd() * 5)
  const angle = rnd() * Math.PI * 2
  const rr = rings[pick]!
  return (
    <>
      <circle cx={cx0} cy={cy0} r={rings[2]} fill="var(--art-2)" />
      <circle cx={cx0 - 40} cy={cy0 - 30} r={rings[0]} fill="var(--art-1)" opacity="0.8" />
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx0}
          cy={cy0}
          r={r}
          fill="none"
          stroke="var(--art-3)"
          strokeOpacity={0.08 + (i % 3 === 0 ? 0.14 : 0)}
          strokeWidth="1.5"
        />
      ))}
      <circle
        cx={r1(cx0 + Math.cos(angle) * rr)}
        cy={r1(cy0 + Math.sin(angle) * rr)}
        r="16"
        fill="var(--art-4)"
      />
      <circle
        cx={r1(cx0 + Math.cos(angle + 2.4) * rings[pick + 2]!)}
        cy={r1(cy0 + Math.sin(angle + 2.4) * rings[pick + 2]!)}
        r="5"
        fill="var(--art-3)"
        opacity="0.7"
      />
    </>
  )
}

function Strata({ rnd }: { rnd: () => number }) {
  const bands = 9
  const paths: string[] = []
  const phase = rnd() * 10
  for (let b = 0; b <= bands; b++) {
    const y0 = (H / bands) * b + (rnd() - 0.5) * 30
    let d = `M0 ${r1(y0)}`
    for (let x = 0; x <= W; x += 40) {
      const y =
        y0 + Math.sin(x / (180 + b * 12) + phase + b) * (18 + b * 3) + Math.sin(x / 57 + b) * 4
      d += ` L${x} ${r1(y)}`
    }
    d += ` L${W} ${H} L0 ${H} Z`
    paths.push(d)
  }
  const clayBand = 3 + Math.floor(rnd() * 4)
  return (
    <>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={i === clayBand ? 'var(--art-4)' : i % 2 ? 'var(--art-2)' : 'var(--art-1)'}
          opacity={i === clayBand ? 0.9 : 1}
          stroke="var(--art-3)"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />
      ))}
    </>
  )
}

function Grid({ rnd }: { rnd: () => number }) {
  const step = 62
  const lx = W * (0.35 + rnd() * 0.3)
  const ly = H * (0.35 + rnd() * 0.3)
  const R = 300 + rnd() * 80
  const dots: Array<[number, number, number, number]> = []
  for (let x = step / 2; x < W; x += step) {
    for (let y = step / 2; y < H; y += step) {
      const dx = x - lx
      const dy = y - ly
      const d = Math.hypot(dx, dy)
      const f = Math.max(0, 1 - d / R)
      const push = f * f * 70
      const nx = x + (dx / (d || 1)) * push
      const ny = y + (dy / (d || 1)) * push
      dots.push([r1(nx), r1(ny), r1(1.6 + f * 5), f])
    }
  }
  return (
    <>
      <circle cx={lx} cy={ly} r={R * 0.55} fill="var(--art-2)" />
      {dots.map(([x, y, r, f], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="var(--art-3)" opacity={0.18 + f * 0.5} />
      ))}
      <circle cx={lx} cy={ly} r="14" fill="var(--art-4)" />
    </>
  )
}

function Glyph({ rnd, glyph = 'a' }: { rnd: () => number; glyph?: string }) {
  const x = W * (0.45 + rnd() * 0.15)
  return (
    <>
      <rect
        x={W * 0.08}
        y={H * 0.12}
        width={W * 0.84}
        height={H * 0.76}
        fill="none"
        stroke="var(--art-3)"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <line
        x1={W * 0.08}
        y1={H * 0.62}
        x2={W * 0.92}
        y2={H * 0.62}
        stroke="var(--art-3)"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <text
        x={x}
        y={H * 0.93}
        textAnchor="middle"
        fontFamily="Instrument Serif, serif"
        fontStyle="italic"
        fontSize={H * 1.25}
        fill="var(--art-3)"
        fillOpacity="0.92"
      >
        {glyph}
      </text>
      <circle cx={W * 0.86} cy={H * 0.2} r="12" fill="var(--art-4)" />
    </>
  )
}

function Waves({ rnd }: { rnd: () => number }) {
  const lines = 34
  const out: Array<{ d: string; accent: boolean }> = []
  const f1 = 0.004 + rnd() * 0.002
  const accentLine = 10 + Math.floor(rnd() * 14)
  for (let i = 0; i < lines; i++) {
    const y0 = 120 + (i / lines) * (H - 200)
    let d = ''
    for (let x = 0; x <= W; x += 20) {
      const env = Math.exp(-Math.pow((x - W * 0.55) / 420, 2))
      const y = y0 - env * (60 + i * 3) * Math.sin(x * f1 + i * 0.22) - env * 40
      d += `${x === 0 ? 'M' : 'L'}${x} ${r1(y)} `
    }
    out.push({ d, accent: i === accentLine })
  }
  return (
    <>
      {out.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill="none"
          stroke={l.accent ? 'var(--art-4)' : 'var(--art-3)'}
          strokeOpacity={l.accent ? 1 : 0.22}
          strokeWidth={l.accent ? 3 : 1.5}
        />
      ))}
    </>
  )
}

function Blocks({ rnd }: { rnd: () => number }) {
  const rects = Array.from({ length: 7 }, () => ({
    x: r1(rnd() * W * 0.75),
    y: r1(rnd() * H * 0.7),
    w: r1(180 + rnd() * 520),
    h: r1(120 + rnd() * 380),
  }))
  const clay = Math.floor(rnd() * rects.length)
  return (
    <>
      {rects.map((r, i) => (
        <rect
          key={i}
          {...{ x: r.x, y: r.y, width: r.w, height: r.h }}
          fill={i === clay ? 'var(--art-4)' : i % 2 ? 'var(--art-2)' : 'none'}
          fillOpacity={i === clay ? 0.95 : 0.85}
          stroke="var(--art-3)"
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />
      ))}
      <line
        x1="0"
        y1={H * 0.8}
        x2={W}
        y2={H * 0.8}
        stroke="var(--art-3)"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
    </>
  )
}

const ART: Record<ArtVariant, (p: { rnd: () => number; glyph?: string }) => React.ReactElement> = {
  orbit: Orbit,
  strata: Strata,
  grid: Grid,
  glyph: Glyph,
  waves: Waves,
  blocks: Blocks,
}

const Art = memo(function Art({
  variant,
  seed,
  glyph,
  label,
}: {
  variant: ArtVariant
  seed: number
  glyph?: string
  label: string
}) {
  const Comp = ART[variant]
  const id = `lamp-${variant}-${seed}`
  return (
    <svg
      className={s.svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={id} cx="20%" cy="10%" r="90%">
          <stop offset="0%" stopColor="var(--art-4)" stopOpacity="0.14" />
          <stop offset="60%" stopColor="var(--art-4)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--art-1)" />
      <Comp rnd={mulberry32(seed)} glyph={glyph} />
      <rect width={W} height={H} fill={`url(#${id})`} />
    </svg>
  )
})

function LazyVideo({ media }: { media: Extract<Media, { type: 'video' }> }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches)
        void v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={ref}
      className={s.media}
      src={media.src}
      poster={media.poster}
      width={media.width}
      height={media.height}
      muted
      loop
      playsInline
      preload="none"
      aria-label={media.alt}
    />
  )
}

interface Props {
  media: Media
  className?: string
  /** Eager-load real images (e.g. the case-study cover, above the fold). */
  priority?: boolean
  sizes?: string
}

/** Project media: generative SVG art (placeholder-friendly), a responsive image, or a lazy video. */
export function ProjectCover({ media, className, priority = false, sizes = '100vw' }: Props) {
  return (
    <div
      className={cx(s.cover, className)}
      style={media.type === 'image' && media.color ? { background: media.color } : undefined}
    >
      {media.type === 'art' ? (
        <Art variant={media.variant} seed={media.seed} glyph={media.glyph} label={media.alt} />
      ) : media.type === 'image' ? (
        <picture>
          {media.avif ? <source type="image/avif" srcSet={media.avif} sizes={sizes} /> : null}
          {media.webp ? <source type="image/webp" srcSet={media.webp} sizes={sizes} /> : null}
          <img
            className={s.media}
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </picture>
      ) : (
        <LazyVideo media={media} />
      )}
    </div>
  )
}
