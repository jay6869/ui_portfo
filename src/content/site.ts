import type { SiteContent } from './schema'

/**
 * Site-wide copy and facts. Edit freely — components never hard-code text.
 * Strings containing [PLACEHOLDER] or [EDIT ME] render as visible tags until you replace them.
 */
export const site = {
  name: 'Janith Godage',
  firstName: 'Janith',
  monogram: 'JG',
  role: 'Web developer — front-end & creative development',
  eyebrow: 'Web developer · Front-end & creative development',
  intro:
    'I build fast, careful websites. I like the fiddly bits most people skip: the easing curve, the focus ring, the thing that is two pixels off.',

  location: {
    country: 'Sri Lanka',
    timezone: 'Asia/Colombo',
    offsetLabel: 'GMT+5:30',
  },
  education: {
    degree: 'BSc (Hons) Information Technology',
    short: 'BSc (Hons) IT',
    school: 'SLIIT',
    year: '3rd year',
  },
  email: 'janithzgodage@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jay6869', handle: '@jay6869' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/janith-godage-6953s/',
      handle: 'janith-godage',
    },
  ],
  cv: { href: '/janith-godage-web-cv.pdf', label: 'Download CV', placeholder: true },
  /** Where this site's source lives (used for the Lab "view source" links). */
  repo: { url: 'https://github.com/jay6869/portfolio', placeholder: true },

  /** Flip `open` to false and the hero pill switches to `closedLabel`. */
  availability: {
    open: true,
    label: 'Open to internships & freelance',
    closedLabel: 'Busy for now — say hi anyway',
  },

  seo: {
    title: 'Janith Godage — Web developer, front-end & creative development',
    description:
      'Janith Godage is a web developer in Sri Lanka building fast, accessible, carefully animated websites. Front-end, motion and performance.',
    siteUrl: import.meta.env.VITE_SITE_URL || 'https://janithgodage.dev',
    ogImage: '/og.png',
    locale: 'en_GB',
  },

  nav: [
    { id: 'work', label: 'Work', index: '01' },
    { id: 'about', label: 'About', index: '05' },
    { id: 'lab', label: 'Lab', index: '04' },
    { id: 'contact', label: 'Contact', index: '06' },
  ],

  hero: {
    facts: ['Sri Lanka', 'GMT+5:30', 'SLIIT, 3rd year'],
    scrollLabel: 'Scroll',
  },

  /** Section headings. `*word*` renders as the italic clay accent (one per headline). */
  sections: {
    work: {
      index: '01',
      label: 'Work',
      title: 'Selected *work*',
      kicker:
        'A few things I have built. Some for other people, some for me, all of them finished. Mostly.',
    },
    services: {
      index: '02',
      label: 'What I do',
      title: 'What I *do*',
      kicker: 'Four things I am reasonably good at, and still getting better at.',
    },
    stack: {
      index: '03',
      label: 'Stack',
      title: 'Stack, in *practice*',
      kicker:
        'No skill bars, no percentages. Point at a tool to see which projects actually used it.',
    },
    lab: {
      index: '04',
      label: 'Lab',
      title: 'The *lab*',
      kicker: 'Small experiments. None of them are useful. All of them were fun to make.',
    },
    about: {
      index: '05',
      label: 'About',
      title: 'About, *briefly*',
    },
    contact: {
      index: '06',
      label: 'Contact',
      title: "Let's build *something*.",
    },
  },

  preloader: { lines: ['loading fonts', 'warming up', 'ready'] },

  contact: {
    headline: "Let's build *something*.",
    lede: 'An internship, a freelance project, or a question about GSAP. I read everything that lands in my inbox.',
    cta: 'Write to me',
    copyToast: 'Copied. Talk soon.',
    form: {
      success: "Sent. Thanks for writing — I'll get back to you soon.",
      error: "That didn't send. Try again, or email me directly.",
      mailtoNote: 'This opens your email app with the message filled in.',
    },
  },

  footer: { madeWith: 'Made with React, GSAP & too much coffee.', year: 2026 },

  notFound: {
    title: 'Well, *this* is awkward.',
    body: "This page doesn't exist, or I broke it. Probably the first one.",
    cta: 'Take me home',
  },
} satisfies SiteContent

export type Site = typeof site
