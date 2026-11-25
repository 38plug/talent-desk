import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, WifiOff } from 'lucide-react'
import {
  checkSupabaseHealth,
  requireSupabaseConfig,
  supabaseUrl,
  type ConnectivityStatus,
} from '@/lib/supabase'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function AuthConnectivityBanner({ forceCheck }: { forceCheck?: number }) {
  const [status, setStatus] = useState<ConnectivityStatus | null>(null)
  const [checking, setChecking] = useState(false)

  async function runCheck() {
    setChecking(true)
    const result = await checkSupabaseHealth()
    setStatus(result)
    setChecking(false)
  }

  useEffect(() => {
    const cfg = requireSupabaseConfig()
    if (cfg) {
      setStatus({ ok: false, reason: 'Environment not configured', hint: cfg })
      return
    }
    void runCheck()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceCheck])

  if (!status) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs text-ink-muted">
        <RefreshCw className={cn('h-3.5 w-3.5', checking && 'animate-spin')} />
        Checking Supabase at {supabaseUrl}…
      </div>
    )
  }

  if (status.ok) {
    return (
      <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-emerald/25 bg-emerald/10 px-3 py-2 text-xs text-emerald">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Auth reachable · {status.latencyMs}ms · {supabaseUrl}
        </span>
        <button
          type="button"
          className="text-emerald/80 hover:text-emerald"
          onClick={() => void runCheck()}
          aria-label="Recheck connectivity"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', checking && 'animate-spin')} />
        </button>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-xl border border-amber/30 bg-amber/10 px-3 py-3 text-xs text-amber">
      <div className="flex items-start gap-2">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex items-center gap-1.5 font-semibold text-amber">
            <AlertTriangle className="h-3.5 w-3.5" />
            {status.reason}
          </p>
          <p className="break-all text-amber/90">URL: {supabaseUrl}</p>
          <p className="leading-relaxed text-ink-muted">{status.hint}</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => void runCheck()}
            disabled={checking}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', checking && 'animate-spin')} />
            Recheck connection
          </Button>
        </div>
      </div>
    </div>
  )
}
