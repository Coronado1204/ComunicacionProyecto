import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Plus, MapPin, X, FileText, Search } from 'lucide-react'

const CATEGORIAS = ['SALUD', 'MOVILIDAD', 'VIVIENDA', 'SERVICIOS_PUBLICOS', 'SEGURIDAD', 'OTRO']
const MUNICIPIOS = ['Cajicá','Chía','Cogua','Cota','Gachancipá','Nemocón','Sopó','Tabio','Tenjo','Tocancipá','Zipaquirá']
const STATUS_LABELS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto', RECHAZADO: 'Rechazado' }

const statusColor = (s) => ({
  PENDIENTE: 'bg-amber-100 text-amber-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  RESUELTO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600')

const geocodificar = async (direccion, municipio) => {
  const query = `${direccion}, ${municipio}, Cundinamarca, Colombia`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
  const data = await res.json()
  if (data.length > 0) {
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  }
  return null
}

export const Reportes = () => {
  const { isOperador } = useAuth()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ municipio: '', category: '', status: '' })
  const [form, setForm] = useState({ title: '', description: '', category: '', municipio: '', direccion: '' })
  const [formError, setFormError] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [coords, setCoords] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportService.getAll(filters),
  })

  const createMutation = useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      qc.invalidateQueries(['reports'])
      setShowForm(false)
      setForm({ title: '', description: '', category: '', municipio: '', direccion: '' })
      setCoords(null)
    },
    onError: (err) => setFormError(err.response?.data?.message || 'Error al crear reporte'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => reportService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['reports']),
  })

  const handleBuscarDireccion = async () => {
    if (!form.direccion || !form.municipio) {
      setFormError('Escribe una dirección y selecciona el municipio primero')
      return
    }
    setGeocoding(true)
    setFormError('')
    try {
      const resultado = await geocodificar(form.direccion, form.municipio)
      if (resultado) {
        setCoords(resultado)
      } else {
        setFormError('No se encontró la dirección. Intenta ser más específico.')
      }
    } catch {
      setFormError('Error al buscar la dirección')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      municipio: form.municipio,
      ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
    }
    createMutation.mutate(payload)
  }

  const reports = data?.reports || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total || 0} reportes en total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo reporte
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input w-auto" value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value})}>
          <option value="">Todos los municipios</option>
          {MUNICIPIOS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="input w-auto" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-medium">Nuevo reporte</h2>
              <button onClick={() => { setShowForm(false); setCoords(null) }}><X size={20} className="text-gray-400" /></button>
            </div>
            {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Describe brevemente el problema" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Detalla la situación..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">Seleccionar</option>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                  <select className="input" value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value})} required>
                    <option value="">Seleccionar</option>
                    {MUNICIPIOS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={form.direccion}
                    onChange={e => { setForm({...form, direccion: e.target.value}); setCoords(null) }}
                    placeholder="Ej: Calle 5 # 10-20"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarDireccion}
                    disabled={geocoding}
                    className="btn-secondary px-3 shrink-0 flex items-center gap-1"
                  >
                    <Search size={15} />
                    {geocoding ? '...' : 'Buscar'}
                  </button>
                </div>
                {coords && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <MapPin size={12} /> Ubicación encontrada: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                  </p>
                )}
                {!coords && form.direccion && (
                  <p className="text-gray-400 text-xs mt-1">Presiona Buscar para geocodificar la dirección</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending ? 'Enviando...' : 'Crear reporte'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setCoords(null) }} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" /></div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${statusColor(r.status)}`}>{STATUS_LABELS[r.status]}</span>
                  <span className="badge bg-gray-100 text-gray-600">{r.category}</span>
                  {r.latitude && <span className="badge bg-green-50 text-green-700"><MapPin size={10} className="mr-0.5" /> Con ubicación</span>}
                </div>
                <h3 className="font-medium text-gray-900 truncate">{r.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin size={10} /> {r.municipio} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                </p>
              </div>
              {isOperador && (
                <select
                  className="input w-36 text-sm shrink-0"
                  value={r.status}
                  onChange={e => statusMutation.mutate({ id: r.id, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay reportes con estos filtros</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}