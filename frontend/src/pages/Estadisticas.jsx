import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { SkeletonStat } from '../components/common/SkeletonCard.jsx'
import { TrendingUp, MapPin, BarChart2, PieChart, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
  PieChart as RechartsPie, Pie, Sector
} from 'recharts'
import { useState } from 'react'

const COLORS = ['#2563EB','#3B82F6','#60A5FA','#1D4ED8','#93C5FD','#1E40AF']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl px-3 py-2 text-sm shadow-float" role="tooltip">
        <p className="font-semibold text-neutral-900">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-brand-600 font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#0F172A" style={{ fontSize: 13, fontWeight: 700 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748B" style={{ fontSize: 12 }}>
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  )
}

export const Estadisticas = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: () => reportService.getAll({ limit: 500 }),
  })

  const reports = data?.reports || []
  const total = data?.total || 0

  const porMunicipio = reports.reduce((acc, r) => {
    acc[r.municipio] = (acc[r.municipio] || 0) + 1
    return acc
  }, {})
  const municipioData = Object.entries(porMunicipio)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const porCategoria = reports.reduce((acc, r) => {
    const label = r.category.charAt(0) + r.category.slice(1).toLowerCase().replace('_', ' ')
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const categoriaData = Object.entries(porCategoria).map(([name, value]) => ({ name, value }))

  const porMes = reports.reduce((acc, r) => {
    const fecha = new Date(r.createdAt)
    const key = fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const tendenciaData = Object.entries(porMes).map(([mes, total]) => ({ mes, total }))

  const porEstado = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const resueltosPct = total > 0 ? Math.round(((porEstado.RESUELTO || 0) / total) * 100) : 0
  const pendientesPct = total > 0 ? Math.round(((porEstado.PENDIENTE || 0) / total) * 100) : 0

  return (
    <main className="space-y-6" aria-labelledby="stats-title">

      {/* Header */}
      <section className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="relative">
          <h1 id="stats-title" className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Estadísticas
          </h1>
          <p className="text-blue-200 text-sm">
            Análisis completo de reportes — Provincia Sabana Centro
          </p>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="Indicadores clave">
        <h2 className="sr-only">Indicadores clave</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total reportes',     value: total,                            sub: 'En el sistema',         color: 'from-brand-500 to-brand-700',  text: 'text-brand-600' },
              { label: 'Municipios activos', value: Object.keys(porMunicipio).length, sub: 'Con al menos 1 reporte', color: 'from-blue-400 to-blue-600',    text: 'text-blue-600'  },
              { label: 'Tasa de resolución', value: resueltosPct + '%',               sub: 'Reportes resueltos',    color: 'from-green-400 to-green-600',   text: 'text-green-600' },
              { label: 'Pendientes',         value: pendientesPct + '%',              sub: 'Requieren atención',    color: 'from-amber-400 to-amber-600',   text: 'text-amber-600' },
            ].map(({ label, value, sub, color, text }) => (
              <article key={label} className="card flex flex-col gap-3" aria-label={label + ': ' + value}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
                  <div className={'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ' + color} aria-hidden="true">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className={'text-3xl font-bold ' + text}>{value}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Gráficas fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <section className="card lg:col-span-2" aria-label="Reportes por municipio">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Reportes por municipio</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Distribución geográfica</p>
            </div>
            <MapPin size={16} className="text-brand-300" aria-hidden="true" />
          </div>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center" role="status">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : municipioData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={municipioData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} role="img" aria-label="Gráfica por municipio">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFF6FF' }} />
                <Bar dataKey="value" name="Reportes" radius={[8, 8, 0, 0]}>
                  {municipioData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-neutral-300" role="status">
              <p className="text-sm">Sin datos aún</p>
            </div>
          )}
        </section>

        <section className="card" aria-label="Distribución por categoría">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Por categoría</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Haz clic para explorar</p>
            </div>
            <PieChart size={16} className="text-brand-300" aria-hidden="true" />
          </div>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center" role="status">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie role="img" aria-label="Gráfica dona por categoría">
                <Pie
                  data={categoriaData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {categoriaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-neutral-300" role="status">
              <p className="text-sm">Sin datos aún</p>
            </div>
          )}
        </section>
      </div>

      {/* Tendencia */}
      <section className="card" aria-label="Tendencia mensual">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Tendencia mensual</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Evolución de reportes en el tiempo</p>
          </div>
          <BarChart2 size={16} className="text-brand-300" aria-hidden="true" />
        </div>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center" role="status">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : tendenciaData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendenciaData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} role="img" aria-label="Gráfica de tendencia">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Reportes" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-neutral-300" role="status">
            <p className="text-sm">Sin datos aún</p>
          </div>
        )}
      </section>

      {/* Tabla */}
      <section className="card" aria-label="Tabla resumen por municipio">
        <div className="mb-6">
          <h2 className="text-base font-bold text-neutral-900">Resumen por municipio</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Detalle completo de reportes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de reportes por municipio">
            <thead>
              <tr className="border-b border-neutral-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wide">Municipio</th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wide">Reportes</th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wide">% del total</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wide">Distribución</th>
              </tr>
            </thead>
            <tbody>
              {municipioData.map((m, i) => {
                const pct = total > 0 ? Math.round((m.value / total) * 100) : 0
                return (
                  <tr key={m.name} className="border-b border-neutral-50 hover:bg-brand-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
                        {m.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-brand-600">{m.value}</td>
                    <td className="py-3 px-4 text-right text-neutral-600">{pct}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-100 rounded-full h-2" role="progressbar"
                          aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                          aria-label={m.name + ': ' + pct + '%'}>
                          <div className="h-2 rounded-full transition-all duration-500" style={{ width: pct + '%', background: COLORS[i % COLORS.length] }} />
                        </div>
                        <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {municipioData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-400 text-sm">Sin datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}