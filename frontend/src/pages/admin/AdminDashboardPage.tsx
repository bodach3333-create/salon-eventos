import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api'

export function AdminDashboardPage() {
  const { data: reservations = [] } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => adminApi.getReservations(),
  })

  return (
    <div>
      <h1 className="text-3xl font-display font-900 text-gray-900 mb-8">Dashboard</h1>
      <div className="card">
        <p className="font-body text-gray-600">Total reservas: {reservations.length}</p>
        <p className="font-body text-gray-600">Pendientes: {reservations.filter(r => r.status === 'PENDING').length}</p>
        <p className="font-body text-gray-600">Confirmadas: {reservations.filter(r => r.status === 'CONFIRMED').length}</p>
      </div>
    </div>
  )
}