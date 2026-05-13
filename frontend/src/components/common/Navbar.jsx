import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MapPin, LayoutDashboard, FileText, LogOut, Shield } from 'lucide-react'

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/reportes', label: 'Reportes', icon: FileText },
    { to: '/mapa', label: 'Mapa', icon: MapPin },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <nav className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="font-semibold text-neutral-900 text-sm">Sabana Centro</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === to
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* User */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-neutral-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 leading-none">{user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}