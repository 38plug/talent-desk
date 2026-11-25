import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthProvider'
import { isCloudSyncEnabled, supabase } from '@/lib/supabase'

/** Invalidate desk queries when another teammate mutates shared tables. */
export function CloudRealtimeSync() {
  const qc = useQueryClient()
  const { session } = useAuth()

  useEffect(() => {
    if (!isCloudSyncEnabled || !session?.user) return

    const channel = supabase
      .channel('talent-desk-shared')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        void qc.invalidateQueries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
        void qc.invalidateQueries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, () => {
        void qc.invalidateQueries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'earnings' }, () => {
        void qc.invalidateQueries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        void qc.invalidateQueries()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc, session?.user])

  return null
}
