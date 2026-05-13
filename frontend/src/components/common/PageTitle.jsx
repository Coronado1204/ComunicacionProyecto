import { useEffect } from 'react'

const TITLES = {
  '/dashboard':    'Dashboard',
  '/reportes':     'Reportes',
  '/mapa':         'Mapa',
  '/estadisticas': 'Estadísticas',
  '/admin':        'Administrador',
  '/login':        'Iniciar sesión',
  '/register':     'Registro',
  '/perfil': 'Mi perfil',
}

export const PageTitle = ({ path }) => {
  useEffect(() => {
    const title = TITLES[path] || 'Sabana Centro'
    document.title = title + ' — Sabana Centro'
  }, [path])
  return null
}