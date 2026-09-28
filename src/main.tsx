import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import '@/styles/global.css'
import { App } from './App'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)

if (import.meta.env.DEV) {
  void import('./stores/ui').then(
    ({ useUI }) => ((window as unknown as { __ui: unknown }).__ui = useUI),
  )
  void import('./content/validate').then(({ validateContent }) => {
    const errors = validateContent()
    if (errors.length) console.error(`Content validation failed:\n${errors.join('\n')}`)
  })
}
