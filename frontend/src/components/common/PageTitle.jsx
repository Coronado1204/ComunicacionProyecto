import { useEffect } from 'react'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/reportes': 'Reportes',
  '/mapa': 'Mapa',
  '/admin': 'Administrador',
  '/login': 'Iniciar sesión',
  '/register': 'Registro',
}

export const PageTitle = ({ path }) => {
  useEffect(() => {
    const title = TITLES[path] || 'Sabana Centro'
    document.title = `${title} — Sabana Centro`
  }, [path])
  return null
}