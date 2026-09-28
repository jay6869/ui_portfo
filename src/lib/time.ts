import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export function formatTime(tz: string, withSeconds = false): string {
  return dayjs()
    .tz(tz)
    .format(withSeconds ? 'HH:mm:ss' : 'HH:mm')
}

/** Hours between the visitor and `tz`, e.g. "+3.5h" or "same time". */
export function offsetFromVisitor(tz: string): string {
  const there = dayjs().tz(tz).utcOffset()
  const here = dayjs().utcOffset()
  const diff = (there - here) / 60
  if (diff === 0) return 'same time as you'
  const abs = Math.abs(diff)
  const h = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  return `${h}h ${diff > 0 ? 'ahead of' : 'behind'} you`
}

/**
 * Live clock for a timezone. Returns a stable placeholder during prerender/hydration and
 * starts ticking after mount (aligned to the second so every clock on the page agrees).
 */
export function useLocalTime(tz: string, withSeconds = false): string {
  const [time, setTime] = useState(withSeconds ? '--:--:--' : '--:--')
  useEffect(() => {
    let timer: number
    const tick = () => {
      setTime(formatTime(tz, withSeconds))
      const step = withSeconds ? 1000 : 60_000
      timer = window.setTimeout(tick, step - (Date.now() % step) + 5)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [tz, withSeconds])
  return time
}
