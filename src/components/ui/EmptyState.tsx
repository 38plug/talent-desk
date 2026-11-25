import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-surface/40 px-6 py-16 text-center',
        className,
      )}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-glow">
        {APP_NAME}
      </p>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-violet/30 border-t-cyan',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  )
}
