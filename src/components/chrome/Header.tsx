import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/content/site'
import { useUI } from '@/stores/ui'
import { useSectionNav } from '@/engine/nav'
import { ScrollTrigger } from '@/engine/gsap'
import { TextRoll } from '@/components/primitives/TextRoll'
import { LocalTime } from './LocalTime'
import { ThemeToggle } from './ThemeToggle'
import { SoundToggle } from './SoundToggle'
import s from './Header.module.css'

const MobileMenu = lazy(() => import('./MobileMenu'))

/** Minimal header: monogram · live time · nav + toggles. Hides on scroll down, returns on up. */
export function Header() {
  const ref = useRef<HTMLElement>(null)
  const goTo = useSectionNav()
  const menuOpen = useUI((st) => st.menuOpen)
  const setMenuOpen = useUI((st) => st.setMenuOpen)
  const [menuLoaded, setMenuLoaded] = useState(false)
  const setPaletteOpen = useUI((st) => st.setPaletteOpen)
  const [mod, setMod] = useState('⌘')

  useEffect(() => {
    setMod(/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl ')
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll()
        el.dataset.scrolled = y > 40 ? 'true' : 'false'
        // Hide only when scrolling down past the first screen-ish; never while something inside has focus
        const hide = self.direction === 1 && y > 240 && !el.contains(document.activeElement)
        el.dataset.hidden = hide ? 'true' : 'false'
      },
      // Route changes jump the scroll position without a scroll event; refresh runs after them.
      onRefresh: (self) => {
        el.dataset.scrolled = self.scroll() > 40 ? 'true' : 'false'
        el.dataset.hidden = 'false'
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    if (menuOpen) setMenuLoaded(true)
  }, [menuOpen])

  return (
    <header ref={ref} className={s.header} data-hidden="false" data-scrolled="false">
      {/* Accessible name starts with the visible "JG" (label-in-name, for voice control) */}
      <Link to="/" className={s.mark} onClick={(e) => goTo('top', e)}>
        <em>{site.monogram.slice(0, 1)}</em>
        {site.monogram.slice(1)}
        <span className="sr-only"> — {site.name}, home</span>
      </Link>

      <p className={`${s.clock} mono`}>
        <span className={s.dot} aria-hidden="true" />
        <span>{site.location.country}</span>
        <LocalTime className={s.time} seconds />
        <span className="dim">{site.location.offsetLabel}</span>
      </p>

      <nav className={s.nav} aria-label="Primary">
        <ul role="list" className={s.links}>
          {site.nav.map((item) => (
            <li key={item.id}>
              <a
                href={`/#${item.id}`}
                className={`${s.link} mono`}
                onClick={(e) => goTo(item.id, e)}
              >
                <TextRoll text={item.label} mode="chars" />
              </a>
            </li>
          ))}
        </ul>
        <div className={s.tools}>
          <button
            type="button"
            className={`${s.kbd} mono`}
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            title="Command palette"
          >
            <kbd>{mod}K</kbd>
          </button>
          <ThemeToggle />
          <SoundToggle />
          <a className={`${s.cv} mono`} href={site.cv.href} download>
            <TextRoll text="CV" />
            <span className={s.cvArrow} aria-hidden="true">
              ↓
            </span>
            <span className="sr-only"> (PDF)</span>
          </a>
        </div>
        <button
          type="button"
          className={`${s.menuButton} mono`}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          onPointerEnter={() => void import('./MobileMenu')}
        >
          <TextRoll text="Menu" />
          <span className={s.burger} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </nav>

      {menuLoaded ? (
        <Suspense fallback={null}>
          <MobileMenu />
        </Suspense>
      ) : null}
    </header>
  )
}
