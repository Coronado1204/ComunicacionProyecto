import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MapPin, ArrowRight } from 'lucide-react'

const MUNICIPIOS = [
  'Cajicá', 'Chía', 'Cogua', 'Cota', 'Gachancipá',
  'Nemocón', 'Sopó', 'Tabio', 'Tenjo', 'Tocancipá', 'Zipaquirá'
]

export const Register = () => {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', municipio: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <MapPin size={16} className="text-neutral-900" />
          </div>
          <span className="text-white font-semibold">Sabana Centro</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold text-white leading-tight mb-4">
            Únete a la<br />comunidad
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Reporta problemáticas en tu municipio y contribuye al desarrollo de la provincia Sabana Centro.
          </p>
        </div>
        <div className="flex gap-6">
          {['Cajicá', 'Chía', 'Zipaquirá', 'Tocancipá'].map(m => (
            <span key={m} className="text-neutral-500 text-sm">{m}</span>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <span className="font-semibold text-neutral-900">Sabana Centro</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900">Crear cuenta</h2>
            <p className="text-neutral-500 text-sm mt-1">Completa los datos para registrarte</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre completo</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} className="input"
                placeholder="Tu nombre completo" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Correo electrónico</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} className="input"
                placeholder="tu@correo.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Contraseña</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} className="input"
                placeholder="Mínimo 8 caracteres" minLength={8} required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Municipio</label>
              <select name="municipio" value={form.municipio} onChange={handleChange} className="input" required>
                <option value="">Selecciona tu municipio</option>
                {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Creando cuenta...' : <> Crear cuenta <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}