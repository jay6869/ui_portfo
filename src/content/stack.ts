import type { StackContent } from './schema'

/**
 * Tools, grouped by layer. Drives the marquee and the "Stack, in practice" visual.
 * Tool names must match the strings used in projects.ts `stack` for the highlight to work.
 */
export const stack = {
  layers: [
    {
      id: 'ui',
      label: 'Interface',
      tools: ['React', 'TypeScript', 'CSS Modules', 'Radix UI', 'Swiper'],
    },
    {
      id: 'motion',
      label: 'Motion',
      tools: ['GSAP', 'Framer Motion', 'Three.js', 'Locomotive', 'p5.js', 'Tone.js'],
    },
    { id: 'state', label: 'State', tools: ['Zustand', 'Immer', 'React Hook Form'] },
    { id: 'data', label: 'Data', tools: ['Zod', 'D3', 'Node'] },
    { id: 'tooling', label: 'Tooling', tools: ['Vite', 'Storybook', 'Cypress', 'ESLint'] },
  ],
  marquee: [
    'React',
    'TypeScript',
    'GSAP',
    'Three.js',
    'Framer Motion',
    'Vite',
    'Node',
    'Zustand',
    'D3',
    'Zod',
    'Storybook',
    'Tone.js',
  ],
} satisfies StackContent
