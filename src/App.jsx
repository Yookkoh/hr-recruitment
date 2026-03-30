import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

const LoginPage = lazy(() => import('./components/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('./components/auth/ChangePasswordPage'))
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'))
const RecordFormPage = lazy(() => import('./components/records/RecordFormPage'))
const BulkUploadPage = lazy(() => import('./components/records/BulkUploadPage'))
const UsersPage = lazy(() => import('./components/admin/UsersPage'))

function RouteLoader({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-sm font-medium text-slate-600 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.4)] backdrop-blur-xl">
            <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
            Loading workspace...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<RouteLoader><LoginPage /></RouteLoader>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<RouteLoader><ChangePasswordPage /></RouteLoader>} />

            <Route element={<AppShell />}>
              <Route index element={<RouteLoader><DashboardPage /></RouteLoader>} />
              <Route path="dashboard" element={<RouteLoader><DashboardPage /></RouteLoader>} />

              <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                <Route path="records/new" element={<RouteLoader><RecordFormPage /></RouteLoader>} />
                <Route path="records/:id/edit" element={<RouteLoader><RecordFormPage /></RouteLoader>} />
                <Route path="records/bulk" element={<RouteLoader><BulkUploadPage /></RouteLoader>} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/users" element={<RouteLoader><UsersPage /></RouteLoader>} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
