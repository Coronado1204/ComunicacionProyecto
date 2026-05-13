import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { MapPin, Filter } from 'lucide-react'
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
  html: `<div style="
    width:12px;height:12px;border-radius:50%;
    background:${color};border:2px solid white;
    box-shadow:0 1px 4px rgba(0,0,0,0.2)
  "></div>`,
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
  const reports = filterStatus ? allReports.filter(r => r.status === filterStatus) : allReports

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Mapa de reportes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {reports.length} reporte{reports.length !== 1 ? 's' : ''} con ubicación en Sabana Centro
          </p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Filter size={13} /> Filtrar por estado
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              filterStatus === '' ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Todos ({allReports.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => {
            const count = allReports.filter(r => r.status === key).length
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key === filterStatus ? '' : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  filterStatus === key ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-2xl overflow-hidden border border-neutral-100 shadow-soft" style={{ height: '500px' }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center bg-neutral-50">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
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
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-semibold text-neutral-900 mb-1">{r.title}</p>
                    <p className="text-neutral-500 text-xs mb-2">{r.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: STATUS_CONFIG[r.status]?.color }}>
                        ● {STATUS_CONFIG[r.status]?.label}
                      </span>
                      <span className="text-xs text-neutral-400">{r.municipio}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{r.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {reports.length === 0 && !isLoading && (
        <div className="card flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
            <MapPin size={20} className="text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-900">Sin ubicaciones</p>
          <p className="text-xs text-neutral-400 mt-1">
            Los reportes aparecen aquí cuando tienen dirección registrada
          </p>
        </div>
      )}
    </div>
  )
}