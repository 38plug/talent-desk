import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-[12px] border border-border bg-canvas-raised px-3 text-sm text-ink',
        'placeholder:text-ink-dim',
        'focus:border-violet/60 focus:outline-none focus:ring-2 focus:ring-violet/25',
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-24 w-full rounded-[12px] border border-border bg-canvas-raised px-3 py-2 text-sm text-ink',
      'placeholder:text-ink-dim',
      'focus:border-violet/60 focus:outline-none focus:ring-2 focus:ring-violet/25',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-medium text-ink-muted', className)}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-[12px] border border-border bg-canvas-raised px-3 text-sm text-ink',
        'focus:border-violet/60 focus:outline-none focus:ring-2 focus:ring-violet/25',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
