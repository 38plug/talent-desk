import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { formatMoney } from '@/lib/utils'

export function AnimatedNumber({
  value,
  money = false,
  duration = 900,
  className,
}: {
  value: number
  money?: boolean
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const fromRef = useRef(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (value - from) * eased
      setDisplay(next)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration, reduce])

  const label = money ? formatMoney(Math.round(display)) : String(Math.round(display))
  return <span className={className}>{label}</span>
}
