import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatHeaderDate, formatHeaderTime } from '@/lib/datetime'

/** Live desk clock — browser locale + local timezone via Intl. */
export function HeaderClock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time
      dateTime={now.toISOString()}
      className={cn(
        'hidden min-w-0 flex-col items-end justify-center text-right sm:flex',
        className,
      )}
      title={now.toLocaleString()}
    >
      <span className="floating-label text-[10px] tracking-[0.14em] uppercase">
        {formatHeaderDate(now)}
      </span>
      <span className="font-mono text-sm font-medium tracking-tight text-ink tabular-nums">
        {formatHeaderTime(now)}
      </span>
    </time>
  )
}
