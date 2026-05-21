import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { ClipboardList, Calendar, CheckCircle2, Clock } from 'lucide-react'

export function AdminDashboardPage() {
  const { data: reservations } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => adminApi.getReservations(),
  })

  const stats = {
    total: reservations?.length ?? 0,
    pending: reservations?.filter((r) => r.status === 'PENDING').length ?? 0,
    confirmed: reservations?.filter((r) => r.status === 'CONFIRMED').length ?? 0,
    hold: reservations?.filter((r) => r.status === 'HOLD').length ?? 0,
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-900 text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total reservas', value: stats.total, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
          { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Confirmadas', value: stats.confirmed, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
          { label: 'En espera', value: stats.hold, icon: Calendar, color: 'bg-brand-100 text-brand-600' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <p className="text-3xl font-display font-900 text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 font-body">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-display font-700 text-gray-900 mb-4">Próximas reservas</h2>
        {!reservations || reservations.length === 0 ? (
          <p className="text-sm text-gray-400 font-body text-center py-8">No hay reservas aún</p>
        ) : (
          <div className="space-y-3">
            {reservations.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-display font-700 text-sm text-gray-900">{r.clientData.name}</p>
                  <p className="text-xs text-gray-400 font-body">{r.date} — {r.slot?.label}</p>
                </div>
                <span className={`badge-${r.status === 'CONFIRMED' ? 'reserved' : r.status === 'PENDING' ? 'pending' : 'available'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
