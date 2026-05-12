import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix íconos de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Centro de Sabana Centro, Cundinamarca
const CENTER = [5.03, -74.03]

const statusColor = { PENDIENTE: '#F59E0B', EN_PROCESO: '#534AB7', RESUELTO: '#1D9E75', RECHAZADO: '#EF4444' }

const colorIcon = (color) => new L.DivIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export const Mapa = () => {
  const { data } = useQuery({
    queryKey: ['reports-map'],
    queryFn: () => reportService.getAll({ limit: 200 }),
  })

  const reports = (data?.reports || []).filter(r => r.latitude && r.longitude)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Mapa de reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Visualización geográfica — Provincia Sabana Centro</p>
      </div>

      <div className="flex gap-3 text-xs flex-wrap">
        {Object.entries(statusColor).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />
            {s}
          </span>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '520px' }}>
        <MapContainer center={CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map(r => (
            <Marker
              key={r.id}
              position={[r.latitude, r.longitude]}
              icon={colorIcon(statusColor[r.status] || '#888')}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-gray-500 mt-1">{r.municipio} · {r.category}</p>
                  <p className="mt-1">
                    <span style={{ color: statusColor[r.status] }} className="font-medium">{r.status}</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {reports.length === 0 && (
        <p className="text-center text-sm text-gray-400 mt-2">
          Los reportes aparecerán en el mapa cuando tengan coordenadas registradas.
        </p>
      )}
    </div>
  )
}
