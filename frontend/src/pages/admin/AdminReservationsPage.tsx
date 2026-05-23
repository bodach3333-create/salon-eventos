import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import toast from 'react-hot-toast'

export function AdminReservationsPage() {
  const qc = useQueryClient()
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => adminApi.getReservations(),
  })
  const confirm = (id: string) => adminApi.updateReservationStatus(id, 'CONFIRMED').then(() => { qc.invalidateQueries({ queryKey: ['admin', 'reservations'] }); toast.success('Confirmada') })
  const cancel = (id: string) => adminApi.updateReservationStatus(id, 'CANCELLED').then(() => { qc.invalidateQueries({ queryKey: ['admin', 'reservations'] }); toast.success('Cancelada') })

  if (isLoading) return <p className="p-8 text-gray-400">Cargando...</p>

  return (
    <div>
      <h1 className="text-3xl font-display font-900 text-gray-900 mb-8">Reservas</h1>
      {reservations.length === 0 && <p className="text-gray-400 font-body">No hay reservas aún</p>}
      <div className="space-y-3">
        {(reservations as any[]).map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <div>
              <p className="font-display font-700 text-gray-900">{r.clientName} — {r.eventType}</p>
              <p className="text-sm text-gray-500 font-body">{r.date} · {r.slot?.label} · {r.childrenCount} niños / {r.adultCount} adultos</p>
              <p className="text-xs text-gray-400 font-body">{r.clientPhone}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-pending">{r.status}</span>
              {(r.status === 'PENDING' || r.status === 'HOLD') && (
                <>
                  <button onClick={() => confirm(r.id)} className="btn-primary py-1.5 px-3 text-xs">Confirmar</button>
                  <button onClick={() => cancel(r.id)} className="btn-secondary py-1.5 px-3 text-xs">Cancelar</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}