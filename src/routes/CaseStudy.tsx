import { useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getNextProject, getProject } from '@/content/projects'
import type { Project } from '@/content/schema'
import { gsap, ScrollTrigger, useGSAP } from '@/engine/gsap'
import { QUERIES, matches } from '@/engine/media'
import { hasToken, stripTokens } from '@/lib/text'
import { Seo } from '@/components/chrome/Seo'
import { ProjectCover } from '@/components/art/ProjectCover'
import { SplitReveal } from '@/components/primitives/SplitReveal'
import { Copy } from '@/components/primitives/Copy'
import { Tag } from '@/components/primitives/Tag'
import { ArrowLeft, ArrowUpRight } from '@/components/primitives/Icons'
import { TextRoll } from '@/components/primitives/TextRoll'
import NotFound from './NotFound'
import s from './CaseStudy.module.css'

export default function CaseStudy() {
  const { slug } = useParams()
  const project = getProject(slug)
  if (!project) return <NotFound />
  return <CaseStudyView key={project.slug} project={project} />
}

function CaseStudyView({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const next = getNextProject(project.slug)
  const title = stripTokens(project.title)
  const placeholder = project.status === 'placeholder'

  const back = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    if ((location.state as { from?: string } | null)?.from === 'home') navigate(-1)
    else navigate('/#work')
  }

  // Gallery: clip reveal on enter + gentle parallax on the media inside
  useGSAP(
    () => {
      if (matches(QUERIES.reducedMotion)) return
      gsap.utils.toArray<HTMLElement>('[data-figure]').forEach((fig) => {
        const media = fig.querySelector('[data-parallax]')
        gsap.fromTo(
          fig,
          { clipPath: 'inset(18% 6% 18% 6%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 40%', scrub: 0.6 },
          },
        )
        if (media)
          gsap.fromTo(
            media,
            { yPercent: -7, scale: 1.14 },
            {
              yPercent: 7,
              scale: 1.14,
              ease: 'none',
              scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
      })
      ScrollTrigger.refresh()
    },
    { scope: root },
  )

  const [lead, ...rest] = project.gallery
  const narrative: Array<[string, string[]]> = [
    ['The problem', [project.problem]],
    ['What I did', project.approach],
    ['How it went', [project.outcome]],
    ["What I'd change", [project.hindsight]],
  ]

  return (
    <article ref={root} className={s.page} data-section="01" data-section-label="Case study">
      <Seo
        title={title}
        description={stripTokens(project.summary)}
        path={`/work/${project.slug}`}
        type="article"
      />

      <div className={s.cover} data-cover-target={project.slug}>
        <ProjectCover media={project.cover} priority />
      </div>

      <header className={`${s.intro} grid`}>
        <div className={s.kickerRow}>
          <p className="mono dim">
            Case study · {project.year} · {project.discipline}
          </p>
          <a href="/#work" className={`${s.back} mono`} onClick={back}>
            <ArrowLeft size={14} />
            <TextRoll text="All work" />
          </a>
        </div>
        <SplitReveal as="h1" text={title} className={s.title} />
        {hasToken(project.title) ? (
          <Tag tone="placeholder" className={s.titleTag}>
            Placeholder project
          </Tag>
        ) : null}
        <p className={s.lede}>
          <Copy text={project.summary} />
        </p>
        {placeholder ? (
          <p className={`${s.notice} mono`}>
            This case study is a template. The real one is on its way — the structure is here so it
            can drop straight in.
          </p>
        ) : null}
      </header>

      <dl className={`${s.meta} grid`}>
        <div>
          <dt className="mono dim">Role</dt>
          <dd>
            <Copy text={project.role} />
          </dd>
        </div>
        <div>
          <dt className="mono dim">Year</dt>
          <dd>{project.year}</dd>
        </div>
        <div>
          <dt className="mono dim">Duration</dt>
          <dd>
            <Copy text={project.duration} />
          </dd>
        </div>
        <div className={s.metaStack}>
          <dt className="mono dim">Stack</dt>
          <dd>
            <ul role="list" className={s.tags}>
              {project.stack.map((t) => (
                <Tag as="li" key={t}>
                  {t}
                </Tag>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="mono dim">Links</dt>
          <dd className={s.links}>
            {project.links.live ? (
              <a href={project.links.live} target="_blank" rel="noreferrer" className={s.extLink}>
                <TextRoll text="Live site" /> <ArrowUpRight size={14} />
              </a>
            ) : (
              <span className="dim">Live link soon</span>
            )}
            {project.links.repo ? (
              <a href={project.links.repo} target="_blank" rel="noreferrer" className={s.extLink}>
                <TextRoll text="Source" /> <ArrowUpRight size={14} />
              </a>
            ) : null}
          </dd>
        </div>
      </dl>

      <section className={s.narrative} aria-label="Story">
        {narrative.map(([label, paras]) => (
          <div key={label} className={`${s.block} grid`}>
            <h2 className={`${s.blockLabel} mono`}>{label}</h2>
            <div className={s.blockBody}>
              {paras.map((p, i) => (
                <p key={i}>
                  <Copy text={p} />
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {lead ? (
        <figure className={`${s.figure} ${s.wide}`} data-figure>
          <div className={s.media} data-parallax>
            <ProjectCover media={lead.media} />
          </div>
          <figcaption className="mono dim">
            <Copy text={lead.caption} />
          </figcaption>
        </figure>
      ) : null}

      <blockquote className={`${s.quote} grid`}>
        <p>
          <span className={s.mark} aria-hidden="true">
            “
          </span>
          <Copy text={project.pullQuote} />
        </p>
      </blockquote>

      {rest.length ? (
        <div className={`${s.gallery} grid`}>
          {rest.map((g, i) => (
            <figure key={i} className={`${s.figure} ${g.wide ? s.wide : s.half}`} data-figure>
              <div className={s.media} data-parallax>
                <ProjectCover media={g.media} />
              </div>
              <figcaption className="mono dim">
                <Copy text={g.caption} />
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      <nav className={s.next} aria-label="Next project">
        <Link
          to={`/work/${next.slug}`}
          className={s.nextLink}
          data-cursor="view"
          data-cursor-label="Next"
        >
          <span className={`${s.nextKicker} mono dim`}>Next project</span>
          <span className={s.nextTitle}>
            <TextRoll text={stripTokens(next.title)} mode="whole" />
          </span>
          <span className={s.nextCover} aria-hidden="true">
            <ProjectCover media={next.cover} />
          </span>
        </Link>
      </nav>
    </article>
  )
}
