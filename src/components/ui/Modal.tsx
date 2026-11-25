import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

function lockBodyScroll(lock: boolean) {
  if (typeof document === 'undefined') return
  if (lock) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.dataset.tdScrollLock = '1'
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
  } else if (document.body.dataset.tdScrollLock === '1') {
    delete document.body.dataset.tdScrollLock
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    lockBodyScroll(true)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockBodyScroll(false)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto overscroll-none bg-black/75 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative my-auto flex w-full flex-col rounded-[20px] border border-border bg-surface shadow-2xl',
          'max-h-[min(90vh,calc(100dvh-2rem))]',
          wide ? 'max-w-2xl' : 'max-w-lg',
          className,
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    lockBodyScroll(true)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockBodyScroll(false)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full max-h-[100dvh] w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}
