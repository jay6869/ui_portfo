import { useEffect } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useUI, type Toast as ToastT } from '@/stores/ui'
import { EASE } from '@/engine/ease'
import s from './Toast.module.css'

/** Custom toasts (no SweetAlert). Announced politely through an aria-live region. */
export function Toaster() {
  const toasts = useUI((st) => st.toasts)
  return (
    <div className={s.region} role="status" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast }: { toast: ToastT }) {
  const dismiss = useUI((st) => st.dismissToast)
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), 3200)
    return () => window.clearTimeout(id)
  }, [toast.id, dismiss])

  return (
    <m.div
      layout
      className={s.toast}
      data-tone={toast.tone}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: EASE.out }}
    >
      <span className={s.dot} aria-hidden="true" />
      <span>{toast.message}</span>
    </m.div>
  )
}
