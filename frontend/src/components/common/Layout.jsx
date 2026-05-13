import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none"
        aria-label="Contenido principal"
      >
        <Outlet />
      </main>
      <footer
        className="border-t border-neutral-100 mt-16 py-6"
        role="contentinfo"
        aria-label="Pie de página"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400 text-center">
            © 2026 Sabana Centro · Gestión territorial inteligente
          </p>
          <p className="text-xs text-neutral-400 text-center">
            Provincia Sabana Centro, Cundinamarca
          </p>
        </div>
      </footer>
    </div>
  )
}