import { cn } from '@/lib/utils'

const tones = {
  lime: 'bg-lime/15 text-lime border-lime/30',
  violet: 'bg-violet/15 text-violet-glow border-violet/30',
  cyan: 'bg-cyan/15 text-cyan border-cyan/30',
  magenta: 'bg-magenta/15 text-magenta-glow border-magenta/30',
  emerald: 'bg-emerald/15 text-emerald border-emerald/30',
  amber: 'bg-amber/15 text-amber border-amber/30',
  rose: 'bg-rose/15 text-rose border-rose/30',
  muted: 'bg-white/5 text-ink-muted border-border',
} as const

export function Badge({
  tone = 'muted',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-[0_0_12px_rgb(0_0_0/0.15)]',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function stageTone(stage: string): keyof typeof tones {
  switch (stage) {
    case 'Hired':
    case 'Paid':
    case 'Live':
      return 'emerald'
    case 'Accepted':
    case 'Pending':
    case 'Interview':
      return 'cyan'
    case 'Offer':
    case 'Estimated':
      return 'violet'
    case 'Overdue':
    case 'Rejected':
    case 'Closed':
      return 'rose'
    case 'Paused':
    case 'Screening':
      return 'amber'
    default:
      return 'muted'
  }
}

export function marketTone(market: string | null | undefined): keyof typeof tones {
  if (market === 'forex') return 'lime'
  if (market === 'chinese') return 'cyan'
  return 'muted'
}
