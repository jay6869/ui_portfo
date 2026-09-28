import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/text'
import { TextRoll } from './TextRoll'
import { Magnetic } from './Magnetic'
import s from './Button.module.css'

type Variant = 'primary' | 'ghost' | 'quiet'
type Size = 's' | 'm' | 'l'

interface Common {
  label: string
  variant?: Variant
  size?: Size
  icon?: ReactNode
  magnetic?: boolean
  loading?: boolean
  className?: string
}
type AsButton = Common & { to?: never; href?: never } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children'
  >
type AsAnchor = Common & { href: string; to?: never } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'children' | 'href'
  >
type AsLink = Common & { to: string; href?: never; replace?: boolean }
export type ButtonProps = AsButton | AsAnchor | AsLink

/** Pill button. Text rolls on hover/focus; optional magnetic pull; renders button, a or Link. */
export function Button(props: ButtonProps) {
  const {
    label,
    variant = 'primary',
    size = 'm',
    icon,
    magnetic = false,
    loading = false,
    className,
  } = props
  const cls = cx(s.button, s[variant], s[size], loading && s.loading, className)
  const inner = (
    <span className={s.inner} data-magnetic-inner>
      <TextRoll text={label} />
      {icon ? <span className={s.icon}>{icon}</span> : null}
      {loading ? <span className={s.spinner} aria-hidden="true" /> : null}
    </span>
  )

  let el: ReactNode
  if ('to' in props && props.to !== undefined) {
    el = (
      <Link to={props.to} replace={props.replace} className={cls}>
        {inner}
      </Link>
    )
  } else if ('href' in props && props.href !== undefined) {
    const {
      label: _l,
      variant: _v,
      size: _s,
      icon: _i,
      magnetic: _m,
      loading: _lo,
      className: _c,
      href,
      ...rest
    } = props
    el = (
      <a href={href} className={cls} {...rest}>
        {inner}
      </a>
    )
  } else {
    const {
      label: _l,
      variant: _v,
      size: _s,
      icon: _i,
      magnetic: _m,
      loading: _lo,
      className: _c,
      type = 'button',
      ...rest
    } = props as AsButton
    el = (
      <button type={type} className={cls} aria-busy={loading || undefined} {...rest}>
        {inner}
      </button>
    )
  }
  return magnetic ? <Magnetic>{el}</Magnetic> : el
}
