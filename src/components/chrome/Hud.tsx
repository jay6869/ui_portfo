import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/engine/gsap'
import { useUI } from '@/stores/ui'
import s from './Hud.module.css'

/**
 * Fixed frame at the viewport edges: the current section as a vertical label in the left margin,
 * and a scroll-progress hairline in the right margin (the ⌘K hint lives in the header).
 * Sections opt in with data-section / data-section-label.
 */
export function Hud({ routeKey }: { routeKey: string }) {
  const bar = useRef<HTMLDivElement>(null)
  const section = useUI((st) => st.section)

  useEffect(() => {
    const setScale = gsap.quickSetter(bar.current, 'scaleY')
    const setSection = useUI.getState().setSection
    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setScale(self.progress),
    })
    setSection('00', 'Intro')
    const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).map(
      (el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setSection(el.dataset.section ?? '', el.dataset.sectionLabel ?? '')
            else if (self.direction === -1 && el === document.querySelector('[data-section]'))
              setSection('00', 'Intro')
          },
        }),
    )
    return () => {
      progress.kill()
      triggers.forEach((t) => t.kill())
    }
  }, [routeKey])

  return (
    <div className={s.hud} data-idle={section.index === '00'}>
      <p className={`${s.section} mono`} aria-live="off">
        <span key={section.index} className={s.swap}>
          <span className={s.index}>{section.index}</span>
          <span className={s.sep} aria-hidden="true" />
          <span>{section.label}</span>
        </span>
      </p>
      <div className={s.progress} aria-hidden="true">
        <div ref={bar} className={s.bar} />
      </div>
    </div>
  )
}
