import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import api from '../services/api.js'
import { Shield, Users, FileText, ToggleLeft, ToggleRight, Trash2, ChevronDown } from 'lucide-react'

const ROLES = ['CIUDADANO', 'OPERADOR', 'ADMINISTRADOR']

const roleColor = (r) => ({
  CIUDADANO: 'bg-gray-100 text-gray-600',
  OPERADOR: 'bg-blue-100 text-blue-700',
  ADMINISTRADOR: 'bg-primary-50 text-primary-600',
}[r] || 'bg-gray-100 text-gray-600')

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
    onSuccess: () => qc.invalidateQueries(['admin-users'])
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries(['admin-users'])
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin-users'])
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/reports/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries(['admin-reports'])
  })

  const deleteReportMutation = useMutation({
    mutationFn: (id) => api.delete(`/reports/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin-reports'])
  })

  const reports = reportsData?.reports || []
  const totalUsuarios = users?.length || 0
  const totalReportes = reportsData?.total || 0
  const resueltos = reports.filter(r => r.status === 'RESUELTO').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Shield className="text-primary-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Panel de Administrador</h1>
          <p className="text-sm text-gray-500">Gestión completa del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-semibold text-primary-400">{totalUsuarios}</p>
          <p className="text-sm text-gray-500 mt-1">Usuarios registrados</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-semibold text-secondary-400">{totalReportes}</p>
          <p className="text-sm text-gray-500 mt-1">Reportes totales</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-semibold text-green-500">{resueltos}</p>
          <p className="text-sm text-gray-500 mt-1">Reportes resueltos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'usuarios' ? 'border-primary-400 text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} /> Usuarios
        </button>
        <button
          onClick={() => setTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'reportes' ? 'border-primary-400 text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} /> Reportes
        </button>
      </div>

      {/* Tab Usuarios */}
      {tab === 'usuarios' && (
        <div className="space-y-3">
          {loadingUsers ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
            </div>
          ) : (
            users?.map(u => (
              <div key={u.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${roleColor(u.role)}`}>{u.role}</span>
                    {!u.active && <span className="badge bg-red-100 text-red-600">Inactivo</span>}
                  </div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email} · {u.municipio}</p>
                  <p className="text-xs text-gray-400 mt-1">{u._count.reports} reportes · Desde {new Date(u.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="input w-36 text-sm"
                    value={u.role}
                    onChange={e => roleMutation.mutate({ id: u.id, role: e.target.value })}
                    disabled={u.id === user?.id}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    onClick={() => toggleMutation.mutate(u.id)}
                    disabled={u.id === user?.id}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                    title={u.active ? 'Desactivar' : 'Activar'}
                  >
                    {u.active
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} className="text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este usuario?')) deleteMutation.mutate(u.id)
                    }}
                    disabled={u.id === user?.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Reportes */}
      {tab === 'reportes' && (
        <div className="space-y-3">
          {loadingReports ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
            </div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="card flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${
                      r.status === 'RESUELTO' ? 'bg-green-100 text-green-700' :
                      r.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                      r.status === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{r.status}</span>
                    <span className="badge bg-gray-100 text-gray-600">{r.category}</span>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{r.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.municipio} · {r.user?.name} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="input w-36 text-sm"
                    value={r.status}
                    onChange={e => statusMutation.mutate({ id: r.id, status: e.target.value })}
                  >
                    {['PENDIENTE','EN_PROCESO','RESUELTO','RECHAZADO'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este reporte?')) deleteReportMutation.mutate(r.id)
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}