import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { session, role, mustChangePassword, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-gray-500">
        <span className="text-5xl">🚫</span>
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm">Your role ({role}) does not have permission to view this page.</p>
      </div>
    )
  }

  return <Outlet />
}
