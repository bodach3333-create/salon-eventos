import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Calendar, Phone } from 'lucide-react'

export function BookingSuccessPage() {
  const { id } = useParams()

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="card">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-display font-900 text-gray-900 mb-3">
          ¡Solicitud enviada!
        </h1>
        <p className="text-gray-500 font-body mb-2">
          Recibimos tu pedido de reserva. Nos comunicaremos con vos por WhatsApp en las próximas horas para confirmar la fecha y el presupuesto.
        </p>
        <p className="text-xs text-gray-400 font-body mb-6 bg-gray-50 rounded-xl p-3">
          Código de solicitud: <span className="font-display font-700 text-gray-700">{id}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-secondary">
            <Calendar size={16} />
            Volver al inicio
          </Link>
          <a href="tel:+5491100000000" className="btn-primary">
            <Phone size={16} />
            Llamarnos
          </a>
        </div>
      </div>
    </div>
  )
}
