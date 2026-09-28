import { site } from '@/content/site'
import { Seo } from '@/components/chrome/Seo'
import { Button } from '@/components/primitives/Button'
import { Rich } from '@/components/primitives/Rich'
import { ArrowRight } from '@/components/primitives/Icons'
import s from './NotFound.module.css'

export default function NotFound() {
  return (
    <section className={`${s.page} grid`} aria-labelledby="nf-title">
      <Seo title="Not found" path="/404" noindex />
      <p className={`${s.code} mono dim`}>Error 404</p>
      <span className={s.big} aria-hidden="true">
        4<em>0</em>4
      </span>
      <h1 id="nf-title" className={s.title}>
        <Rich text={site.notFound.title} />
      </h1>
      <p className={s.body}>{site.notFound.body}</p>
      <div className={s.cta}>
        <Button to="/" label={site.notFound.cta} icon={<ArrowRight />} size="l" magnetic />
      </div>
    </section>
  )
}
