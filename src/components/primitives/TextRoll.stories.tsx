import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextRoll } from './TextRoll'

const meta = {
  title: 'Primitives/TextRoll',
  component: TextRoll,
  args: { text: 'About', mode: 'chars' },
  argTypes: { mode: { control: 'inline-radio', options: ['chars', 'whole'] } },
  render: (args) => (
    <a href="#roll" style={{ fontSize: 'var(--step-3)', fontFamily: 'var(--font-display)' }}>
      <TextRoll {...args} />
    </a>
  ),
} satisfies Meta<typeof TextRoll>
export default meta
type Story = StoryObj<typeof meta>

export const Chars: Story = {}
export const Whole: Story = { args: { mode: 'whole', text: 'Download CV' } }
