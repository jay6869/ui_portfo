import type { Meta, StoryObj } from '@storybook/react-vite'
import { Marquee } from './Marquee'

const words = [
  'React',
  'TypeScript',
  'GSAP',
  'Three.js',
  'Framer Motion',
  'Vite',
  'Node',
  'Zustand',
]

const meta = {
  title: 'Primitives/Marquee',
  component: Marquee,
  args: {
    label: 'Tools I use',
    duration: 30,
    items: words.map((w, i) => (
      <span
        key={w}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--step-4)',
          fontStyle: i % 2 ? 'italic' : 'normal',
        }}
      >
        {w}
      </span>
    )),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Marquee>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Slow: Story = { args: { duration: 80 } }
