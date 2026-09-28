import * as Toggle from '@radix-ui/react-toggle'
import { useUI } from '@/stores/ui'
import { setSoundEnabled } from '@/lib/sound'
import { SoundIcon } from '@/components/primitives/Icons'
import s from './IconButton.module.css'

export function SoundToggle({ className }: { className?: string }) {
  const on = useUI((st) => st.sound)
  return (
    <Toggle.Root
      className={`${s.iconButton} ${className ?? ''}`}
      pressed={on}
      onPressedChange={(p) => void setSoundEnabled(p)}
      aria-label="Interface sound"
      title="Interface sound (S)"
    >
      <SoundIcon size={18} on={on} />
      <span className={s.eq} data-on={on} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </Toggle.Root>
  )
}
