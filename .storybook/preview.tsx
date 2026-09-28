import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { LazyMotion, domMax } from 'framer-motion'
import '../src/styles/global.css'
import '../src/engine/gsap'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Site theme',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'charcoal', title: 'Charcoal' },
          { value: 'paper', title: 'Paper' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'charcoal' },
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i } },
  },
  decorators: [
    (Story, ctx) => {
      document.documentElement.dataset.theme = ctx.globals.theme as string
      return (
        <MemoryRouter>
          <LazyMotion features={domMax} strict>
            <div
              style={{
                minHeight: '60vh',
                padding: 24,
                background: 'var(--bg)',
                color: 'var(--fg)',
              }}
            >
              <Story />
            </div>
          </LazyMotion>
        </MemoryRouter>
      )
    },
  ],
}
export default preview
