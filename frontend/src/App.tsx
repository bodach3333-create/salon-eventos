import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { HomePage } from '@/pages/HomePage'
import { BookingPage } from '@/pages/BookingPage'
import { BookingSuccessPage } from '@/pages/BookingSuccessPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminReservationsPage } from '@/pages/admin/AdminReservationsPage'
import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage'
import { AdminCatalogPage } from '@/pages/admin/AdminCatalogPage'
import { useAdminAuth } from '@/hooks/useAdminAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/reservar" element={<BookingPage />} />
          <Route path="/reserva-exitosa/:id" element={<BookingSuccessPage />} />
        </Route>

        {/* Admin - login sin layout protegido */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin - rutas protegidas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="reservas" element={<AdminReservationsPage />} />
          <Route path="calendario" element={<AdminCalendarPage />} />
          <Route path="catalogo" element={<AdminCatalogPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
