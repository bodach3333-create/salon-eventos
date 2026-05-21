import { Outlet, Link } from 'react-router-dom'
import { Calendar, Phone } from 'lucide-react'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-display font-800 text-brand-500 text-lg leading-tight">
              Salón de Fiestas
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="tel:+5491100000000"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-500 transition-colors"
            >
              <Phone size={14} />
              <span className="font-body">Consultas</span>
            </a>
            <Link to="/reservar" className="btn-primary py-2 text-xs">
              <Calendar size={14} />
              Reservar fecha
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm font-body">
        <p>© {new Date().getFullYear()} Salón de Eventos Infantiles — Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
