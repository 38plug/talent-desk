import type { HTMLAttributes, ReactNode } from 'react'
import { DESK_GLASS, useLiquidGlass } from '@/hooks/useLiquidGlass'
import type { CreateGlassOptions } from '@/lib/liquid-glass.js'
import { cn } from '@/lib/utils'

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  /** Override desk liquid-glass optics. */
  optics?: CreateGlassOptions
  /** Skip refraction (keeps frosted `.glass-panel` CSS only). */
  liquid?: boolean
}

/**
 * Lime Glass Desk pane with real liquid refraction (Chromium) and frost fallback.
 * Keep this off `PageTransition` — mount as a leaf under MotionItem / portals.
 */
export function GlassPanel({
  className,
  children,
  optics,
  liquid = true,
  ...props
}: GlassPanelProps) {
  const glassRef = useLiquidGlass<HTMLDivElement>({ ...DESK_GLASS, ...optics }, liquid)

  return (
    <div ref={glassRef} className={cn('glass-panel liquid-glass', className)} {...props}>
      {children}
    </div>
  )
}
