import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MapPin, LayoutDashboard, FileText, LogOut, Shield, BarChart2, Menu, X, User } from 'lucide-react'

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
    <path d="M16 6C11.58 6 8 9.58 8 14c0 6.5 8 12 8 12s8-5.5 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
  </svg>
)

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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-medium">
        Saltar al contenido principal
      </a>

      <nav aria-label="Navegación principal" className="bg-white border-b border-neutral-100 sticky top-0 z-50" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/dashboard" aria-label="Sabana Centro, ir al inicio" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
              <Logo />
              <div>
                <span className="font-bold text-neutral-900 text-sm block leading-tight">Sabana Centro</span>
                <span className="text-xs text-brand-600 font-medium block leading-tight">Gestión Territorial</span>
              </div>
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-0.5" role="list">
              {links.filter(l => l.to !== '/perfil').map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-label={label}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ' +
                        (isActive
                          ? 'bg-brand-600 text-white shadow-brand'
                          : 'text-neutral-500 hover:text-brand-600 hover:bg-brand-50')
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
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Link
                to="/perfil"
                className={
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-150 border ' +
                  (location.pathname === '/perfil'
                    ? 'border-brand-200 bg-brand-50'
                    : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50')
                }
                aria-label="Ver mi perfil"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">{user?.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Mobile button */}
            <button
              className="md:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>

          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-neutral-100 bg-white" role="navigation" aria-label="Menú móvil">
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
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ' +
                      (isActive ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-600')
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                )
              })}
              <div className="pt-2 border-t border-neutral-100 mt-2">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-brand-600 font-medium">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 w-full"
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