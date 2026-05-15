import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="verGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#verGrad)"/>
    <path d="M16 6C11.58 6 8 9.58 8 14c0 6.5 8 12 8 12s8-5.5 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="white"/>
  </svg>
)

export const VerificarEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = location.state?.email || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/register')
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) return toast.error('Ingresa el código completo de 6 dígitos')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-email', { email, code: fullCode })
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      setVerified(true)
      toast.success('Cuenta verificada exitosamente')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código incorrecto')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      await api.post('/auth/resend-code', { email })
      toast.success('Código reenviado a tu correo')
      setCountdown(60)
      setCanResend(false)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reenviar el código')
    } finally {
      setResending(false)
    }
  }

  if (verified) return (
    <div className="min-h-screen flex items-center justify-center page-bg">
      <div className="text-center space-y-4 p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Cuenta verificada
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
          Redirigiendo al panel principal...
        </p>
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center page-bg px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Verifica tu cuenta
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Hemos enviado un código de 6 dígitos a
          </p>
          <p className="text-sm font-bold text-brand-600 mt-1">{email}</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
                Ingresa el código de verificación
              </label>

              {/* Inputs del código */}
              <div className="flex gap-3 justify-center" role="group" aria-label="Código de verificación de 6 dígitos">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={'Dígito ' + (index + 1) + ' del código'}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: digit ? '#2563EB' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              aria-disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? 'Verificando...' : 'Verificar cuenta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              ¿No recibiste el código?{' '}
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              className="text-sm font-semibold mt-1 transition-colors disabled:opacity-40"
              style={{ color: canResend ? '#2563EB' : 'var(--text-muted)' }}
            >
              {resending ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <RefreshCw size={13} className="animate-spin" aria-hidden="true" />
                  Reenviando...
                </span>
              ) : canResend ? (
                'Reenviar código'
              ) : (
                'Reenviar en ' + countdown + 's'
              )}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => navigate('/register')}
              className="text-sm flex items-center gap-1.5 justify-center transition-colors hover:text-brand-600"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={13} aria-hidden="true" /> Volver al registro
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          El código expira en 15 minutos. Revisa también tu carpeta de spam.
        </p>
      </div>
    </div>
  )
}