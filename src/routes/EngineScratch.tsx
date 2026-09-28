import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger, useGSAP } from '@/engine/gsap'
import { scroller } from '@/engine/scroll'
import { useUI } from '@/stores/ui'
import { toggleTheme } from '@/lib/theme'

/**
 * DEV ONLY. Verifies the engine before sections exist: one ticker, Lenis ↔ ScrollTrigger sync,
 * scrub accuracy, sticky stacking, route wipes and theme reveal.
 */
export default function EngineScratch() {
  const root = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState('')
  const loc = useLocation()
  const toast = useUI((s) => s.toast)

  useGSAP(
    () => {
      gsap.to('[data-box]', {
        xPercent: 300,
        rotate: 180,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-track]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
      const st = ScrollTrigger.create({
        trigger: '[data-track]',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const lenisY = scroller.y
          setStats(
            `progress ${self.progress.toFixed(3)} · velocity ${Math.round(self.getVelocity())} · ` +
              `lenis ${Math.round(lenisY)} · window ${Math.round(window.scrollY)} · ` +
              `smooth ${scroller.isSmooth} · ticker frame ${gsap.ticker.frame}`,
          )
        },
      })
      return () => st.kill()
    },
    { scope: root, dependencies: [loc.pathname] },
  )

  return (
    <div ref={root} className="page-x" style={{ paddingBlock: '20vh' }}>
      <h1 className="display" style={{ fontSize: 'var(--step-4)' }}>
        Engine <em className="accent">scratch</em> — {loc.pathname}
      </h1>
      <p
        className="mono dim"
        data-stats
        style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 999 }}
      >
        {stats || 'scroll to start'}
      </p>
      <nav style={{ display: 'flex', gap: 24, marginTop: 32 }}>
        <Link to="/__engine/a">Route A</Link>
        <Link to="/__engine/b">Route B</Link>
        <Link to="/">Home</Link>
        <button onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}>Theme</button>
        <button onClick={() => toast('Copied. Talk soon.')}>Toast</button>
        <button onClick={() => scroller.scrollTo('[data-track]', { offset: -100 })}>
          Scroll to track
        </button>
      </nav>
      <div style={{ height: '120vh' }} />
      <div
        data-track
        style={{ height: '150vh', borderBlock: 'var(--hairline)', position: 'relative' }}
      >
        <div
          data-box
          style={{
            position: 'sticky',
            top: '40vh',
            width: 80,
            height: 80,
            background: 'var(--accent)',
          }}
        />
      </div>
      {[0, 1, 2].map((i) => (
        <section
          key={i}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            background: i % 2 ? 'var(--bg-raised)' : 'var(--bg-sunken)',
            borderTop: 'var(--hairline)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <h2 className="display" style={{ fontSize: 'var(--step-3)' }}>
            Sticky card {i + 1}
          </h2>
        </section>
      ))}
      <div style={{ height: '60vh' }} />
    </div>
  )
}
