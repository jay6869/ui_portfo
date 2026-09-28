import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { App } from './App'

export { validateContent } from './content/validate'
export { projects } from './content/projects'
export { site } from './content/site'

export interface Rendered {
  html: string
  head: string
}

/**
 * Render one route to HTML + its <head> tags.
 *
 * renderToString, not renderToPipeableStream: nothing in the prerendered tree suspends (every
 * lazy chunk mounts client-side only), and React 18.3's streaming encoder occasionally wrote a
 * NUL byte when a multi-byte character straddled its internal buffer boundary.
 */
export function render(url: string): Promise<Rendered> {
  const ctx: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={ctx}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
  )
  const h = ctx.helmet
  const head = h
    ? [h.title, h.meta, h.link, h.script].map((part) => part.toString()).join('\n    ')
    : ''
  return Promise.resolve({ html, head })
}
