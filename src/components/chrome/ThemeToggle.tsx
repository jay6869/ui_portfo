import * as Toggle from '@radix-ui/react-toggle'
import { useUI } from '@/stores/ui'
import { toggleTheme } from '@/lib/theme'
import { ThemeIcon } from '@/components/primitives/Icons'
import s from './IconButton.module.css'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUI((st) => st.theme)
  const paper = theme === 'paper'
  return (
    <Toggle.Root
      className={`${s.iconButton} ${className ?? ''}`}
      pressed={paper}
      onPressedChange={() => undefined}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={`Paper theme (currently ${paper ? 'on' : 'off'})`}
      title="Toggle theme (T)"
    >
      <ThemeIcon size={18} className={s.themeIcon} />
    </Toggle.Root>
  )
}
