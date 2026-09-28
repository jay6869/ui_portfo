import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { EASE, cubicBezier } from './ease'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  gsap.registerEase('workshop', cubicBezier(...EASE.out))
  gsap.registerEase('snap', cubicBezier(...EASE.snap))
  gsap.registerEase('wipe', cubicBezier(...EASE.inout))
  gsap.defaults({ ease: 'workshop', duration: 0.9 })
  // Lenis drives time through gsap.ticker; lag smoothing would make scroll feel rubbery.
  gsap.ticker.lagSmoothing(0)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger, useGSAP }
