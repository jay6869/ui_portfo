import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectRow } from './ProjectRow'
import { projects } from '@/content/projects'

const meta = {
  title: 'Primitives/ProjectRow',
  component: ProjectRow,
  args: { project: projects[0]!, index: 0 },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ul className="work-list" role="list" style={{ margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof ProjectRow>
export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}
export const List: Story = {
  render: () => (
    <>
      {projects.map((p, i) => (
        <ProjectRow key={p.slug} project={p} index={i} />
      ))}
    </>
  ),
}
