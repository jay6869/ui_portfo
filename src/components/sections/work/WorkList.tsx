import { useRef, useState } from 'react'
import type { Project } from '@/content/schema'
import { projects } from '@/content/projects'
import { ProjectRow } from '@/components/primitives/ProjectRow'
import { FloatingPreview, type PreviewHandle } from './FloatingPreview'
import { useOpenProject } from './useSharedNav'
import s from './Work.module.css'

/** Desktop: editorial rows; hover/focus reveals the floating preview, click expands it. */
export function WorkList() {
  const [active, setActive] = useState<Project | null>(null)
  const [armed, setArmed] = useState(false) // mount preview covers on first interaction only
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const preview = useRef<PreviewHandle>(null)
  const open = useOpenProject()
  const flagship = projects.filter((p) => p.featured)
  const smaller = projects.filter((p) => !p.featured)

  const rows = (list: Project[], offset: number) =>
    list.map((p, i) => (
      <ProjectRow
        key={p.slug}
        project={p}
        index={offset + i}
        onHover={(proj, e) => {
          if (e && 'pointerType' in e && e.pointerType !== 'mouse') return
          setArmed(true)
          setActive(proj)
          // Keyboard focus (not pointer) → park the preview beside the row
          setAnchor(
            e && e.type === 'focus' && !(e.target as HTMLElement).matches(':hover')
              ? (e.target as HTMLElement)
              : null,
          )
        }}
        onActivate={(e, proj) => {
          const el = active?.slug === proj.slug ? preview.current?.el() : null
          const visible = el?.dataset.visible === 'true'
          open(
            e,
            proj.slug,
            visible ? (el?.firstElementChild ?? null) : null,
            preview.current?.rotation() ?? 0,
          )
        }}
      />
    ))

  return (
    <div className={`${s.list} work-list`} onPointerLeave={() => setActive(null)}>
      <ul role="list" className={s.rows} aria-label="Flagship projects">
        {rows(flagship, 0)}
      </ul>
      {smaller.length ? (
        <>
          <p className={`${s.subhead} mono dim`}>Smaller things</p>
          <ul role="list" className={s.rows} aria-label="Smaller projects">
            {rows(smaller, flagship.length)}
          </ul>
        </>
      ) : null}
      {armed ? (
        <FloatingPreview ref={preview} active={active} visible={active !== null} anchor={anchor} />
      ) : null}
    </div>
  )
}
