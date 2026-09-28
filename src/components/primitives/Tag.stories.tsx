import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'

const meta = {
  title: 'Primitives/Tag',
  component: Tag,
  args: { children: 'Web app', tone: 'default' },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'accent', 'placeholder'] } },
} satisfies Meta<typeof Tag>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Accent: Story = { args: { tone: 'accent', children: 'Available' } }
export const Placeholder: Story = { args: { tone: 'placeholder', children: 'Placeholder' } }
