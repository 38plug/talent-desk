import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui'
import { useAuth } from './AuthProvider'
import { isDemoUi } from './demoUi'
import { canViewAdmin } from '@/lib/api'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!session && !isDemoUi()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function AdminRoute() {
  const { profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!canViewAdmin(profile?.role)) return <Navigate to="/" replace />
  return <Outlet />
}
