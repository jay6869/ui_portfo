import { Hero } from '@/components/sections/Hero'
import { StackMarquee } from '@/components/sections/StackMarquee'
import { Work } from '@/components/sections/work/Work'
import { Services } from '@/components/sections/Services'
import { StackViz } from '@/components/sections/stack/StackViz'
import { Lab } from '@/components/sections/Lab'
import { Seo } from '@/components/chrome/Seo'

export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <StackMarquee />
      <Work />
      <Services />
      <StackViz />
      <Lab />
    </>
  )
}
