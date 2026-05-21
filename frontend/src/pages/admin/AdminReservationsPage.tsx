import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Reservation } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  HOLD: 'En espera',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
}

export function AdminReservationsPage() {
  const qc = useQueryClient()

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => adminApi.getReservations(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReservationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      toast.success('Estado actualizado')
    },
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-900 text-gray-900 mb-8">Reservas</h1>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Cliente', 'Fecha', 'Turno', 'Niños/Adults', 'Total', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-display font-700 text-gray-600 text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations?.map((r: Reservation) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-display font-700 text-gray-900">{r.clientData.name}</p>
                  <p className="text-xs text-gray-400">{r.clientData.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.date}</td>
                <td className="px-4 py-3 text-gray-600">{r.slot?.label ?? r.slotId}</td>
                <td className="px-4 py-3 text-gray-600">{r.childrenCount} / {r.adultCount}</td>
                <td className="px-4 py-3 font-display font-700 text-gray-900">
                  {formatPrice(r.pricingSnapshot?.total ?? 0)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-${r.status === 'CONFIRMED' ? 'reserved' : r.status === 'PENDING' ? 'pending' : 'blocked'}`}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.status === 'PENDING' || r.status === 'HOLD' ? (
                      <>
                        <button
                          onClick={() => statusMutation.mutate({ id: r.id, status: 'CONFIRMED' })}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Confirmar"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: r.id, status: 'CANCELLED' })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Cancelar"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!reservations || reservations.length === 0) && (
          <p className="text-center text-gray-400 font-body text-sm py-12">No hay reservas aún</p>
        )}
      </div>
    </div>
  )
}
