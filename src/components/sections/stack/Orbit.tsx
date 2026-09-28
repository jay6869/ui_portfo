import { useMemo } from 'react'
import {
  forceCollide,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from 'd3'
import { stack } from '@/content/stack'
import type { ToolInfo } from './data'
import s from './StackViz.module.css'

const SIZE = 820
const C = SIZE / 2
const ring = (i: number) => 96 + i * 66

interface Node extends SimulationNodeDatum {
  tool: ToolInfo | null // null = a fixed obstacle (ring label)
  r: number
  tx: number
  ty: number
  layerIndex: number
}

/** Ring labels sit on a diagonal (upper-left) so they read as a scale, like a chart axis. */
const LABEL_ANGLE = (-128 * Math.PI) / 180
const labelPos = (i: number) => ({
  x: C + Math.cos(LABEL_ANGLE) * ring(i),
  y: C + Math.sin(LABEL_ANGLE) * ring(i),
})

/**
 * Typographic orbit. Rings = layers (inner → outer), dots = tools, dot size = how many listed
 * projects used it. D3's force simulation settles labels on their ring without collisions
 * (run synchronously — the layout is static, nothing animates in a loop).
 */
export default function Orbit({
  tools,
  active,
  onActive,
}: {
  tools: ToolInfo[]
  active: string | null
  onActive: (t: string | null) => void
}) {
  // Phones render the SVG ~2.3× smaller: bigger labels there, and collision radii to match
  const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.75 : 1
  const nodes = useMemo(() => {
    const perLayer = stack.layers.map((l) => l.tools.length)
    const counters = perLayer.map(() => 0)
    const ns: Node[] = tools.map((tool) => {
      const i = tool.layerIndex
      const k = counters[i]!++
      const a = (k / perLayer[i]!) * Math.PI * 2 + i * 0.9 - Math.PI / 2
      const tx = C + Math.cos(a) * ring(i)
      const ty = C + Math.sin(a) * ring(i)
      return { tool, r: (tool.name.length * 4.2 + 14) * scale, tx, ty, x: tx, y: ty, layerIndex: i }
    })
    const obstacles: Node[] = stack.layers.map((l, i) => {
      const p = labelPos(i)
      return {
        tool: null,
        r: (l.label.length * 4 + 20) * scale,
        tx: p.x,
        ty: p.y,
        x: p.x,
        y: p.y,
        fx: p.x,
        fy: p.y,
        layerIndex: i,
      }
    })
    const sim = forceSimulation([...ns, ...obstacles])
      .force('radial', forceRadial<Node>((d) => ring(d.layerIndex), C, C).strength(0.9))
      .force('x', forceX<Node>((d) => d.tx).strength(0.25))
      .force('y', forceY<Node>((d) => d.ty).strength(0.25))
      .force('collide', forceCollide<Node>((d) => d.r * 0.62).strength(0.9))
      .stop()
    for (let i = 0; i < 260; i++) sim.tick()
    return ns as Array<Node & { tool: ToolInfo }>
  }, [tools, scale])

  const byName = useMemo(() => new Map(nodes.map((n) => [n.tool.name, n])), [nodes])
  const current = active ? byName.get(active) : undefined
  const related = new Set(current?.tool.related ?? [])

  return (
    <svg
      className={s.orbit}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-active={active ? 'true' : 'false'}
    >
      {stack.layers.map((l, i) => (
        <g key={l.id}>
          <circle
            cx={C}
            cy={C}
            r={ring(i)}
            className={s.ring}
            data-on={current?.tool.layerIndex === i}
          />
          <text
            x={labelPos(i).x}
            y={labelPos(i).y}
            dy="0.35em"
            textAnchor="middle"
            className={s.ringLabel}
            style={{ fontSize: 11 * scale }}
          >
            {l.label}
          </text>
        </g>
      ))}
      <circle cx={C} cy={C} r={4} className={s.core} />
      <text
        x={C}
        y={C + 22 * scale}
        textAnchor="middle"
        className={s.ringLabel}
        style={{ fontSize: 11 * scale }}
      >
        me
      </text>

      {current
        ? current.tool.related.map((name) => {
            const t = byName.get(name)
            if (!t) return null
            const mx = (current.x! + t.x!) / 2
            const my = (current.y! + t.y!) / 2
            // Bow the curve toward the centre: constellations, not spaghetti
            const qx = mx + (C - mx) * 0.45
            const qy = my + (C - my) * 0.45
            return (
              <path
                key={`${active}-${name}`}
                d={`M${current.x} ${current.y} Q${qx} ${qy} ${t.x} ${t.y}`}
                className={s.link}
                pathLength={1}
              />
            )
          })
        : null}

      {nodes.map((n) => {
        const count = n.tool.projects.length
        const state = !current
          ? 'idle'
          : n === current
            ? 'active'
            : related.has(n.tool.name)
              ? 'related'
              : 'dim'
        return (
          <g
            key={n.tool.name}
            className={s.node}
            data-state={state}
            transform={`translate(${n.x!.toFixed(1)} ${n.y!.toFixed(1)})`}
            onPointerEnter={() => onActive(n.tool.name)}
            onPointerLeave={() => onActive(null)}
          >
            <circle r={count ? 3 + count * 1.6 : 3.5} className={count ? s.dot : s.dotHollow} />
            <text
              y={(-12 - count * 1.6) * scale}
              textAnchor="middle"
              className={s.label}
              style={{ fontSize: 15 * scale }}
            >
              {n.tool.name}
            </text>
            <circle r={Math.max(22, n.r * 0.5)} className={s.hit} />
          </g>
        )
      })}
    </svg>
  )
}
