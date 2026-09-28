import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { ArrowUpRight, DownloadIcon } from './Icons'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { label: 'Write to me', variant: 'primary', size: 'm' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'quiet'] },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
  },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { icon: <ArrowUpRight /> } }
export const Ghost: Story = {
  args: { variant: 'ghost', label: 'Download CV', icon: <DownloadIcon /> },
}
export const Quiet: Story = { args: { variant: 'quiet', label: 'Back to top' } }
export const Large: Story = { args: { size: 'l', magnetic: true, icon: <ArrowUpRight /> } }
export const Loading: Story = { args: { loading: true, label: 'Sending' } }
export const AsLink: Story = {
  args: { href: 'https://github.com/jay6869', target: '_blank', label: 'GitHub' },
}
