import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MapPin, LayoutDashboard, FileText, LogOut, User, Shield } from 'lucide-react'

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-primary-400 font-medium' : 'text-gray-600 hover:text-primary-400'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <MapPin className="text-primary-400" size={22} />
            <span className="font-semibold text-gray-900 text-sm">Sabana Centro</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/dashboard" className={`flex items-center gap-1.5 ${isActive('/dashboard')}`}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link to="/reportes" className={`flex items-center gap-1.5 ${isActive('/reportes')}`}>
              <FileText size={16} /> Reportes
            </Link>
            <Link to="/mapa" className={`flex items-center gap-1.5 ${isActive('/mapa')}`}>
              <MapPin size={16} /> Mapa
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`flex items-center gap-1.5 ${isActive('/admin')}`}>
                <Shield size={16} /> Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{user?.name?.split(' ')[0]}</span>
              <span className="badge bg-primary-50 text-primary-600 text-xs">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}