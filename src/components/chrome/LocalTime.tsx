import { site } from '@/content/site'
import { useLocalTime } from '@/lib/time'

/** Live Sri Lanka time. `seconds` adds a ticking seconds field. */
export function LocalTime({
  seconds = false,
  className,
}: {
  seconds?: boolean
  className?: string
}) {
  const time = useLocalTime(site.location.timezone, seconds)
  return (
    <time
      className={className}
      suppressHydrationWarning
      aria-label={`Local time in ${site.location.country}: ${time}`}
    >
      {time}
    </time>
  )
}
