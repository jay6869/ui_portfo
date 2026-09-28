import type { Project } from './schema'

/**
 * Projects. Order here = order on the site. `featured: true` → flagship (shown first).
 *
 * These six are PLACEHOLDERS with realistic structure. Replace the text, set `status: 'real'`,
 * and swap `cover` for a real image when you have one:
 *
 *   cover: {
 *     type: 'image',
 *     src: '/work/my-project/cover-1600.webp',
 *     avif: '/work/my-project/cover-800.avif 800w, /work/my-project/cover-1600.avif 1600w',
 *     webp: '/work/my-project/cover-800.webp 800w, /work/my-project/cover-1600.webp 1600w',
 *     width: 1600, height: 1000, color: '#2b2622',
 *     alt: 'Describe what the screenshot shows',
 *   }
 */
export const projects: Project[] = [
  {
    slug: 'flagship-one',
    status: 'placeholder',
    featured: true,
    title: '[PLACEHOLDER] Flagship one',
    discipline: 'Web app',
    year: 2026,
    role: '[PLACEHOLDER] Front-end developer',
    duration: '[PLACEHOLDER] 3 months',
    stack: ['React', 'TypeScript', 'Zustand', 'Zod', 'React Hook Form', 'Vite', 'Cypress'],
    summary: '[PLACEHOLDER] One sentence: what it is, who it is for, and why it exists.',
    problem:
      '[PLACEHOLDER] What was broken, slow or missing before you showed up? Be specific about who felt the pain and how.',
    approach: [
      '[PLACEHOLDER] The first decision that mattered, and why you made it. Mention the constraint you were working around.',
      '[PLACEHOLDER] The detail you are quietly proud of. A state nobody asked for, a performance fix, an accessibility win.',
    ],
    outcome:
      '[PLACEHOLDER] What happened after launch. Real outcomes only — if you have no numbers, describe what people said or did.',
    hindsight:
      '[PLACEHOLDER] What you would do differently now. Honest and short reads better than a victory lap.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: {
      type: 'art',
      variant: 'orbit',
      seed: 11,
      alt: 'Abstract cover: concentric orbits with a clay point',
    },
    gallery: [
      {
        media: { type: 'art', variant: 'grid', seed: 12, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Screenshot caption — what should we notice?',
        wide: true,
      },
      {
        media: { type: 'art', variant: 'strata', seed: 13, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] A detail shot.',
      },
      {
        media: { type: 'art', variant: 'waves', seed: 14, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Another state of the interface.',
      },
    ],
  },
  {
    slug: 'flagship-two',
    status: 'placeholder',
    featured: true,
    title: '[PLACEHOLDER] Flagship two',
    discipline: 'Marketing site',
    year: 2025,
    role: '[PLACEHOLDER] Design & development',
    duration: '[PLACEHOLDER] 6 weeks',
    stack: ['React', 'GSAP', 'Locomotive', 'Three.js', 'Vite'],
    summary: '[PLACEHOLDER] One sentence: what it is, who it is for, and why it exists.',
    problem:
      '[PLACEHOLDER] What did the client or audience need that the old site could not give them?',
    approach: [
      '[PLACEHOLDER] How you structured the build, and the one trade-off you had to make.',
      '[PLACEHOLDER] Where the motion helped the story instead of decorating it.',
    ],
    outcome: '[PLACEHOLDER] What changed once it went live.',
    hindsight: '[PLACEHOLDER] What you would cut, simplify or do earlier next time.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: {
      type: 'art',
      variant: 'glyph',
      glyph: 'a',
      seed: 21,
      alt: 'Abstract cover: an oversized serif letter, cropped',
    },
    gallery: [
      {
        media: { type: 'art', variant: 'blocks', seed: 22, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Screenshot caption.',
        wide: true,
      },
      {
        media: { type: 'art', variant: 'orbit', seed: 23, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] A detail shot.',
      },
      {
        media: { type: 'art', variant: 'grid', seed: 24, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Mobile view.',
      },
    ],
  },
  {
    slug: 'flagship-three',
    status: 'placeholder',
    featured: true,
    title: '[PLACEHOLDER] Flagship three',
    discipline: 'Creative dev',
    year: 2025,
    role: '[PLACEHOLDER] Creative developer',
    duration: '[PLACEHOLDER] 4 weeks',
    stack: ['Three.js', 'GSAP', 'TypeScript', 'Vite', 'Tone.js'],
    summary: '[PLACEHOLDER] One sentence: what it is, who it is for, and why it exists.',
    problem: '[PLACEHOLDER] The creative brief, or the question you were trying to answer.',
    approach: [
      '[PLACEHOLDER] The technical idea that made it work.',
      '[PLACEHOLDER] How you kept it fast on normal hardware.',
    ],
    outcome: '[PLACEHOLDER] How people reacted, or what you learned.',
    hindsight: '[PLACEHOLDER] What you would change now.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: { type: 'art', variant: 'waves', seed: 31, alt: 'Abstract cover: stacked sine lines' },
    gallery: [
      {
        media: { type: 'art', variant: 'orbit', seed: 32, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Screenshot caption.',
        wide: true,
      },
      {
        media: {
          type: 'art',
          variant: 'glyph',
          glyph: 'g',
          seed: 33,
          alt: 'Abstract placeholder artwork',
        },
        caption: '[PLACEHOLDER] A detail shot.',
      },
      {
        media: { type: 'art', variant: 'strata', seed: 34, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Process sketch.',
      },
    ],
  },
  {
    slug: 'small-one',
    status: 'placeholder',
    featured: false,
    title: '[PLACEHOLDER] Small thing one',
    discipline: 'Tooling',
    year: 2025,
    role: '[PLACEHOLDER] Solo',
    duration: '[PLACEHOLDER] A weekend',
    stack: ['Node', 'TypeScript', 'Zod'],
    summary: '[PLACEHOLDER] A small tool that scratched your own itch.',
    problem: '[PLACEHOLDER] The annoying thing you kept doing by hand.',
    approach: ['[PLACEHOLDER] What you built and the one clever bit.'],
    outcome: '[PLACEHOLDER] Who uses it now (even if it is just you).',
    hindsight: '[PLACEHOLDER] What you would change.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: { type: 'art', variant: 'grid', seed: 41, alt: 'Abstract cover: a displaced dot grid' },
    gallery: [
      {
        media: { type: 'art', variant: 'blocks', seed: 42, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Screenshot caption.',
        wide: true,
      },
    ],
  },
  {
    slug: 'small-two',
    status: 'placeholder',
    featured: false,
    title: '[PLACEHOLDER] Small thing two',
    discipline: 'Experiment',
    year: 2024,
    role: '[PLACEHOLDER] Solo',
    duration: '[PLACEHOLDER] Two weeks',
    stack: ['p5.js', 'D3', 'TypeScript'],
    summary: '[PLACEHOLDER] An experiment you built to learn something.',
    problem: '[PLACEHOLDER] The thing you wanted to understand.',
    approach: ['[PLACEHOLDER] How you went about it.'],
    outcome: '[PLACEHOLDER] What you learned.',
    hindsight: '[PLACEHOLDER] What you would try next.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: {
      type: 'art',
      variant: 'strata',
      seed: 51,
      alt: 'Abstract cover: layered bands like sediment',
    },
    gallery: [
      {
        media: { type: 'art', variant: 'waves', seed: 52, alt: 'Abstract placeholder artwork' },
        caption: '[PLACEHOLDER] Screenshot caption.',
        wide: true,
      },
    ],
  },
  {
    slug: 'small-three',
    status: 'placeholder',
    featured: false,
    title: '[PLACEHOLDER] Small thing three',
    discipline: 'Component kit',
    year: 2024,
    role: '[PLACEHOLDER] Solo',
    duration: '[PLACEHOLDER] Ongoing',
    stack: ['React', 'Storybook', 'Radix UI', 'CSS Modules'],
    summary: '[PLACEHOLDER] A set of components you keep reusing.',
    problem: '[PLACEHOLDER] Why you needed it.',
    approach: ['[PLACEHOLDER] How it is put together.'],
    outcome: '[PLACEHOLDER] Where it has been used.',
    hindsight: '[PLACEHOLDER] What you would change.',
    pullQuote: '[PLACEHOLDER] The one key detail, in a single sentence.',
    links: {},
    cover: {
      type: 'art',
      variant: 'blocks',
      seed: 61,
      alt: 'Abstract cover: overlapping rectangles',
    },
    gallery: [
      {
        media: {
          type: 'art',
          variant: 'glyph',
          glyph: 'J',
          seed: 62,
          alt: 'Abstract placeholder artwork',
        },
        caption: '[PLACEHOLDER] Screenshot caption.',
        wide: true,
      },
    ],
  },
]

export function getProject(slug: string | undefined) {
  return projects.find((p) => p.slug === slug)
}

export function getNextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug)
  return projects[(i + 1) % projects.length]!
}
