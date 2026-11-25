import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isSfxMuted, playSfx, setSfxMuted } from '@/lib/sfx'
import { cn } from '@/lib/utils'

export function SoundToggle({ className }: { className?: string }) {
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    setMuted(isSfxMuted())
  }, [])

  return (
    <button
      type="button"
      aria-label={muted ? 'Unmute UI sounds' : 'Mute UI sounds'}
      title={muted ? 'Unmute UI sounds' : 'Mute UI sounds'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/70 text-ink-muted backdrop-blur transition hover:border-cyan/40 hover:text-cyan',
        className,
      )}
      onClick={() => {
        const next = !muted
        setSfxMuted(next)
        setMuted(next)
        if (!next) playSfx('tap')
      }}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  )
}
