import type { Service } from './schema'

/** "What I do" cards. `emphasis` must be a word inside `title` — it becomes the italic accent. */
export const services = [
  {
    id: 'interface',
    title: 'Interface engineering',
    emphasis: 'Interface',
    body: 'I turn designs into components that hold up: real states, real data, real edge cases. Typed, tested, and boring in the good way.',
    tools: ['React', 'TypeScript', 'CSS Modules', 'Radix UI', 'Storybook'],
  },
  {
    id: 'motion',
    title: 'Motion & interaction',
    emphasis: 'Motion',
    body: 'Animation that explains something or feels good under your thumb. If it does neither, I take it out.',
    tools: ['GSAP', 'Framer Motion', 'Three.js', 'Locomotive'],
  },
  {
    id: 'performance',
    title: 'Performance & accessibility',
    emphasis: 'accessibility',
    body: 'Fast on a cheap phone, usable with only a keyboard, clear to a screen reader. I measure it instead of hoping.',
    tools: ['Lighthouse', 'axe', 'Vite', 'Web Vitals'],
  },
  {
    id: 'fullstack',
    title: 'Full-stack builds',
    emphasis: 'Full-stack',
    body: 'When a project needs a server, I can build a sensible one: APIs, validation, forms that actually send, and deploys that do not scare me.',
    tools: ['Node', 'Zod', 'React Hook Form', 'Vercel'],
  },
] satisfies Service[]
