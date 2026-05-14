import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { User, MapPin, FileText, MessageCircle, Lock, Save, Eye, EyeOff, Shield } from 'lucide-react'
import { SkeletonCard } from '../components/common/SkeletonCard.jsx'

const MUNICIPIOS = [
  'Cajicá','Chía','Cogua','Cota','Gachancipá',
  'Nemocón','Sopó','Tabio','Tenjo','Tocancipá','Zipaquirá'
]

const ROLE_CONFIG = {
  CIUDADANO:     { label: 'Ciudadano',     color: 'bg-neutral-100 text-neutral-600' },
  OPERADOR:      { label: 'Operador',      color: 'bg-blue-50 text-blue-700' },
  ADMINISTRADOR: { label: 'Administrador', color: 'bg-green-50 text-green-700' },
}

export const Perfil = () => {
  const { user: authUser } = useAuth()
  const qc = useQueryClient()

  const [editForm, setEditForm] = useState({ name: '', municipio: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [activeTab, setActiveTab] = useState('info')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/profile')
      setEditForm({ name: data.data.name, municipio: data.data.municipio || '' })
      return data.data
    }
  })

  const updateProfile = useMutation({
    mutationFn: (data) => api.patch('/users/profile', data),
    onSuccess: (res) => {
      qc.invalidateQueries(['profile'])
      const updated = res.data.data
      localStorage.setItem('user', JSON.stringify({ ...authUser, ...updated }))
      toast.success('Perfil actualizado')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al actualizar perfil'),
  })

  const updatePassword = useMutation({
    mutationFn: (data) => api.patch('/users/password', data),
    onSuccess: () => {
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Contraseña actualizada exitosamente')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al cambiar contraseña'),
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) return toast.error('El nombre es requerido')
    updateProfile.mutate(editForm)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Las contraseñas no coinciden')
    if (passForm.newPassword.length < 8) return toast.error('Mínimo 8 caracteres')
    updatePassword.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
  }

  const toggleShow = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  const roleCfg = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.CIUDADANO

  return (
    <main className="space-y-6 max-w-2xl mx-auto" aria-labelledby="perfil-title">

      {/* Header banner */}
      <section className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="relative">
          <h1 id="perfil-title" className="text-2xl font-bold text-white mb-1">Mi perfil</h1>
          <p className="text-blue-200 text-sm">Gestiona tu información personal</p>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          {/* Info Card */}
          <div className="card flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-2xl font-bold text-white">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg font-bold text-neutral-900">{profile?.name}</h2>
                <span className={'badge text-xs ' + roleCfg.color}>{roleCfg.label}</span>
              </div>
              <p className="text-sm text-neutral-500">{profile?.email}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <FileText size={11} className="text-brand-400" aria-hidden="true" />
                  {profile?._count?.reports || 0} reportes
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <MessageCircle size={11} className="text-brand-400" aria-hidden="true" />
                  {profile?._count?.comments || 0} comentarios
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <MapPin size={11} className="text-brand-400" aria-hidden="true" />
                  {profile?.municipio || 'Sin municipio'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Secciones del perfil" className="flex gap-1 border-b border-neutral-100">
            {[
              { id: 'info',     label: 'Información', icon: User },
              { id: 'password', label: 'Contraseña',  icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} role="tab" aria-selected={activeTab === id}
                aria-controls={'panel-' + id} id={'tab-' + id}
                onClick={() => setActiveTab(id)}
                className={
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-t-lg ' +
                  (activeTab === id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700')
                }
              >
                <Icon size={15} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {/* Panel Info */}
          <section id="panel-info" role="tabpanel" aria-labelledby="tab-info" hidden={activeTab !== 'info'}>
            <form onSubmit={handleProfileSubmit} className="card space-y-4" aria-label="Editar información" noValidate>
              <h3 className="text-sm font-bold text-neutral-900">Información personal</h3>
              <div>
                <label htmlFor="profile-name" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Nombre completo <span aria-label="requerido" className="text-red-400">*</span>
                </label>
                <input id="profile-name" className="input" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required aria-required="true" placeholder="Tu nombre completo" />
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Correo electrónico
                </label>
                <input id="profile-email" className="input bg-neutral-50 cursor-not-allowed"
                  value={profile?.email || ''} disabled aria-disabled="true" aria-describedby="email-hint" />
                <p id="email-hint" className="text-xs text-neutral-400 mt-1">El correo no se puede cambiar</p>
              </div>
              <div>
                <label htmlFor="profile-municipio" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Municipio
                </label>
                <select id="profile-municipio" className="input" value={editForm.municipio}
                  onChange={e => setEditForm({ ...editForm, municipio: e.target.value })}>
                  <option value="">Sin municipio</option>
                  {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={updateProfile.isPending} aria-disabled={updateProfile.isPending} className="btn-primary">
                  <Save size={15} aria-hidden="true" />
                  {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>

          {/* Panel Password */}
          <section id="panel-password" role="tabpanel" aria-labelledby="tab-password" hidden={activeTab !== 'password'}>
            <form onSubmit={handlePasswordSubmit} className="card space-y-4" aria-label="Cambiar contraseña" noValidate>
              <h3 className="text-sm font-bold text-neutral-900">Cambiar contraseña</h3>
              {[
                { id: 'current', label: 'Contraseña actual',          field: 'currentPassword', placeholder: '••••••••' },
                { id: 'new',     label: 'Nueva contraseña',           field: 'newPassword',     placeholder: 'Mínimo 8 caracteres' },
                { id: 'confirm', label: 'Confirmar nueva contraseña', field: 'confirmPassword', placeholder: 'Repite la nueva contraseña' },
              ].map(({ id, label, field, placeholder }) => (
                <div key={id}>
                  <label htmlFor={'pass-' + id} className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    {label} <span aria-label="requerido" className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input id={'pass-' + id}
                      type={showPasswords[id] ? 'text' : 'password'}
                      className="input pr-10" value={passForm[field]}
                      onChange={e => setPassForm({ ...passForm, [field]: e.target.value })}
                      required aria-required="true" placeholder={placeholder}
                      minLength={id !== 'current' ? 8 : undefined} />
                    <button type="button" onClick={() => toggleShow(id)}
                      aria-label={(showPasswords[id] ? 'Ocultar' : 'Mostrar') + ' ' + label.toLowerCase()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                      {showPasswords[id] ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                <p className="text-xs font-bold text-brand-800 mb-2 flex items-center gap-1.5">
                  <Shield size={12} aria-hidden="true" /> Requisitos de contraseña
                </p>
                <ul className="space-y-1 text-xs">
                  {[
                    { check: passForm.newPassword.length >= 8,                      label: 'Mínimo 8 caracteres' },
                    { check: /[A-Za-z]/.test(passForm.newPassword),                 label: 'Al menos una letra' },
                    { check: /[0-9]/.test(passForm.newPassword),                    label: 'Al menos un número' },
                    { check: passForm.newPassword && passForm.newPassword === passForm.confirmPassword, label: 'Las contraseñas coinciden' },
                  ].map(({ check, label }) => (
                    <li key={label} className={'flex items-center gap-2 ' + (check ? 'text-green-600' : 'text-neutral-400')}>
                      <span className={'w-1.5 h-1.5 rounded-full ' + (check ? 'bg-green-500' : 'bg-neutral-300')} aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={updatePassword.isPending} aria-disabled={updatePassword.isPending} className="btn-primary">
                  <Lock size={15} aria-hidden="true" />
                  {updatePassword.isPending ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </main>
  )
}