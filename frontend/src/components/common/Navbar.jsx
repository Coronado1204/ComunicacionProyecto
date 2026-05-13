import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MapPin, LayoutDashboard, FileText, LogOut, Shield, BarChart2, Menu, X, User } from 'lucide-react'

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const links = [
    { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/reportes',     label: 'Reportes',     icon: FileText },
    { to: '/mapa',         label: 'Mapa',         icon: MapPin },
    { to: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
    ...(isAdmin ? [{ to: '/admin', label: 'Administrador', icon: Shield }] : []),
    { to: '/perfil',       label: 'Mi perfil',    icon: User },
  ]

  return (
    <header role="banner">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neutral-900 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Saltar al contenido principal
      </a>

      <nav
        aria-label="Navegación principal"
        className="bg-white border-b border-neutral-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">

            {/* Logo */}
            <Link
              to="/dashboard"
              aria-label="Sabana Centro, ir al inicio"
              className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center" aria-hidden="true">
                <MapPin size={14} className="text-white" />
              </div>
              <span className="font-semibold text-neutral-900 text-sm">Sabana Centro</span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {links.filter(l => l.to !== '/perfil').map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-label={label}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ' +
                        'transition-all duration-150 focus-visible:outline-none ' +
                        'focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ' +
                        (isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')
                      }
                    >
                      <Icon size={14} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Desktop user */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                to="/perfil"
                className={
                  'flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150 ' +
                  'hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 ' +
                  'focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ' +
                  (location.pathname === '/perfil' ? 'bg-neutral-100' : '')
                }
                aria-label="Ver mi perfil"
              >
                <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-xs font-semibold text-neutral-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 leading-none">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{user?.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen
                ? <X size={20} aria-hidden="true" />
                : <Menu size={20} aria-hidden="true" />
              }
            </button>

          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-neutral-100 bg-white"
            role="navigation"
            aria-label="Menú móvil"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ' +
                      (isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100')
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                )
              })}

              <div className="pt-2 border-t border-neutral-100 mt-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center" aria-hidden="true">
                    <span className="text-sm font-semibold text-neutral-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-400">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 w-full mt-1"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}