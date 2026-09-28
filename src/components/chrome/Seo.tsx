import { Helmet } from 'react-helmet-async'
import { site } from '@/content/site'

interface Props {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
  type?: 'website' | 'article'
}

/** Per-route meta (title, description, canonical, OG/Twitter) + Person JSON-LD on the home page. */
export function Seo({
  title,
  description = site.seo.description,
  path = '/',
  image = site.seo.ogImage,
  noindex,
  type = 'website',
}: Props) {
  const fullTitle = title ? `${title} — ${site.name}` : site.seo.title
  const url = `${site.seo.siteUrl}${path}`
  const img = image.startsWith('http') ? image : `${site.seo.siteUrl}${image}`
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: 'Web Developer',
    url: site.seo.siteUrl,
    email: `mailto:${site.email}`,
    sameAs: site.socials.map((s) => s.href),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LK',
      addressLocality: site.location.country,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Sri Lanka Institute of Information Technology (SLIIT)',
    },
    knowsAbout: ['Front-end development', 'Web animation', 'Web performance', 'Accessibility'],
  }
  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex" /> : null}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${site.name} — ${site.role}`} />
      <meta property="og:locale" content={site.seo.locale} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {path === '/' ? <script type="application/ld+json">{JSON.stringify(person)}</script> : null}
    </Helmet>
  )
}
