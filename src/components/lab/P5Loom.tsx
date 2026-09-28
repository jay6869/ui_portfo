import { useEffect, useRef } from 'react'
import type P5 from 'p5'
import { gsap } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import s from './Lab.module.css'

/**
 * Loom — a flow field that weaves threads in the site palette. p5 runs in instance mode with
 * noLoop(); frames are pulled from gsap.ticker (the one loop) and only while on screen.
 * Pointer pulls the threads; click reseeds.
 */
export default function P5Loom() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    let instance: P5 | null = null
    let visible = true
    let disposed = false
    const reduce = matches(QUERIES.reducedMotion)
    const css = getComputedStyle(document.documentElement)
    const col = (v: string) => css.getPropertyValue(v).trim() || '#000'

    const tick = () => {
      if (visible && !document.hidden) instance?.redraw()
    }

    void import('p5').then(({ default: p5 }) => {
      if (disposed) return
      // The Friendly Error System re-parses sketch source, which fails on minified code (and
      // costs time). p5's own advice for production is to turn it off.
      ;(p5 as unknown as { disableFriendlyErrors: boolean }).disableFriendlyErrors = true
      instance = new p5((p: P5) => {
        type Thread = { x: number; y: number; px: number; py: number; hue: 0 | 1; life: number }
        let threads: Thread[] = []
        let seed = Math.floor(Math.random() * 1e6)
        const bg = col('--art-1')
        const bone = col('--art-3')
        const clay = col('--art-4')

        const spawn = (): Thread => {
          const x = p.random(p.width)
          const y = p.random(p.height)
          return { x, y, px: x, py: y, hue: p.random() < 0.08 ? 1 : 0, life: p.random(80, 260) }
        }
        const reset = () => {
          p.noiseSeed(seed)
          p.randomSeed(seed)
          p.background(bg)
          threads = Array.from({ length: 420 }, spawn)
        }

        p.setup = () => {
          const c = p.createCanvas(el.clientWidth, el.clientHeight)
          c.elt.setAttribute('aria-hidden', 'true')
          p.pixelDensity(Math.min(window.devicePixelRatio, 2))
          p.noLoop()
          reset()
          if (reduce) for (let i = 0; i < 160; i++) p.redraw() // one finished, still frame
        }
        p.draw = () => {
          p.noStroke()
          p.fill(bg + '06')
          p.rect(0, 0, p.width, p.height)
          const mx = p.mouseX
          const my = p.mouseY
          const pointerIn = mx > 0 && my > 0 && mx < p.width && my < p.height
          for (const t of threads) {
            const n = p.noise(t.x * 0.0035, t.y * 0.0035, p.frameCount * 0.0015)
            let a = n * p.TWO_PI * 2.2
            if (pointerIn) {
              const d = p.dist(t.x, t.y, mx, my)
              if (d < 140) a = p.lerp(a, p.atan2(my - t.y, mx - t.x) + p.HALF_PI, 1 - d / 140)
            }
            t.px = t.x
            t.py = t.y
            t.x += Math.cos(a) * 1.4
            t.y += Math.sin(a) * 1.4
            p.stroke(t.hue ? clay : bone)
            p.strokeWeight(t.hue ? 1.2 : 0.7)
            ;(p.drawingContext as CanvasRenderingContext2D).globalAlpha = t.hue ? 0.7 : 0.16
            p.line(t.px, t.py, t.x, t.y)
            if (--t.life < 0 || t.x < 0 || t.y < 0 || t.x > p.width || t.y > p.height)
              Object.assign(t, spawn())
          }
          ;(p.drawingContext as CanvasRenderingContext2D).globalAlpha = 1
        }
        p.mousePressed = () => {
          if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) return
          seed = Math.floor(Math.random() * 1e6)
          reset()
          if (reduce) for (let i = 0; i < 160; i++) p.redraw()
        }
        p.windowResized = () => {
          p.resizeCanvas(el.clientWidth, el.clientHeight)
          reset()
        }
      }, el)
      if (!reduce) gsap.ticker.add(tick)
    })

    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
    io.observe(el)
    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      io.disconnect()
      instance?.remove()
    }
  }, [])

  return <div ref={host} className={s.canvasHost} data-cursor="drag" data-cursor-label="Pull" />
}
