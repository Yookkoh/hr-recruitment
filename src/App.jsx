import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './components/dashboard/DashboardPage'
import RecordFormPage from './components/records/RecordFormPage'
import ExportPage from './components/export/ExportPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* HR only */}
              <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
                <Route path="records/new"       element={<RecordFormPage />} />
                <Route path="records/:id/edit"  element={<RecordFormPage />} />
              </Route>

              {/* DCOO + MD only */}
              <Route element={<ProtectedRoute allowedRoles={['DCOO', 'MD']} />}>
                <Route path="export" element={<ExportPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
