import type { Meta, StoryObj } from '@storybook/react-vite'
import { Magnetic } from './Magnetic'
import { Button } from './Button'

const meta = {
  title: 'Primitives/Magnetic',
  component: Magnetic,
  args: { strength: 0.35, innerStrength: 0.15, padding: 24, children: null },
  argTypes: {
    strength: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    innerStrength: { control: { type: 'range', min: 0, max: 0.6, step: 0.05 } },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Magnetic>
export default meta
type Story = StoryObj<typeof meta>

export const AroundAButton: Story = {
  render: (args) => (
    <div style={{ padding: 80 }}>
      <Magnetic {...args}>
        <Button label="Pull me" size="l" />
      </Magnetic>
    </div>
  ),
}
