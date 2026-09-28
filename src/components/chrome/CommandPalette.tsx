import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { site } from '@/content/site'
import { projects } from '@/content/projects'
import { useUI } from '@/stores/ui'
import { useSectionNav } from '@/engine/nav'
import { toggleTheme } from '@/lib/theme'
import { setSoundEnabled } from '@/lib/sound'
import { copyText } from '@/lib/clipboard'
import { stripTokens } from '@/lib/text'
import { Dialog } from '@/components/primitives/Dialog'
import { ArrowRight, ArrowUpRight, SearchIcon } from '@/components/primitives/Icons'
import s from './CommandPalette.module.css'

interface Command {
  id: string
  group: 'Go to' | 'Projects' | 'Actions' | 'Elsewhere'
  label: string
  hint?: string
  external?: boolean
  run: () => void
}

/**
 * ⌘K palette. Radix Dialog handles focus trap/Esc/scroll lock; the list follows the ARIA
 * combobox + listbox pattern (aria-activedescendant), so focus never leaves the input.
 */
export default function CommandPalette() {
  const open = useUI((st) => st.paletteOpen)
  const setOpen = useUI((st) => st.setPaletteOpen)
  const toast = useUI((st) => st.toast)
  const sound = useUI((st) => st.sound)
  const theme = useUI((st) => st.theme)
  const navigate = useNavigate()
  const goTo = useSectionNav()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(() => {
    const close = (fn: () => void) => () => {
      setOpen(false)
      window.setTimeout(fn, 60)
    }
    const sections: Array<[string, string]> = [
      ['work', 'Work'],
      ['services', 'What I do'],
      ['stack', 'Stack'],
      ['lab', 'Lab'],
      ['about', 'About'],
      ['contact', 'Contact'],
    ]
    return [
      ...sections.map(([id, label], i) => ({
        id: `go-${id}`,
        group: 'Go to' as const,
        label,
        hint: String(i + 1),
        run: close(() => goTo(id)),
      })),
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        group: 'Projects' as const,
        label: stripTokens(p.title),
        hint: `${p.discipline} · ${p.year}`,
        run: close(() => navigate(`/work/${p.slug}`)),
      })),
      {
        id: 'theme',
        group: 'Actions',
        label: `Switch to ${theme === 'paper' ? 'charcoal' : 'paper'} theme`,
        hint: 'T',
        run: close(() => toggleTheme()),
      },
      {
        id: 'sound',
        group: 'Actions',
        label: `Turn sound ${sound ? 'off' : 'on'}`,
        hint: 'S',
        run: () => void setSoundEnabled(!sound),
      },
      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy email address',
        hint: site.email,
        run: close(async () => {
          const ok = await copyText(site.email)
          toast(ok ? site.contact.copyToast : site.email, ok ? 'success' : 'default')
        }),
      },
      {
        id: 'cv',
        group: 'Actions',
        label: 'Download CV',
        hint: 'PDF',
        run: close(() => {
          const a = document.createElement('a')
          a.href = site.cv.href
          a.download = ''
          a.click()
        }),
      },
      ...site.socials.map((x) => ({
        id: `x-${x.label}`,
        group: 'Elsewhere' as const,
        label: x.label,
        hint: x.handle,
        external: true,
        run: close(() => window.open(x.href, '_blank', 'noopener')),
      })),
      {
        id: 'x-email',
        group: 'Elsewhere',
        label: 'Email',
        hint: site.email,
        run: close(() => (window.location.href = `mailto:${site.email}`)),
      },
    ]
  }, [goTo, navigate, setOpen, sound, theme, toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    if (open) setQuery('')
  }, [open])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const groups = ['Go to', 'Projects', 'Actions', 'Elsewhere'] as const
  const optionId = (i: number) => `${listId}-opt-${i}`

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      hideTitle
      className={s.palette}
      showClose={false}
    >
      <div className={s.search}>
        <SearchIcon size={18} />
        <input
          className={s.input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={filtered.length ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-label="Search commands"
          placeholder="Where to? Try “lab” or “theme”"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => (a + 1) % Math.max(filtered.length, 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => (a - 1 + filtered.length) % Math.max(filtered.length, 1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              filtered[active]?.run()
            }
          }}
        />
        <kbd className={`${s.esc} mono`}>Esc</kbd>
      </div>
      <ul id={listId} ref={listRef} role="listbox" aria-label="Commands" className={s.list}>
        {filtered.length === 0 ? (
          <li className={`${s.empty} dim`} role="presentation">
            Nothing matches “{query}”. Not even close.
          </li>
        ) : null}
        {groups.map((g) => {
          const items = filtered.map((c, i) => ({ c, i })).filter(({ c }) => c.group === g)
          if (!items.length) return null
          return (
            <li key={g} role="presentation">
              <p className={`${s.group} mono dim`} aria-hidden="true">
                {g}
              </p>
              <ul role="group" aria-label={g} className={s.groupList}>
                {items.map(({ c, i }) => (
                  // Keyboard is handled by the combobox input (aria-activedescendant pattern)
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={c.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    className={s.option}
                    onPointerMove={() => setActive(i)}
                    onClick={() => c.run()}
                  >
                    <span>{c.label}</span>
                    <span className={`${s.hint} mono`}>{c.hint}</span>
                    {c.external ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowRight size={14} className={s.go} />
                    )}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <p className={`${s.footer} mono dim`}>
        <span>↑↓ move</span> <span>↵ open</span> <span>Esc close</span>
      </p>
    </Dialog>
  )
}
