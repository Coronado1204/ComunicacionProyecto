import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MapPin } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-400 rounded-2xl mb-4">
            <MapPin className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Únete a la comunidad de Sabana Centro</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="input" placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="tu@correo.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Mínimo 8 caracteres" minLength={8} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
              <select name="municipio" value={form.municipio} onChange={handleChange} className="input" required>
                <option value="">Selecciona tu municipio</option>
                {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
