import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { Briefcase, Calendar, Users, type LucideIcon } from 'lucide-react'
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { fetchCandidates, fetchInterviews, fetchOffers } from '@/lib/api'

type Stat = {
  key: string
  label: string
  value: number
  meta: string
  icon: LucideIcon
}

function StatCell({ label, value, meta, icon: Icon }: Omit<Stat, 'key'>) {
  return (
    <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-lime/15 text-lime glow-lime">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-lime uppercase">{label}</p>
        <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-lime text-glow-lime tabular sm:text-4xl">
          <AnimatedNumber value={value} />
        </p>
        <p className="mt-0.5 text-xs text-ink-dim">{meta}</p>
      </div>
    </div>
  )
}

/** Live unfiltered desk totals — candidates, offers, interviews. Lime-glass strip. */
export function DeskTotalsStrip() {
  const reduce = useReducedMotion()
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  })
  const { data: offers = [] } = useQuery({
    queryKey: ['offers'],
    queryFn: fetchOffers,
  })
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  })

  const stats: Stat[] = [
    {
      key: 'candidates',
      label: 'Total candidates',
      value: candidates.length,
      meta: 'All desk candidates · live shared total',
      icon: Users,
    },
    {
      key: 'offers',
      label: 'Total offers',
      value: offers.length,
      meta: 'All desk offers · live shared total',
      icon: Briefcase,
    },
    {
      key: 'interviews',
      label: 'Total interviews',
      value: interviews.length,
      meta: 'All desk interviews · live shared total',
      icon: Calendar,
    },
  ]

  return (
    <div
      className="glass-panel relative overflow-hidden !p-4 sm:!px-5 sm:!py-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="relative z-10 grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {stats.map((stat) => (
          <div key={stat.key} className="sm:px-5 first:sm:pl-0 last:sm:pr-0">
            <StatCell label={stat.label} value={stat.value} meta={stat.meta} icon={stat.icon} />
          </div>
        ))}
      </div>
      <motion.div
        className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-lime/20 blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-40 rounded-full bg-lime/10 blur-2xl"
        aria-hidden
      />
    </div>
  )
}
