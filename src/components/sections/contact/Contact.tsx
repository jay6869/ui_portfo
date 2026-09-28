import { lazy, Suspense } from 'react'
import { site } from '@/content/site'
import { useUI } from '@/stores/ui'
import { copyText } from '@/lib/clipboard'
import { useNearViewport } from '@/engine/near'
import { SplitReveal } from '@/components/primitives/SplitReveal'
import { Magnetic } from '@/components/primitives/Magnetic'
import { TextRoll } from '@/components/primitives/TextRoll'
import { ArrowUpRight, CopyIcon } from '@/components/primitives/Icons'
import { ContactFormStatic } from './ContactFormStatic'
import s from './Contact.module.css'

const ContactForm = lazy(() => import('./ContactForm'))

export function Contact() {
  const h = site.sections.contact!
  const toast = useUI((st) => st.toast)
  const [formRef, near] = useNearViewport<HTMLDivElement>('700px 0px')

  const copy = async () => {
    const ok = await copyText(site.email)
    toast(
      ok ? site.contact.copyToast : `Couldn't copy — it's ${site.email}`,
      ok ? 'success' : 'error',
    )
  }

  const links = [
    ...site.socials.map((x) => ({
      label: x.label,
      href: x.href,
      handle: x.handle,
      external: true,
    })),
    { label: 'Email', href: `mailto:${site.email}`, handle: site.email, external: false },
  ]

  return (
    <section
      id="contact"
      className={s.section}
      data-section={h.index}
      data-section-label={h.label}
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className={`${s.rail} page-x`}>
        <span className="mono">({h.index})</span>
        <span className={s.railLine} aria-hidden="true" />
        <span className="mono">{h.label}</span>
      </div>

      <SplitReveal
        as="h2"
        id="contact-title"
        text={site.contact.headline}
        split="chars"
        className={`${s.headline} page-x`}
      />

      <div className={`${s.body} grid`}>
        <div className={s.intro}>
          <p className={s.lede}>{site.contact.lede}</p>
          {/* Name = visible text ("…@gmail.com Copy email address"), no overriding aria-label */}
          <button type="button" className={s.email} onClick={copy}>
            <span className={s.emailText}>{site.email}</span>
            <span className={`${s.emailHint} mono`}>
              <CopyIcon size={14} /> Copy<span className="sr-only"> email address</span>
            </span>
          </button>
          <Magnetic strength={0.4} padding={40} className={s.ctaWrap}>
            <a
              href="#contact-form"
              className={s.cta}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('cf-name')?.focus()
              }}
            >
              <span className={s.ctaInner} data-magnetic-inner>
                <TextRoll text={site.contact.cta} />
                <ArrowUpRight size={18} />
              </span>
            </a>
          </Magnetic>
        </div>

        <div ref={formRef} className={s.formCol}>
          {near ? (
            <Suspense fallback={<ContactFormStatic />}>
              <ContactForm />
            </Suspense>
          ) : (
            <ContactFormStatic />
          )}
        </div>
      </div>

      <ul className={s.socials} role="list">
        {links.map((l) => (
          <li key={l.label}>
            <a
              className={s.social}
              href={l.href}
              {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <span className={s.socialLabel}>
                <TextRoll text={l.label} mode="whole" />
              </span>
              <span className={`${s.socialHandle} mono dim`}>{l.handle}</span>
              <ArrowUpRight size={22} className={s.socialArrow} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
