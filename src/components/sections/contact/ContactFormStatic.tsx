import { site } from '@/content/site'
import { Field, Honeypot } from './formShared'
import { COPY, FORM_ENDPOINT, LIMITS } from './formConfig'
import s from './Contact.module.css'

/**
 * Server-rendered form that works with no JavaScript at all: native validation, and it posts to
 * the endpoint (or opens the mail app via a mailto: action). Swapped for the enhanced version
 * before it scrolls into view.
 */
export function ContactFormStatic() {
  return (
    <form
      id="contact-form"
      className={s.form}
      action={FORM_ENDPOINT || `mailto:${site.email}`}
      method="post"
      encType={FORM_ENDPOINT ? undefined : 'text/plain'}
    >
      <Field id="cf-name" label={COPY.name.label}>
        <input
          id="cf-name"
          name="name"
          className={s.input}
          autoComplete="name"
          required
          minLength={LIMITS.nameMin}
        />
      </Field>
      <Field id="cf-email" label={COPY.email.label}>
        <input
          id="cf-email"
          name="email"
          type="email"
          className={s.input}
          autoComplete="email"
          required
        />
      </Field>
      <Field id="cf-message" label={COPY.message.label}>
        <textarea
          id="cf-message"
          name="message"
          className={`${s.input} ${s.textarea}`}
          rows={5}
          required
          minLength={LIMITS.messageMin}
          maxLength={LIMITS.messageMax}
        />
      </Field>
      <Honeypot name="company" />
      <div className={s.submitRow}>
        <button type="submit" className={`${s.submit} mono`}>
          Send it
        </button>
        {!FORM_ENDPOINT ? (
          <p className={`${s.formNote} dim`}>{site.contact.form.mailtoNote}</p>
        ) : null}
      </div>
    </form>
  )
}
