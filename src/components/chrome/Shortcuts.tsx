import { useUI } from '@/stores/ui'
import { shortcutList } from '@/engine/keys'
import { Dialog } from '@/components/primitives/Dialog'
import s from './Shortcuts.module.css'

/** The "secret" menu. It's keyboard shortcuts. Sorry. */
export default function Shortcuts() {
  const open = useUI((st) => st.shortcutsOpen)
  const setOpen = useUI((st) => st.setShortcutsOpen)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Keyboard shortcuts"
      hideTitle
      className={s.sheet}
    >
      <p className={`${s.kicker} mono`}>Secret menu</p>
      <h2 className={s.title}>
        You found it. It&rsquo;s just <em className="accent">keyboard shortcuts</em>. Sorry.
      </h2>
      <dl className={s.list}>
        {shortcutList.map((sc) => (
          <div key={sc.label} className={s.row}>
            <dt className={s.keys}>
              {sc.keys.map((k, i) =>
                k === '–' ? (
                  <span key={i} className="dim">
                    –
                  </span>
                ) : (
                  <kbd key={i} className="mono">
                    {k}
                  </kbd>
                ),
              )}
            </dt>
            <dd>{sc.label}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  )
}
