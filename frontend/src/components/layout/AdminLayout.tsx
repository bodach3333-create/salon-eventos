import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Calendar, ClipboardList, LayoutDashboard, Package, LogOut } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import clsx from 'clsx'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/reservas', icon: ClipboardList, label: 'Reservas' },
  { to: '/admin/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/admin/catalogo', icon: Package, label: 'Catálogo' },
]

export function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <span className="text-xl">🎉</span>
          <p className="font-display font-700 text-white mt-1">Panel Admin</p>
          <p className="text-xs text-gray-400 font-body">Salón de Eventos</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-600 transition-all',
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-600 text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
