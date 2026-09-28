import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import s from './Contact.module.css'

/** Shared field chrome so the static and the enhanced form render identical markup. */
export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className={s.field} data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id} className={`${s.label} mono`}>
        {label}
      </label>
      {children}
      <p id={`${id}-error`} className={s.error} aria-live="polite">
        {error ?? ''}
      </p>
    </div>
  )
}

/** Visually hidden honeypot — humans never see or tab to it; bots love it. */
export const Honeypot = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Honeypot(props, ref) {
    return (
      <div className={s.honeypot} aria-hidden="true">
        <label htmlFor="cf-company">Company (leave empty)</label>
        <input ref={ref} id="cf-company" type="text" tabIndex={-1} autoComplete="off" {...props} />
      </div>
    )
  },
)
