/**
 * Content schemas. Content files import only the *types* from here (`import type`), so Zod never
 * ships to the browser for content. Validation runs in dev (on load, see validate.ts) and at
 * build time (prerender fails on invalid content).
 */
import { z } from 'zod'

const url = z.url()
/** A URL, or an internal path like /janith-godage-web-cv.pdf */
const href = z.string().regex(/^(https?:\/\/|mailto:|\/)/, 'Must be a URL, mailto: or /path')

export const artVariant = z.enum(['orbit', 'strata', 'grid', 'glyph', 'waves', 'blocks'])

/** Media: generative art (placeholder-friendly), a real image, or a video. */
export const media = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('art'),
    variant: artVariant,
    seed: z.number().int(),
    /** Optional glyph for the 'glyph' variant */
    glyph: z.string().max(2).optional(),
    alt: z.string().min(1),
  }),
  z.object({
    type: z.literal('image'),
    /** Fallback src (jpg/png/webp) */
    src: href,
    /** Optional srcset strings, e.g. "/work/x/cover-800.avif 800w, /work/x/cover-1600.avif 1600w" */
    avif: z.string().optional(),
    webp: z.string().optional(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    /** Dominant colour shown while loading (blur-up substitute) */
    color: z.string().optional(),
    alt: z.string(),
  }),
  z.object({
    type: z.literal('video'),
    src: href,
    poster: href,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(1),
  }),
])

export const siteSchema = z.object({
  name: z.string(),
  firstName: z.string(),
  monogram: z.string().max(3),
  role: z.string(),
  eyebrow: z.string(),
  intro: z.string(),
  location: z.object({
    country: z.string(),
    timezone: z.string(),
    offsetLabel: z.string(),
  }),
  education: z.object({
    degree: z.string(),
    short: z.string(),
    school: z.string(),
    year: z.string(),
  }),
  email: z.email(),
  socials: z.array(z.object({ label: z.string(), href: url, handle: z.string() })).min(1),
  cv: z.object({ href, label: z.string(), placeholder: z.boolean() }),
  repo: z.object({ url, placeholder: z.boolean() }),
  availability: z.object({ open: z.boolean(), label: z.string(), closedLabel: z.string() }),
  seo: z.object({
    title: z.string().max(70),
    description: z.string().min(50).max(170),
    siteUrl: url,
    ogImage: z.string(),
    locale: z.string(),
  }),
  nav: z.array(z.object({ id: z.string(), label: z.string(), index: z.string() })),
  hero: z.object({
    facts: z.array(z.string()),
    scrollLabel: z.string(),
  }),
  sections: z.record(
    z.string(),
    z.object({
      index: z.string(),
      label: z.string(),
      title: z.string(),
      kicker: z.string().optional(),
    }),
  ),
  preloader: z.object({ lines: z.array(z.string()).length(3) }),
  contact: z.object({
    headline: z.string(),
    lede: z.string(),
    cta: z.string(),
    copyToast: z.string(),
    form: z.object({
      success: z.string(),
      error: z.string(),
      mailtoNote: z.string(),
    }),
  }),
  footer: z.object({ madeWith: z.string(), year: z.number().int() }),
  notFound: z.object({ title: z.string(), body: z.string(), cta: z.string() }),
})

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(['placeholder', 'real']),
  featured: z.boolean(),
  title: z.string(),
  discipline: z.string(),
  year: z.number().int().min(2000).max(2100),
  role: z.string(),
  duration: z.string(),
  stack: z.array(z.string()).min(1),
  summary: z.string(),
  problem: z.string(),
  approach: z.array(z.string()).min(1),
  outcome: z.string(),
  hindsight: z.string(),
  pullQuote: z.string(),
  links: z.object({ live: href.optional(), repo: href.optional() }),
  cover: media,
  gallery: z.array(z.object({ media, caption: z.string(), wide: z.boolean().optional() })),
})

export const serviceSchema = z.object({
  id: z.string(),
  title: z.string(),
  emphasis: z.string(),
  body: z.string(),
  tools: z.array(z.string()).min(1),
})

export const stackSchema = z.object({
  layers: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        tools: z.array(z.string()).min(1),
      }),
    )
    .min(2),
  marquee: z.array(z.string()).min(4),
})

export const labSchema = z.object({
  id: z.enum(['loom', 'specimen', 'keys', 'tape']),
  title: z.string(),
  blurb: z.string(),
  tags: z.array(z.string()),
  source: z.string(),
  action: z.string(),
})

export const aboutSchema = z.object({
  bio: z.array(z.string()).length(3),
  facts: z.array(z.object({ label: z.string(), value: z.string() })),
  principles: z.array(z.object({ title: z.string(), body: z.string() })).length(4),
  portrait: z.union([media, z.object({ type: z.literal('placeholder'), alt: z.string() })]),
  map: z.object({
    enabled: z.boolean(),
    lat: z.number(),
    lng: z.number(),
    zoom: z.number(),
    label: z.string(),
  }),
})

export type Media = z.infer<typeof media>
export type ArtVariant = z.infer<typeof artVariant>
export type SiteContent = z.infer<typeof siteSchema>
export type Project = z.infer<typeof projectSchema>
export type Service = z.infer<typeof serviceSchema>
export type StackContent = z.infer<typeof stackSchema>
export type LabItem = z.infer<typeof labSchema>
export type AboutContent = z.infer<typeof aboutSchema>
