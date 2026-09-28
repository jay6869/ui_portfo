import { site } from '@/content/site'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { WorkList } from './WorkList'
import { WorkCarousel } from './WorkCarousel'
import s from './Work.module.css'

export function Work() {
  const h = site.sections.work!
  return (
    <section
      id="work"
      className={s.work}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="work-title"
      tabIndex={-1}
    >
      <SectionHeading
        id="work-title"
        index={h.index}
        label={h.label}
        title={h.title}
        kicker={h.kicker}
      />
      <div className={s.desktop}>
        <WorkList />
      </div>
      <div className={s.mobile}>
        <WorkCarousel />
      </div>
    </section>
  )
}
