import { cn } from '@/lib/utils'

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-surface p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold tracking-tight text-ink', className)} {...props}>
      {children}
    </h3>
  )
}

/** Supporting line under a card title — ~15–16px, balanced against glass panels. */
export function CardSubtitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1.5 text-[15px] leading-snug text-ink-muted sm:text-base', className)}
      {...props}
    >
      {children}
    </p>
  )
}

/** Centered empty-state body for glass cards (~16–18px). */
export function CardEmpty({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex min-h-[11rem] items-center justify-center rounded-[16px] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center text-base font-medium leading-relaxed text-ink-muted sm:min-h-[12.5rem] sm:text-lg',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
