import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { site } from '@/content/site'
import s from './Lab.module.css'

const TARGET = Array.from(site.firstName.toUpperCase())

/** Deterministic "shuffle" for first render (server = client), random after that. */
const initial = () => {
  const a = TARGET.map((c, i) => ({ id: `${c}${i}`, c }))
  return [a[3], a[0], a[5], a[1], a[4], a[2]].filter(Boolean) as typeof a
}
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Drag the letters back into order (Sortable.js). Sortable mutates the DOM, React owns it — so
 * on drop we revert Sortable's move and apply the new order through state. Keyboard: focus a
 * tile, then ← / → to move it.
 */
export default function SortSpecimen({
  shuffleSignal,
  enhance,
}: {
  shuffleSignal: number
  enhance: boolean
}) {
  const list = useRef<HTMLOListElement>(null)
  const [tiles, setTiles] = useState(initial)
  const [announce, setAnnounce] = useState('')
  const solved = tiles.map((t) => t.c).join('') === TARGET.join('')

  useEffect(() => {
    if (shuffleSignal) setTiles((t) => shuffle(t))
  }, [shuffleSignal])

  useEffect(() => {
    const el = list.current
    if (!el || !enhance) return
    let sortable: { destroy: () => void } | null = null
    let cancelled = false
    void import('sortablejs').then(({ default: Sortable }) => {
      if (cancelled) return
      sortable = Sortable.create(el, {
        animation: 260,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        ghostClass: s.ghost,
        chosenClass: s.chosen,
        onEnd: (evt) => {
          const { oldIndex, newIndex, item, from } = evt
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
          // Undo Sortable's DOM move; React re-renders the new order
          from.removeChild(item)
          from.insertBefore(item, from.children[oldIndex] ?? null)
          setTiles((prev) => {
            const next = [...prev]
            const [moved] = next.splice(oldIndex, 1)
            next.splice(newIndex, 0, moved!)
            return next
          })
        },
      })
    })
    return () => {
      cancelled = true
      sortable?.destroy()
    }
  }, [enhance])

  const move = (i: number, dir: -1 | 1, e: KeyboardEvent<HTMLButtonElement>) => {
    const j = i + dir
    if (j < 0 || j >= tiles.length) return
    e.preventDefault()
    const next = [...tiles]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    setTiles(next)
    setAnnounce(`${next[j]!.c} moved to position ${j + 1}`)
    requestAnimationFrame(() => list.current?.querySelectorAll('button')[j]?.focus())
  }

  return (
    <div className={s.specimen}>
      <ol
        ref={list}
        className={s.tiles}
        role="list"
        aria-label="Letters, drag or use arrow keys to reorder"
      >
        {tiles.map((t, i) => (
          <li key={t.id} className={s.tileItem}>
            <button
              type="button"
              className={s.tile}
              data-italic={i % 2 === 1}
              data-cursor="drag"
              data-cursor-label="Drag"
              aria-label={`${t.c}, position ${i + 1} of ${tiles.length}`}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') move(i, -1, e)
                if (e.key === 'ArrowRight') move(i, 1, e)
              }}
            >
              {t.c}
            </button>
          </li>
        ))}
      </ol>
      <p className={`${s.specimenNote} mono`} aria-live="polite">
        {solved
          ? 'Correct. As promised, there is no prize.'
          : announce || 'Drag, or focus a letter and use ← →'}
      </p>
    </div>
  )
}
