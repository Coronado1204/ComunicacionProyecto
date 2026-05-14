import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { MapPin, Filter } from 'lucide-react'
import { EmptyState } from '../components/common/EmptyState.jsx'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CENTER = [5.03, -74.03]

const STATUS_CONFIG = {
  PENDIENTE:  { color: '#F59E0B', label: 'Pendiente',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
  EN_PROCESO: { color: '#2563EB', label: 'En proceso', bg: 'bg-blue-50',   text: 'text-blue-700'   },
  RESUELTO:   { color: '#22C55E', label: 'Resuelto',   bg: 'bg-green-50',  text: 'text-green-700'  },
  RECHAZADO:  { color: '#EF4444', label: 'Rechazado',  bg: 'bg-red-50',    text: 'text-red-700'    },
}

const colorIcon = (color) => new L.DivIcon({
  className: '',
  html:
    '<div style="' +
    'width:14px;height:14px;border-radius:50%;' +
    'background:' + color + ';border:2.5px solid white;' +
    'box-shadow:0 2px 6px rgba(0,0,0,0.25)' +
    '" role="img" aria-label="Marcador"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export const Mapa = () => {
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports-map'],
    queryFn: () => reportService.getAll({ limit: 200 }),
  })

  const allReports = (data?.reports || []).filter(r => r.latitude && r.longitude)
  const reports = filterStatus ? allReports.filter(r => r.status === filterStatus) : allReports

  return (
    <main className="space-y-6" aria-labelledby="mapa-title">

      {/* Header banner */}
      <section className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="relative">
          <h1 id="mapa-title" className="text-2xl font-bold text-white mb-1">Mapa de reportes</h1>
          <p className="text-blue-200 text-sm" aria-live="polite">
            {reports.length} reporte{reports.length !== 1 ? 's' : ''} con ubicación en Sabana Centro
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section aria-label="Filtros del mapa">
        <fieldset>
          <legend className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold mb-3">
            <Filter size={13} aria-hidden="true" /> Filtrar por estado
          </legend>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtros por estado">
            <button
              onClick={() => setFilterStatus('')}
              aria-pressed={filterStatus === ''}
              aria-label={'Mostrar todos, ' + allReports.length + ' en total'}
              className={
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ' +
                'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
                (filterStatus === ''
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200')
              }
            >
              Todos ({allReports.length})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, { label, color, bg, text }]) => {
              const count = allReports.filter(r => r.status === key).length
              return (
                <button key={key}
                  onClick={() => setFilterStatus(key === filterStatus ? '' : key)}
                  aria-pressed={filterStatus === key}
                  aria-label={label + ', ' + count + ' reportes'}
                  className={
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ' +
                    'flex items-center gap-1.5 ' +
                    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
                    (filterStatus === key
                      ? 'bg-brand-600 text-white shadow-brand'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200')
                  }
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </fieldset>
      </section>

      {/* Screen reader */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {reports.length === 0
          ? 'No hay reportes con ubicación para los filtros seleccionados'
          : 'Mostrando ' + reports.length + ' reporte' + (reports.length !== 1 ? 's' : '') + ' en el mapa'
        }
      </div>

      {/* Mapa */}
      <section
        aria-label="Mapa interactivo de reportes en Sabana Centro"
        className="rounded-2xl overflow-hidden border border-neutral-100"
        style={{ height: '500px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center bg-neutral-50" role="status" aria-label="Cargando mapa">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Cargando mapa...</p>
            </div>
            <span className="sr-only">Cargando mapa...</span>
          </div>
        ) : (
          <MapContainer center={CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map(r => (
              <Marker
                key={r.id}
                position={[r.latitude, r.longitude]}
                icon={colorIcon(STATUS_CONFIG[r.status]?.color || '#888')}
                alt={r.title + ' en ' + r.municipio + ', estado: ' + (STATUS_CONFIG[r.status]?.label || r.status)}
              >
                <Popup>
                  <article className="text-sm min-w-[200px]">
                    <h3 className="font-bold text-neutral-900 mb-1">{r.title}</h3>
                    <p className="text-neutral-500 text-xs mb-3 leading-relaxed">{r.description}</p>
                    <footer className="flex items-center gap-2 flex-wrap">
                      <span className={'badge text-xs ' + (STATUS_CONFIG[r.status]?.bg || 'bg-neutral-100') + ' ' + (STATUS_CONFIG[r.status]?.text || 'text-neutral-600')}
                        aria-label={'Estado: ' + STATUS_CONFIG[r.status]?.label}>
                        ● {STATUS_CONFIG[r.status]?.label}
                      </span>
                      <span className="text-xs text-neutral-400">{r.municipio}</span>
                    </footer>
                    <p className="text-xs text-neutral-400 mt-1">{r.category}</p>
                  </article>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </section>

      {/* Tabla accesible */}
      {reports.length > 0 && (
        <section className="sr-only" aria-label="Tabla de reportes con ubicación">
          <h2>Reportes en el mapa</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Municipio</th>
                <th scope="col">Categoría</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.municipio}</td>
                  <td>{r.category}</td>
                  <td>{STATUS_CONFIG[r.status]?.label || r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {reports.length === 0 && !isLoading && (
        <EmptyState type="map" title="Sin ubicaciones"
          description="Los reportes aparecen aquí cuando tienen dirección registrada." />
      )}
    </main>
  )
}