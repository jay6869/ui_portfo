import { Hero } from '@/components/sections/Hero'
import { StackMarquee } from '@/components/sections/StackMarquee'
import { Work } from '@/components/sections/work/Work'
import { Seo } from '@/components/chrome/Seo'

export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <StackMarquee />
      <Work />
    </>
  )
}
