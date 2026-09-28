import type { MouseEvent, FocusEvent, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '@/content/schema'
import { hasToken, stripTokens } from '@/lib/text'
import { Tag } from './Tag'
import { ArrowUpRight } from './Icons'
import s from './ProjectRow.module.css'

interface Props {
  project: Project
  index: number
  onActivate?: (e: MouseEvent<HTMLAnchorElement>, project: Project) => void
  onHover?: (project: Project | null, e?: PointerEvent | FocusEvent) => void
}

/** Editorial list row: index · title · discipline · stack · year. */
export function ProjectRow({ project, index, onActivate, onHover }: Props) {
  const placeholder = hasToken(project.title)
  const title = stripTokens(project.title)
  return (
    <li className={s.item}>
      <Link
        to={`/work/${project.slug}`}
        className={s.row}
        data-cursor="view"
        data-cursor-label="View"
        data-cover-source={project.slug}
        onClick={(e) => onActivate?.(e, project)}
        onPointerEnter={(e) => onHover?.(project, e)}
        onPointerLeave={() => onHover?.(null)}
        onFocus={(e) => onHover?.(project, e)}
        onBlur={() => onHover?.(null)}
      >
        <span className={`${s.index} mono`}>{String(index + 1).padStart(2, '0')}</span>
        <span className={s.title}>
          <span className={s.titleText}>{title}</span>
          {placeholder ? (
            <Tag tone="placeholder" className={s.ph}>
              Placeholder
            </Tag>
          ) : null}
        </span>
        <span className={s.discipline}>
          <Tag>{project.discipline}</Tag>
        </span>
        <span className={`${s.stack} mono dim`}>
          {project.stack.slice(0, 2).join(' / ')}
          {project.stack.length > 2 ? (
            <span className={s.more}> +{project.stack.length - 2}</span>
          ) : null}
        </span>
        <span className={`${s.year} mono`}>{project.year}</span>
        <span className={s.arrow} aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </Link>
    </li>
  )
}
