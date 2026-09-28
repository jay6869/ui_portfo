import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { m, AnimatePresence } from 'framer-motion'
import { site } from '@/content/site'
import { useUI } from '@/stores/ui'
import { EASE } from '@/engine/ease'
import { TextRoll } from '@/components/primitives/TextRoll'
import { Field, Honeypot } from './formShared'
import { COPY, FORM_ENDPOINT, LIMITS } from './formConfig'
import s from './Contact.module.css'

const schema = z.object({
  name: z.string().trim().min(LIMITS.nameMin, COPY.name.error),
  email: z.string().trim().pipe(z.email(COPY.email.error)),
  message: z
    .string()
    .trim()
    .min(LIMITS.messageMin, COPY.message.error)
    .max(LIMITS.messageMax, COPY.message.tooLong),
  company: z.string().optional(), // honeypot — judged in onSubmit, never a validation error
})
type Values = z.infer<typeof schema>

/** Hand off to the mail app. `window.__jgOpenMail` is a test seam (Cypress stubs it). */
function openMail(href: string) {
  const hook = (window as unknown as { __jgOpenMail?: (h: string) => void }).__jgOpenMail
  if (hook) hook(href)
  else window.location.href = href
}

/** Anything faster than this from first keystroke to submit is a bot. */
const MIN_FILL_MS = 2500

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'error'

/** React Hook Form + Zod enhancement of the static form (same markup, better behaviour). */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const startedAt = useRef<number | null>(null)
  const toast = useUI((st) => st.toast)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const onSubmit = async (v: Values) => {
    const tooFast = startedAt.current !== null && Date.now() - startedAt.current < MIN_FILL_MS
    if (v.company || tooFast) {
      // Pretend it worked. Bots don't need feedback.
      setStatus('sent')
      return
    }
    if (!FORM_ENDPOINT) {
      const body = `${v.message}\n\n— ${v.name} (${v.email})`
      openMail(
        `mailto:${site.email}?subject=${encodeURIComponent(`Hello from ${v.name}`)}&body=${encodeURIComponent(body)}`,
      )
      setStatus('mailto')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: v.name, email: v.email, message: v.message }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      reset()
    } catch {
      setStatus('error')
      toast(site.contact.form.error, 'error')
    }
  }

  const described = (field: keyof Values) => (errors[field] ? `cf-${field}-error` : undefined)

  return (
    <div className={s.formWrap}>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'sent' || status === 'mailto' ? (
          <m.div
            key="done"
            className={s.done}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE.out }}
          >
            <svg className={s.check} viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="24" />
              <path d="M15 27 l7.5 7.5 L37 19" />
            </svg>
            <p className={s.doneTitle}>
              {status === 'sent'
                ? site.contact.form.success
                : 'Your email app should be opening now.'}
            </p>
            <button type="button" className={`${s.again} mono`} onClick={() => setStatus('idle')}>
              <TextRoll text="Write another" />
            </button>
          </m.div>
        ) : (
          <m.form
            key="form"
            id="contact-form"
            className={s.form}
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            onInput={() => (startedAt.current ??= Date.now())}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
            aria-describedby="cf-status"
          >
            <Field id="cf-name" label={COPY.name.label} error={errors.name?.message}>
              <input
                id="cf-name"
                className={s.input}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={described('name')}
                {...register('name')}
              />
            </Field>
            <Field id="cf-email" label={COPY.email.label} error={errors.email?.message}>
              <input
                id="cf-email"
                type="email"
                className={s.input}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={described('email')}
                {...register('email')}
              />
            </Field>
            <Field id="cf-message" label={COPY.message.label} error={errors.message?.message}>
              <textarea
                id="cf-message"
                className={`${s.input} ${s.textarea}`}
                rows={5}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={described('message')}
                {...register('message')}
              />
            </Field>
            <Honeypot {...register('company')} />
            <div className={s.submitRow}>
              <button
                type="submit"
                className={`${s.submit} mono`}
                disabled={status === 'sending'}
                aria-busy={status === 'sending' || undefined}
              >
                {status === 'sending' ? (
                  <>
                    <span className={s.spinner} aria-hidden="true" /> Sending
                  </>
                ) : (
                  <TextRoll text="Send it" />
                )}
              </button>
              <p id="cf-status" className={`${s.formNote} dim`} aria-live="polite">
                {status === 'error'
                  ? site.contact.form.error
                  : !FORM_ENDPOINT
                    ? site.contact.form.mailtoNote
                    : ''}
              </p>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  )
}
