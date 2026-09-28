import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import s from './Contact.module.css'

export const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''

export const LIMITS = { nameMin: 2, messageMin: 20, messageMax: 2000 } as const

export const COPY = {
  name: { label: 'Your name', error: "I'd like to know who I'm talking to." },
  email: { label: 'Email', error: "That email doesn't look right." },
  message: {
    label: 'What are we building?',
    error: `A few more words, please (${LIMITS.messageMin}+ characters).`,
    tooLong: `That's a lot — keep it under ${LIMITS.messageMax} characters.`,
  },
} as const

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
