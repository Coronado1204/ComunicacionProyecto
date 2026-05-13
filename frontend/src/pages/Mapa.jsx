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
  PENDIENTE:  { color: '#F59E0B', label: 'Pendiente' },
  EN_PROCESO: { color: '#6366F1', label: 'En proceso' },
  RESUELTO:   { color: '#22C55E', label: 'Resuelto' },
  RECHAZADO:  { color: '#EF4444', label: 'Rechazado' },
}

const colorIcon = (color) => new L.DivIcon({
  className: '',
  html:
    '<div style="' +
    'width:12px;height:12px;border-radius:50%;' +
    'background:' + color + ';border:2px solid white;' +
    'box-shadow:0 1px 4px rgba(0,0,0,0.2)' +
    '" role="img" aria-label="Marcador"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

export const Mapa = () => {
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports-map'],
    queryFn: () => reportService.getAll({ limit: 200 }),
  })

  const allReports = (data?.reports || []).filter(r => r.latitude && r.longitude)
  const reports = filterStatus
    ? allReports.filter(r => r.status === filterStatus)
    : allReports

  return (
    <main className="space-y-6" aria-labelledby="mapa-title">

      {/* Header */}
      <section aria-label="Encabezado del mapa">
        <h1 id="mapa-title" className="text-2xl font-semibold text-neutral-900">
          Mapa de reportes
        </h1>
        <p className="text-sm text-neutral-500 mt-1" aria-live="polite">
          {reports.length} reporte{reports.length !== 1 ? 's' : ''} con ubicación en Sabana Centro
        </p>
      </section>

      {/* Filtros */}
      <section aria-label="Filtros del mapa">
        <fieldset>
          <legend className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
            <Filter size={13} aria-hidden="true" />
            Filtrar por estado
          </legend>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtros por estado">
            <button
              onClick={() => setFilterStatus('')}
              aria-pressed={filterStatus === ''}
              aria-label={'Mostrar todos los reportes, ' + allReports.length + ' en total'}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ' +
                'focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ' +
                (filterStatus === ''
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50')
              }
            >
              Todos ({allReports.length})
            </button>

            {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => {
              const count = allReports.filter(r => r.status === key).length
              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key === filterStatus ? '' : key)}
                  aria-pressed={filterStatus === key}
                  aria-label={label + ', ' + count + ' reportes'}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ' +
                    'flex items-center gap-1.5 ' +
                    'focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ' +
                    (filterStatus === key
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50')
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </fieldset>
      </section>

      {/* Leyenda accesible para screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {reports.length === 0
          ? 'No hay reportes con ubicación para los filtros seleccionados'
          : 'Mostrando ' + reports.length + ' reporte' + (reports.length !== 1 ? 's' : '') + ' en el mapa'
        }
      </div>

      {/* Mapa */}
      <section
        aria-label="Mapa interactivo de reportes en Sabana Centro"
        className="rounded-2xl overflow-hidden border border-neutral-100 shadow-soft"
        style={{ height: '500px' }}
      >
        {isLoading ? (
          <div
            className="h-full flex items-center justify-center bg-neutral-50"
            role="status"
            aria-label="Cargando mapa"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
            <span className="sr-only">Cargando mapa...</span>
          </div>
        ) : (
          <MapContainer
            center={CENTER}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            aria-label="Mapa de la provincia Sabana Centro"
          >
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
                  <article className="text-sm min-w-[180px]">
                    <h3 className="font-semibold text-neutral-900 mb-1">{r.title}</h3>
                    <p className="text-neutral-500 text-xs mb-2">{r.description}</p>
                    <footer className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-medium"
                        style={{ color: STATUS_CONFIG[r.status]?.color }}
                        aria-label={'Estado: ' + STATUS_CONFIG[r.status]?.label}
                      >
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

      {/* Tabla alternativa para screen readers */}
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
        <EmptyState
          type="map"
          title="Sin ubicaciones"
          description="Los reportes aparecen aquí cuando tienen dirección registrada."
        />
      )}
    </main>
  )
}