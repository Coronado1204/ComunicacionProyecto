import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import api from '../services/api.js'
import { Shield, Users, FileText, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { SkeletonTable } from '../components/common/SkeletonCard.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'

const ROLES = ['CIUDADANO', 'OPERADOR', 'ADMINISTRADOR']
const STATUS_OPTIONS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO']

const roleColor = (r) => ({
  CIUDADANO:      'bg-neutral-100 text-neutral-600',
  OPERADOR:       'bg-blue-50 text-blue-700',
  ADMINISTRADOR:  'bg-green-50 text-green-700',
}[r] || 'bg-neutral-100 text-neutral-600')

const statusColor = (s) => ({
  PENDIENTE:  'bg-amber-50 text-amber-700',
  EN_PROCESO: 'bg-blue-50 text-blue-700',
  RESUELTO:   'bg-green-50 text-green-700',
  RECHAZADO:  'bg-red-50 text-red-700',
}[s] || 'bg-neutral-100 text-neutral-600')

export const AdminPanel = () => {
  const { isAdmin, user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('usuarios')

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data.data
    }
  })

  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await api.get('/reports?limit=100')
      return data.data
    }
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Rol actualizado') },
    onError: () => toast.error('Error al actualizar rol'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/toggle`),
    onSuccess: (res) => { qc.invalidateQueries(['admin-users']); toast.success(res.data.message || 'Usuario actualizado') },
    onError: () => toast.error('Error al actualizar usuario'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Usuario eliminado') },
    onError: () => toast.error('Error al eliminar usuario'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/reports/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-reports']); toast.success('Estado actualizado') },
    onError: () => toast.error('Error al actualizar estado'),
  })

  const deleteReportMutation = useMutation({
    mutationFn: (id) => api.delete(`/reports/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-reports']); toast.success('Reporte eliminado') },
    onError: () => toast.error('Error al eliminar reporte'),
  })

  const reports = reportsData?.reports || []
  const totalUsuarios = users?.length || 0
  const totalReportes = reportsData?.total || 0
  const resueltos = reports.filter(r => r.status === 'RESUELTO').length

  return (
    <main className="space-y-6" aria-labelledby="admin-title">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neutral-100 rounded-xl" aria-hidden="true">
          <Shield className="text-neutral-700" size={22} />
        </div>
        <div>
          <h1 id="admin-title" className="text-2xl font-semibold text-neutral-900">
            Panel de Administrador
          </h1>
          <p className="text-sm text-neutral-500">Gestión completa del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <section aria-label="Estadísticas del sistema">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Usuarios registrados', value: totalUsuarios, color: 'text-neutral-900' },
            { label: 'Reportes totales',      value: totalReportes, color: 'text-neutral-900' },
            { label: 'Reportes resueltos',    value: resueltos,     color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center" role="status" aria-label={`${label}: ${value}`}>
              <p className={`text-3xl font-semibold ${color}`}>{value}</p>
              <p className="text-sm text-neutral-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div role="tablist" aria-label="Secciones del panel" className="flex gap-1 border-b border-neutral-100">
        {[
          { id: 'usuarios', label: 'Usuarios', icon: Users },
          { id: 'reportes', label: 'Reportes', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-t-lg ${
              tab === id
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {/* Panel Usuarios */}
      <section
        id="panel-usuarios"
        role="tabpanel"
        aria-labelledby="tab-usuarios"
        hidden={tab !== 'usuarios'}
        className="space-y-3"
      >
        {loadingUsers ? <SkeletonTable rows={3} /> : users?.length === 0 ? (
          <EmptyState type="users" title="Sin usuarios" description="No hay usuarios registrados." />
        ) : (
          <div role="list" aria-label="Lista de usuarios">
            {users?.map(u => (
              <div
                key={u.id}
                role="listitem"
                className="card flex items-center justify-between gap-4 mb-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${roleColor(u.role)}`} aria-label={`Rol: ${u.role}`}>
                      {u.role}
                    </span>
                    {!u.active && (
                      <span className="badge bg-red-50 text-red-600" aria-label="Usuario inactivo">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-neutral-900">{u.name}</p>
                  <p className="text-sm text-neutral-500">{u.email} · {u.municipio}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {u._count.reports} reportes · Desde {new Date(u.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor={`role-${u.id}`} className="sr-only">
                    Cambiar rol de {u.name}
                  </label>
                  <select
                    id={`role-${u.id}`}
                    className="input w-36 text-sm"
                    value={u.role}
                    onChange={e => roleMutation.mutate({ id: u.id, role: e.target.value })}
                    disabled={u.id === user?.id}
                    aria-disabled={u.id === user?.id}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <button
                    onClick={() => toggleMutation.mutate(u.id)}
                    disabled={u.id === user?.id}
                    aria-label={u.active ? `Desactivar usuario ${u.name}` : `Activar usuario ${u.name}`}
                    aria-pressed={u.active}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                  >
                    {u.active
                      ? <ToggleRight size={22} className="text-green-500" aria-hidden="true" />
                      : <ToggleLeft size={22} className="text-neutral-400" aria-hidden="true" />
                    }
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${u.name}? Esta acción no se puede deshacer.`)) {
                        deleteMutation.mutate(u.id)
                      }
                    }}
                    disabled={u.id === user?.id}
                    aria-label={`Eliminar usuario ${u.name}`}
                    className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Panel Reportes */}
      <section
        id="panel-reportes"
        role="tabpanel"
        aria-labelledby="tab-reportes"
        hidden={tab !== 'reportes'}
        className="space-y-3"
      >
        {loadingReports ? <SkeletonTable rows={3} /> : reports.length === 0 ? (
          <EmptyState type="reports" title="Sin reportes" description="No hay reportes registrados." />
        ) : (
          <div role="list" aria-label="Lista de reportes">
            {reports.map(r => (
              <div key={r.id} role="listitem" className="card flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${statusColor(r.status)}`} aria-label={`Estado: ${r.status}`}>
                      {r.status}
                    </span>
                    <span className="badge bg-neutral-100 text-neutral-600">{r.category}</span>
                  </div>
                  <p className="font-medium text-neutral-900 truncate">{r.title}</p>
                  <p className="text-sm text-neutral-500 line-clamp-1">{r.description}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {r.municipio} · {r.user?.name} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label htmlFor={`status-${r.id}`} className="sr-only">
                    Cambiar estado de {r.title}
                  </label>
                  <select
                    id={`status-${r.id}`}
                    className="input w-36 text-sm"
                    value={r.status}
                    onChange={e => statusMutation.mutate({ id: r.id, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el reporte "${r.title}"? Esta acción no se puede deshacer.`)) {
                        deleteReportMutation.mutate(r.id)
                      }
                    }}
                    aria-label={`Eliminar reporte ${r.title}`}
                    className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}