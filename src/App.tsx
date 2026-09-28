import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LazyMotion, MotionConfig } from 'framer-motion'
import { useEngine } from '@/engine/useEngine'
import { useSectionNav } from '@/engine/nav'
import { useGlobalKeys } from '@/engine/keys'
import { useUI } from '@/stores/ui'
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
import { Footer } from '@/components/chrome/Footer'
import { Preloader } from '@/components/chrome/Preloader'

const loadFeatures = () => import('@/engine/motion-features').then((m) => m.default)
const CommandPalette = lazy(() => import('@/components/chrome/CommandPalette'))
const Shortcuts = lazy(() => import('@/components/chrome/Shortcuts'))
const DevBanner = import.meta.env.DEV ? lazy(() => import('@/components/chrome/DevBanner')) : null
const EngineScratch = import.meta.env.DEV ? lazy(() => import('@/routes/EngineScratch')) : null

export function App() {
  useEngine()
  useSoundLayer()
  const { display, phase, title, onCovered, onRevealed } = useRouteTransition()
  const goTo = useSectionNav()
  useGlobalKeys(goTo)
  const paletteOpen = useUI((st) => st.paletteOpen)
  const shortcutsOpen = useUI((st) => st.shortcutsOpen)
  const [paletteLoaded, setPaletteLoaded] = useState(false)
  const [shortcutsLoaded, setShortcutsLoaded] = useState(false)
  useEffect(() => {
    if (paletteOpen) setPaletteLoaded(true)
  }, [paletteOpen])
  useEffect(() => {
    if (shortcutsOpen) setShortcutsLoaded(true)
  }, [shortcutsOpen])
  // Warm the dialog chunks when the browser is idle so ⌘K opens instantly
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500))
    idle(() => {
      void import('@/components/chrome/CommandPalette')
    })
  }, [])

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
        <Footer />
        <SharedCover />
        <PageTransition phase={phase} title={title} onCovered={onCovered} onRevealed={onRevealed} />
        <Toaster />
        {paletteLoaded ? (
          <Suspense fallback={null}>
            <CommandPalette />
          </Suspense>
        ) : null}
        {shortcutsLoaded ? (
          <Suspense fallback={null}>
            <Shortcuts />
          </Suspense>
        ) : null}
        {DevBanner ? (
          <Suspense fallback={null}>
            <DevBanner />
          </Suspense>
        ) : null}
        <Preloader />
        <Cursor />
      </MotionConfig>
    </LazyMotion>
  )
}
