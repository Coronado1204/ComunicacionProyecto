import { Component } from 'react'
import { AlertCircle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="card flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-neutral-900">Algo salió mal</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}