import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LazyMotion, MotionConfig } from 'framer-motion'
import { useEngine } from '@/engine/useEngine'
import { useRouteTransition } from '@/engine/transition'
import { useSoundLayer } from '@/lib/sound'
import { SkipLink } from '@/components/chrome/SkipLink'
import { Cursor } from '@/components/chrome/Cursor'
import { PageTransition } from '@/components/chrome/PageTransition'
import { Toaster } from '@/components/primitives/Toast'
import { Header } from '@/components/chrome/Header'
import { Hud } from '@/components/chrome/Hud'
import Home from '@/routes/Home'
import CaseStudy from '@/routes/CaseStudy'
import NotFound from '@/routes/NotFound'
import { SharedCover } from '@/components/chrome/SharedCover'

const loadFeatures = () => import('@/engine/motion-features').then((m) => m.default)
const EngineScratch = import.meta.env.DEV ? lazy(() => import('@/routes/EngineScratch')) : null

export function App() {
  useEngine()
  useSoundLayer()
  const { display, phase, title, onCovered, onRevealed } = useRouteTransition()

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <Header />
        <Hud routeKey={display.pathname} />
        <main id="main" tabIndex={-1}>
          <Routes location={display}>
            <Route path="/" element={<Home />} />
            {EngineScratch && (
              <Route
                path="/__engine/*"
                element={
                  <Suspense fallback={null}>
                    <EngineScratch />
                  </Suspense>
                }
              />
            )}
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SharedCover />
        <PageTransition phase={phase} title={title} onCovered={onCovered} onRevealed={onRevealed} />
        <Toaster />
        <Cursor />
      </MotionConfig>
    </LazyMotion>
  )
}
