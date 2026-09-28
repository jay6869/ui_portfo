import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionHeading } from './SectionHeading'

const meta = {
  title: 'Primitives/SectionHeading',
  component: SectionHeading,
  args: {
    index: '01',
    label: 'Work',
    title: 'Selected *work*',
    kicker: 'A few things I have built. Some for other people, some for me.',
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SectionHeading>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithoutKicker: Story = {
  args: { index: '05', label: 'About', title: 'About, *briefly*', kicker: undefined },
}
