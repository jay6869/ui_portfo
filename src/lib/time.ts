import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// The timezone plugin builds Intl formatters on every .tz() call, which is costly on a clock
// ticking every second in three places. Resolve the zone's offset once (per zone, refreshed
// hourly in case of a DST change) and format through the cheap fixed-offset path.
const offsets = new Map<string, { minutes: number; at: number }>()
function offsetFor(tz: string): number {
  const hit = offsets.get(tz)
  if (hit && Date.now() - hit.at < 3_600_000) return hit.minutes
  const minutes = dayjs().tz(tz).utcOffset()
  offsets.set(tz, { minutes, at: Date.now() })
  return minutes
}

export function formatTime(tz: string, withSeconds = false): string {
  return dayjs()
    .utcOffset(offsetFor(tz))
    .format(withSeconds ? 'HH:mm:ss' : 'HH:mm')
}

/** Hours between the visitor and `tz`, e.g. "+3.5h" or "same time". */
export function offsetFromVisitor(tz: string): string {
  const there = offsetFor(tz)
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
    let timer = 0
    const tick = () => {
      setTime(formatTime(tz, withSeconds))
      const step = withSeconds ? 1000 : 60_000
      timer = window.setTimeout(tick, step - (Date.now() % step) + 5)
    }
    // First timezone lookup loads ICU zone data (tens of ms on a slow phone): do it when idle.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(tick, { timeout: 2000 })
    return () => {
      cancelIdle(id)
      window.clearTimeout(timer)
    }
  }, [tz, withSeconds])
  return time
}
