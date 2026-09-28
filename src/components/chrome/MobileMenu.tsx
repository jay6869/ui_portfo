import { site } from '@/content/site'
import { useUI } from '@/stores/ui'
import { useSectionNav } from '@/engine/nav'
import { Dialog } from '@/components/primitives/Dialog'
import { LocalTime } from './LocalTime'
import { ThemeToggle } from './ThemeToggle'
import { SoundToggle } from './SoundToggle'
import s from './MobileMenu.module.css'

/** Full-screen menu (Radix Dialog) with staggered large serif links. */
export default function MobileMenu() {
  const open = useUI((st) => st.menuOpen)
  const setOpen = useUI((st) => st.setMenuOpen)
  const goTo = useSectionNav()

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Menu"
      hideTitle
      variant="fullscreen"
      className={s.menu}
    >
      <nav aria-label="Menu" className={s.nav}>
        <ul role="list" className={s.list}>
          {site.nav.map((item, i) => (
            <li key={item.id} style={{ ['--i' as string]: i }}>
              <a
                href={`/#${item.id}`}
                className={s.link}
                onClick={(e) => {
                  setOpen(false)
                  // Let the dialog release scroll-lock before scrolling
                  e.preventDefault()
                  window.setTimeout(() => goTo(item.id), 60)
                }}
              >
                <span className={`${s.index} mono`}>{item.index}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={s.footer}>
        <div className={s.row}>
          <p className="mono dim">
            {site.location.country} · <LocalTime />
          </p>
          <div className={s.toggles}>
            <ThemeToggle />
            <SoundToggle />
          </div>
        </div>
        <div className={s.row}>
          <a className="mono" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <a className="mono" href={site.cv.href} download>
            CV ↓
          </a>
        </div>
      </div>
    </Dialog>
  )
}
