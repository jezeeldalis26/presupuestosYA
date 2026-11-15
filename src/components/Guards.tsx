import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DataProvider } from '../context/DataContext'
import { Logo } from './ui'

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex animate-pulse flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  )
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Splash />
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from !== '/login' ? from : '/'} replace />
  }
  return <Outlet />
}
