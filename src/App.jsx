import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import ChangePasswordPage from './components/auth/ChangePasswordPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './components/dashboard/DashboardPage'
import RecordFormPage from './components/records/RecordFormPage'
import BulkUploadPage from './components/records/BulkUploadPage'
import UsersPage from './components/admin/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            {/* Force-password-change page — no AppShell */}
            <Route path="/change-password" element={<ChangePasswordPage />} />

            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* HR only */}
              <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
                <Route path="records/new"       element={<RecordFormPage />} />
                <Route path="records/:id/edit"  element={<RecordFormPage />} />
                <Route path="records/bulk"      element={<BulkUploadPage />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
