import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AccessDeniedIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  )
}

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

  if (!session) return <Navigate to="/login" replace state={{ from: location }} />

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-4 text-center text-gray-500 dark:text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-300">
          <AccessDeniedIcon />
        </div>
        <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Access Denied</p>
        <p className="text-sm">Your role ({role}) does not have permission to view this page.</p>
      </div>
    )
  }

  return <Outlet />
}
