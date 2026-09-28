import { memo, Suspense, type ReactNode } from 'react'
import { Hero } from '@/components/sections/Hero'
import { StackMarquee } from '@/components/sections/StackMarquee'
import { Work } from '@/components/sections/work/Work'
import { Services } from '@/components/sections/Services'
import { StackViz } from '@/components/sections/stack/StackViz'
import { Lab } from '@/components/sections/Lab'
import { About } from '@/components/sections/about/About'
import { Contact } from '@/components/sections/contact/Contact'
import { Seo } from '@/components/chrome/Seo'

/**
 * Each section is its own Suspense boundary. Nothing here suspends — the boundaries exist so
 * React 18 hydrates the prerendered page section by section in separate tasks (selective
 * hydration) instead of one long main-thread block.
 */
const Island = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
)

/** Memoised: parent re-renders must never reach islands that are still hydrating. */
export default memo(function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <Island>
        <StackMarquee />
      </Island>
      <Island>
        <Work />
      </Island>
      <Island>
        <Services />
      </Island>
      <Island>
        <StackViz />
      </Island>
      <Island>
        <Lab />
      </Island>
      <Island>
        <About />
      </Island>
      <Island>
        <Contact />
      </Island>
    </>
  )
})
