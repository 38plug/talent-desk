import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchProfile, logoutAccount } from '@/lib/api'
import { getSession, type AuthSession } from '@/lib/local-db'
import type { Profile } from '@/lib/types'

type AuthUser = { id: string; email: string }

type AuthState = {
  session: { user: AuthUser } | null
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  /** Call after login/register so UI picks up localStorage session */
  notifyAuthChanged: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function sessionFromStore(s: AuthSession | null): { user: AuthUser } | null {
  if (!s) return null
  return { user: { id: s.userId, email: s.email } }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: AuthUser } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
  }, [])

  useEffect(() => {
    const s = sessionFromStore(getSession())
    setSession(s)
    if (s?.user) {
      void loadProfile(s.user.id).finally(() => setLoading(false))
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [loadProfile, tick])

  const notifyAuthChanged = useCallback(() => {
    setLoading(true)
    setTick((n) => n + 1)
  }, [])

  const signOut = useCallback(async () => {
    await logoutAccount()
    setSession(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [loadProfile, session?.user])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signOut,
      notifyAuthChanged,
    }),
    [session, profile, loading, refreshProfile, signOut, notifyAuthChanged],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
