import { Link } from 'react-router-dom'
import { Calendar, Check, Phone, Star } from 'lucide-react'

const features = [
  { emoji: '🎂', title: 'Catering personalizado', desc: 'Paquetes para niños y adultos' },
  { emoji: '🎈', title: 'Ambientación incluida', desc: 'Decoración temática a elección' },
  { emoji: '🎮', title: 'Zona de juegos', desc: 'Entretenimiento asegurado' },
  { emoji: '📸', title: 'Espacio para fotos', desc: 'Momentos únicos e inolvidables' },
]

const steps = [
  { n: '01', title: 'Elegí tu fecha', desc: 'Consultá disponibilidad en tiempo real' },
  { n: '02', title: 'Configurá el evento', desc: 'Elegí servicios y extras a medida' },
  { n: '03', title: 'Recibí el presupuesto', desc: 'Precio detallado al instante, sin sorpresas' },
  { n: '04', title: 'Confirmamos juntos', desc: 'Te contactamos para cerrar la reserva' },
]

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-accent-400/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-600 text-xs font-display font-700 px-4 py-1.5 rounded-full mb-6">
            <Star size={12} fill="currentColor" />
            El lugar donde los sueños se hacen fiesta
          </div>
          <h1 className="text-5xl font-display font-900 text-gray-900 leading-tight mb-5">
            El lugar perfecto para
            <br />
            <span className="text-brand-500">la fiesta de tus hijos</span>
          </h1>
          <p className="text-lg text-gray-500 font-body mb-8 max-w-xl mx-auto">
            Reservá online, configurá el evento a tu gusto y recibí el presupuesto en segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/reservar" className="btn-primary text-base py-4 px-8">
              <Calendar size={18} />
              Reservar mi fecha
            </Link>
            <a href="tel:+5491100000000" className="btn-secondary text-base py-4 px-8">
              <Phone size={18} />
              Llamarnos
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display font-800 text-center text-gray-900 mb-10">
            Todo lo que necesitás en un solo lugar
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card text-center hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-3">{f.emoji}</div>
                <h3 className="font-display font-700 text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-800 text-center text-gray-900 mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-display font-900 text-lg flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 font-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-900 text-white mb-4">
            ¿Listo para organizar el evento?
          </h2>
          <p className="text-brand-100 font-body mb-8">
            Consultá disponibilidad ahora y recibí tu presupuesto sin compromiso.
          </p>
          <Link to="/reservar" className="inline-flex items-center gap-2 bg-white text-brand-600 font-display font-700 px-8 py-4 rounded-2xl hover:bg-brand-50 transition-colors text-base">
            <Calendar size={18} />
            Consultar disponibilidad
          </Link>
        </div>
      </section>
    </div>
  )
}
