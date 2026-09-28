import type { AboutContent } from './schema'

/**
 * About section. The bio is a first draft written from the facts you gave — anything marked
 * [EDIT ME] is a guess or a gap only you can fill.
 */
export const about = {
  bio: [
    "I'm Janith, a web developer from Sri Lanka. I'm in the third year of a BSc (Hons) in Information Technology at SLIIT, which mostly means I write code during the day and then more code at night, for fun, like a normal person.",
    'I care most about the front end: interfaces that feel solid, motion that has a reason to exist, and pages that still load fast on a cheap phone with one bar of signal. I got into this because [EDIT ME: the real reason — a site you saw, a game you modded, a teacher, boredom].',
    "Right now I'm looking for internships and freelance work where I can learn from people better than me and ship things that matter to someone. Away from the keyboard, [EDIT ME: one or two true things about you]. If you've read this far, we should probably talk.",
  ],
  facts: [
    { label: 'Based', value: 'Sri Lanka · GMT+5:30' },
    { label: 'Studying', value: 'SLIIT, BSc (Hons) IT, 3rd year' },
    { label: 'Focus', value: 'Front-end, motion, performance' },
    { label: 'Currently', value: '[PLACEHOLDER] What you are building or learning' },
  ],
  principles: [
    {
      title: 'Ship small, then improve',
      body: 'A working thing on Tuesday beats a perfect thing next month.',
    },
    {
      title: 'Details are the job',
      body: 'Focus states, empty states, the error nobody tested. That is where quality lives.',
    },
    {
      title: 'Fast by default',
      body: 'Every library has to earn its kilobytes. This site is a stress test of that rule.',
    },
    {
      title: 'Say it plainly',
      body: 'Clear updates, honest estimates, and I will tell you when I am stuck.',
    },
  ],
  /** Replace with { type: 'image', src, avif, webp, width, height, color, alt } when you have a photo. */
  portrait: { type: 'placeholder', alt: 'Portrait of Janith Godage (placeholder)' },
  map: {
    enabled: true,
    lat: 7.2,
    lng: 80.4,
    zoom: 7,
    label: 'Somewhere around here',
  },
} satisfies AboutContent
