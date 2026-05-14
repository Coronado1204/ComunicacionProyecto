import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Plus, MapPin, X, FileText, Search, Filter, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { SkeletonTable } from '../components/common/SkeletonCard.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'
import { exportToPDF, exportToExcel } from '../utils/exportUtils.js'
import { useNavigate } from 'react-router-dom'

const CATEGORIAS = ['SALUD', 'MOVILIDAD', 'VIVIENDA', 'SERVICIOS_PUBLICOS', 'SEGURIDAD', 'OTRO']
const MUNICIPIOS = ['Cajicá','Chía','Cogua','Cota','Gachancipá','Nemocón','Sopó','Tabio','Tenjo','Tocancipá','Zipaquirá']
const STATUS_LABELS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto', RECHAZADO: 'Rechazado' }

const statusStyle = (s) => ({
  PENDIENTE:  'bg-amber-50 text-amber-700 border border-amber-100',
  EN_PROCESO: 'bg-blue-50 text-blue-700 border border-blue-100',
  RESUELTO:   'bg-green-50 text-green-700 border border-green-100',
  RECHAZADO:  'bg-red-50 text-red-700 border border-red-100',
}[s] || 'bg-neutral-100 text-neutral-500')

const categoryColor = (c) => ({
  SALUD:            'bg-red-50 text-red-600',
  MOVILIDAD:        'bg-orange-50 text-orange-600',
  VIVIENDA:         'bg-purple-50 text-purple-600',
  SERVICIOS_PUBLICOS: 'bg-blue-50 text-blue-600',
  SEGURIDAD:        'bg-yellow-50 text-yellow-700',
  OTRO:             'bg-neutral-100 text-neutral-500',
}[c] || 'bg-neutral-100 text-neutral-500')

const geocodificar = async (direccion, municipio) => {
  const query = direccion + ', ' + municipio + ', Cundinamarca, Colombia'
  const url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1'
  const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
  const data = await res.json()
  if (data.length > 0) return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
  return null
}

export const Reportes = () => {
  const { isOperador } = useAuth()
  const navigate = useNavigate()
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
      toast.success('Reporte creado exitosamente')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al crear reporte'
      setFormError(msg)
      toast.error(msg)
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => reportService.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['reports']); toast.success('Estado actualizado') },
    onError: () => toast.error('Error al actualizar estado'),
  })

  const handleBuscarDireccion = async () => {
    if (!form.direccion || !form.municipio) { setFormError('Escribe una dirección y selecciona el municipio'); return }
    setGeocoding(true); setFormError('')
    try {
      const resultado = await geocodificar(form.direccion, form.municipio)
      if (resultado) { setCoords(resultado); toast.success('Ubicación encontrada') }
      else setFormError('No se encontró la dirección. Intenta ser más específico.')
    } catch { setFormError('Error al buscar la dirección') }
    finally { setGeocoding(false) }
  }

  const handleSubmit = (e) => {
    e.preventDefault(); setFormError('')
    createMutation.mutate({
      title: form.title, description: form.description,
      category: form.category, municipio: form.municipio,
      ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
    })
  }

  const closeForm = () => { setShowForm(false); setCoords(null); setFormError('') }
  const reports = data?.reports || []
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <main className="space-y-6" aria-labelledby="reportes-title">

      {/* Header banner */}
      <section className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 id="reportes-title" className="text-2xl font-bold text-white mb-1">Reportes</h1>
            <p className="text-blue-200 text-sm" aria-live="polite">
              {data?.total || 0} reportes registrados en el sistema
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => exportToExcel(reports, filters)} disabled={reports.length === 0}
              aria-label="Exportar a Excel" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40">
              <Download size={14} aria-hidden="true" /> Excel
            </button>
            <button onClick={() => exportToPDF(reports, filters)} disabled={reports.length === 0}
              aria-label="Exportar a PDF" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40">
              <Download size={14} aria-hidden="true" /> PDF
            </button>
            <button onClick={() => setShowForm(true)} aria-label="Crear nuevo reporte" aria-haspopup="dialog"
              className="inline-flex items-center gap-2 bg-white text-brand-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              <Plus size={14} aria-hidden="true" /> Nuevo reporte
            </button>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section aria-label="Filtros de búsqueda">
        <fieldset>
          <legend className="sr-only">Filtrar reportes</legend>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400" aria-hidden="true">
              <Filter size={13} />
              {activeFilters > 0 ? activeFilters + ' filtro' + (activeFilters > 1 ? 's' : '') : 'Filtrar'}
            </div>
            <label htmlFor="filter-municipio" className="sr-only">Filtrar por municipio</label>
            <select id="filter-municipio" className="input w-auto text-sm" value={filters.municipio}
              onChange={e => setFilters({...filters, municipio: e.target.value})}>
              <option value="">Todos los municipios</option>
              {MUNICIPIOS.map(m => <option key={m}>{m}</option>)}
            </select>
            <label htmlFor="filter-category" className="sr-only">Filtrar por categoría</label>
            <select id="filter-category" className="input w-auto text-sm" value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
            <label htmlFor="filter-status" className="sr-only">Filtrar por estado</label>
            <select id="filter-status" className="input w-auto text-sm" value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {activeFilters > 0 && (
              <button onClick={() => setFilters({ municipio: '', category: '', status: '' })}
                className="text-xs text-brand-600 font-semibold hover:underline" aria-label="Limpiar filtros">
                Limpiar filtros
              </button>
            )}
          </div>
        </fieldset>
      </section>

      {/* Modal */}
      {showForm && (
        <div role="dialog" aria-modal="true" aria-labelledby="form-title"
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onKeyDown={e => e.key === 'Escape' && closeForm()}>
          <div className="bg-white rounded-2xl shadow-float w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <div>
                <h2 id="form-title" className="text-base font-bold text-neutral-900">Nuevo reporte</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Completa la información del problema</p>
              </div>
              <button onClick={closeForm} aria-label="Cerrar formulario"
                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                <X size={18} className="text-neutral-400" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6">
              {formError && (
                <div role="alert" aria-live="assertive"
                  className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="report-title" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Título <span aria-label="requerido" className="text-red-400">*</span>
                  </label>
                  <input id="report-title" className="input" value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    required aria-required="true" placeholder="Describe brevemente el problema" />
                </div>
                <div>
                  <label htmlFor="report-description" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Descripción <span aria-label="requerido" className="text-red-400">*</span>
                  </label>
                  <textarea id="report-description" className="input resize-none" rows={3}
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    required aria-required="true" placeholder="Detalla la situación..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="report-category" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Categoría <span aria-label="requerido" className="text-red-400">*</span>
                    </label>
                    <select id="report-category" className="input" value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})} required aria-required="true">
                      <option value="">Seleccionar</option>
                      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="report-municipio" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Municipio <span aria-label="requerido" className="text-red-400">*</span>
                    </label>
                    <select id="report-municipio" className="input" value={form.municipio}
                      onChange={e => setForm({...form, municipio: e.target.value})} required aria-required="true">
                      <option value="">Seleccionar</option>
                      {MUNICIPIOS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="report-direccion" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Dirección <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input id="report-direccion" className="input" value={form.direccion}
                      onChange={e => { setForm({...form, direccion: e.target.value}); setCoords(null) }}
                      placeholder="Ej: Calle 5 # 10-20" aria-describedby="coords-status" />
                    <button type="button" onClick={handleBuscarDireccion} disabled={geocoding}
                      aria-label="Buscar coordenadas" className="btn-secondary shrink-0 px-3">
                      <Search size={14} aria-hidden="true" />
                      {geocoding ? '...' : 'Buscar'}
                    </button>
                  </div>
                  <p id="coords-status" aria-live="polite"
                    className={'text-xs mt-1.5 flex items-center gap-1 ' + (coords ? 'text-green-600' : 'text-neutral-400')}>
                    {coords ? <><MapPin size={11} aria-hidden="true" /> Ubicación encontrada</> : form.direccion ? 'Presiona Buscar para geocodificar' : ''}
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createMutation.isPending} aria-disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
                    {createMutation.isPending ? 'Enviando...' : 'Crear reporte'}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary flex-1 justify-center">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {isLoading ? <SkeletonTable rows={4} /> : reports.length === 0 ? (
        <EmptyState type="reports" title="Sin reportes"
          description="No hay reportes con los filtros seleccionados."
          action={activeFilters > 0 ? { label: 'Limpiar filtros', onClick: () => setFilters({ municipio: '', category: '', status: '' }) } : undefined} />
      ) : (
        <section aria-label="Lista de reportes">
          <ol className="space-y-3" aria-label={reports.length + ' reportes encontrados'}>
            {reports.map(r => (
              <li key={r.id}
                className="card hover:border-brand-200 hover:shadow-card transition-all duration-150 cursor-pointer"
                onClick={() => navigate('/reportes/' + r.id)}
                role="button" tabIndex={0}
                aria-label={'Ver detalle de ' + r.title}
                onKeyDown={e => e.key === 'Enter' && navigate('/reportes/' + r.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
                      <MapPin size={15} className="text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={'badge text-xs ' + statusStyle(r.status)} aria-label={'Estado: ' + STATUS_LABELS[r.status]}>
                          {STATUS_LABELS[r.status]}
                        </span>
                        <span className={'badge text-xs ' + categoryColor(r.category)}>{r.category}</span>
                        {r.latitude && <span className="badge bg-green-50 text-green-600 text-xs">📍 Con ubicación</span>}
                      </div>
                      <h2 className="font-bold text-neutral-900 truncate">{r.title}</h2>
                      <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{r.description}</p>
                      <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1">
                        <MapPin size={10} className="inline" aria-hidden="true" />
                        {r.municipio} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  {isOperador && (
                    <div onClick={e => e.stopPropagation()}>
                      <label htmlFor={'status-' + r.id} className="sr-only">Cambiar estado de {r.title}</label>
                      <select id={'status-' + r.id} className="input w-36 text-sm shrink-0" value={r.status}
                        onChange={e => statusMutation.mutate({ id: r.id, status: e.target.value })}>
                        {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  )
}