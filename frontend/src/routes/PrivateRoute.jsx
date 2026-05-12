import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole) {
    const roles = { CIUDADANO: 1, OPERADOR: 2, ADMINISTRADOR: 3 }
    if (roles[user.role] < roles[requiredRole]) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}
