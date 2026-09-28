import type { ReactNode } from 'react'
import * as RD from '@radix-ui/react-dialog'
import { cx } from '@/lib/text'
import { CloseIcon } from './Icons'
import s from './Dialog.module.css'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Hide the title visually (still announced). */
  hideTitle?: boolean
  description?: string
  variant?: 'panel' | 'fullscreen'
  children: ReactNode
  className?: string
  showClose?: boolean
}

/** Radix Dialog with site styling: focus trap, Esc, scroll lock, aria wiring for free. */
export function Dialog({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  variant = 'panel',
  children,
  className,
  showClose = true,
}: Props) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className={cx(s.overlay, s[`overlay-${variant}`])} />
        <RD.Content
          className={cx(s.content, s[variant], className)}
          data-lenis-prevent
          // Radix warns without a Description unless aria-describedby is explicitly undefined
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <RD.Title className={hideTitle ? 'sr-only' : s.title}>{title}</RD.Title>
          {description ? <RD.Description className="sr-only">{description}</RD.Description> : null}
          {children}
          {showClose ? (
            <RD.Close className={s.close} aria-label="Close">
              <CloseIcon size={18} />
            </RD.Close>
          ) : null}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  )
}
