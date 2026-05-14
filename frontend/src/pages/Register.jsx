import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ArrowRight, MapPin, CheckCircle } from 'lucide-react'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#regGrad)"/>
    <path d="M16 6C11.58 6 8 9.58 8 14c0 6.5 8 12 8 12s8-5.5 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
  </svg>
)

const MUNICIPIOS = [
  'Cajicá','Chía','Cogua','Cota','Gachancipá',
  'Nemocón','Sopó','Tabio','Tenjo','Tocancipá','Zipaquirá'
]

const benefits = [
  'Reporta problemas en tu municipio',
  'Sigue el estado de tus reportes',
  'Contribuye al desarrollo regional',
  'Accede desde cualquier dispositivo',
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
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)', transform: 'translate(-30%, 30%)' }} aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <Logo />
          <div>
            <span className="text-white font-bold text-lg block leading-tight">TerritoriApp</span>
            <span className="text-blue-300 text-xs font-medium">Gestión Territorial Inteligente</span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-white/80 text-xs font-medium">Registro gratuito</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Únete a la<br />comunidad
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Sé parte del cambio en tu municipio. Tu voz importa para el desarrollo de Sabana Centro.
          </p>
          <ul className="space-y-3" aria-label="Beneficios de registrarse">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-3 text-blue-100 text-sm">
                <CheckCircle size={16} className="text-green-400 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex gap-6">
          {['Cajicá','Chía','Zipaquirá','Tocancipá'].map(m => (
            <span key={m} className="text-blue-400 text-sm font-medium">{m}</span>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-neutral-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <Logo />
              <div>
                <span className="font-bold text-neutral-900 block leading-tight">TerritoriApp</span>
                <span className="text-xs text-brand-600 font-medium">Gestión Territorial</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Crear cuenta</h2>
            <p className="text-neutral-500 text-sm mt-1">Completa los datos para registrarte</p>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Nombre completo <span aria-label="requerido" className="text-red-400">*</span>
              </label>
              <input id="reg-name" type="text" name="name" value={form.name}
                onChange={handleChange} className="input" placeholder="Tu nombre completo" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Correo electrónico <span aria-label="requerido" className="text-red-400">*</span>
              </label>
              <input id="reg-email" type="email" name="email" value={form.email}
                onChange={handleChange} className="input" placeholder="tu@correo.com" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Contraseña <span aria-label="requerido" className="text-red-400">*</span>
              </label>
              <input id="reg-password" type="password" name="password" value={form.password}
                onChange={handleChange} className="input" placeholder="Mínimo 8 caracteres" minLength={8} required aria-required="true" />
            </div>
            <div>
              <label htmlFor="reg-municipio" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Municipio <span aria-label="requerido" className="text-red-400">*</span>
              </label>
              <select id="reg-municipio" name="municipio" value={form.municipio}
                onChange={handleChange} className="input" required aria-required="true">
                <option value="">Selecciona tu municipio</option>
                {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 text-base">
              {loading ? 'Creando cuenta...' : <> Crear cuenta <ArrowRight size={15} aria-hidden="true" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}