import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { SkeletonStat } from '../components/common/SkeletonCard.jsx'
import { TrendingUp, MapPin, BarChart2, PieChart } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
  PieChart as RechartsPie, Pie, Sector
} from 'recharts'
import { useState } from 'react'

const COLORS = ['#171717','#404040','#737373','#A3A3A3','#D4D4D4','#525252','#262626']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl px-3 py-2 text-sm shadow-float" role="tooltip">
        <p className="font-medium text-neutral-900">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-neutral-500">{p.name}: {p.value}</p>
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
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#171717" className="text-sm font-semibold" style={{ fontSize: 14, fontWeight: 600 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#737373" style={{ fontSize: 12 }}>
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
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

  // Por municipio
  const porMunicipio = reports.reduce((acc, r) => {
    acc[r.municipio] = (acc[r.municipio] || 0) + 1
    return acc
  }, {})
  const municipioData = Object.entries(porMunicipio)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Por categoría para dona
  const porCategoria = reports.reduce((acc, r) => {
    const label = r.category.charAt(0) + r.category.slice(1).toLowerCase().replace('_', ' ')
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const categoriaData = Object.entries(porCategoria).map(([name, value]) => ({ name, value }))

  // Tendencia mensual
  const porMes = reports.reduce((acc, r) => {
    const fecha = new Date(r.createdAt)
    const key = fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const tendenciaData = Object.entries(porMes).map(([mes, total]) => ({ mes, total }))

  // Por estado
  const porEstado = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const resueltosPct = total > 0 ? Math.round(((porEstado.RESUELTO || 0) / total) * 100) : 0
  const pendientesPct = total > 0 ? Math.round(((porEstado.PENDIENTE || 0) / total) * 100) : 0

  return (
    <main className="space-y-8" aria-labelledby="stats-title">

      {/* Header */}
      <section aria-label="Encabezado de estadísticas">
        <h1 id="stats-title" className="text-2xl font-semibold text-neutral-900">
          Estadísticas
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Análisis completo de reportes en Sabana Centro
        </p>
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
              { label: 'Total reportes',     value: total,                        sub: 'En el sistema',         color: 'bg-neutral-100 text-neutral-600' },
              { label: 'Municipios activos', value: Object.keys(porMunicipio).length, sub: 'Con al menos 1 reporte', color: 'bg-blue-50 text-blue-500' },
              { label: 'Tasa de resolución', value: resueltosPct + '%',           sub: 'Reportes resueltos',    color: 'bg-green-50 text-green-500' },
              { label: 'Pendientes',         value: pendientesPct + '%',          sub: 'Requieren atención',    color: 'bg-amber-50 text-amber-500' },
            ].map(({ label, value, sub, color }) => (
              <article key={label} className="card flex flex-col gap-4" aria-label={label + ': ' + value}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 font-medium">{label}</span>
                  <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + color} aria-hidden="true">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-neutral-900">{value}</p>
                  <p className="text-xs text-neutral-400 mt-1">{sub}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Gráficas fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Reportes por municipio */}
        <section className="card lg:col-span-2" aria-label="Gráfica de reportes por municipio">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Reportes por municipio</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Distribución geográfica</p>
            </div>
            <MapPin size={16} className="text-neutral-300" aria-hidden="true" />
          </div>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center" role="status" aria-label="Cargando">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
            </div>
          ) : municipioData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={municipioData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
                role="img" aria-label="Gráfica de barras por municipio">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                <Bar dataKey="value" name="Reportes" radius={[6, 6, 0, 0]}>
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

        {/* Dona por categoría */}
        <section className="card" aria-label="Distribución por categoría">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Por categoría</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Haz clic para explorar</p>
            </div>
            <PieChart size={16} className="text-neutral-300" aria-hidden="true" />
          </div>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center" role="status" aria-label="Cargando">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
            </div>
          ) : categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie role="img" aria-label="Gráfica de dona por categoría">
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                >
                  {categoriaData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
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

      {/* Tendencia mensual */}
      <section className="card" aria-label="Tendencia mensual de reportes">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Tendencia mensual</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Evolución de reportes en el tiempo</p>
          </div>
          <BarChart2 size={16} className="text-neutral-300" aria-hidden="true" />
        </div>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center" role="status" aria-label="Cargando">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
          </div>
        ) : tendenciaData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendenciaData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
              role="img" aria-label="Gráfica de línea con tendencia mensual">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A3A3A3' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Reportes" stroke="#171717" strokeWidth={2} dot={{ fill: '#171717', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-neutral-300" role="status">
            <p className="text-sm">Sin datos aún</p>
          </div>
        )}
      </section>

      {/* Tabla resumen por municipio */}
      <section className="card" aria-label="Tabla resumen por municipio">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-900">Resumen por municipio</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Detalle completo de reportes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de reportes por municipio">
            <thead>
              <tr className="border-b border-neutral-100">
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Municipio</th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Reportes</th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">% del total</th>
                <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Distribución</th>
              </tr>
            </thead>
            <tbody>
              {municipioData.map((m, i) => {
                const pct = total > 0 ? Math.round((m.value / total) * 100) : 0
                return (
                  <tr key={m.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
                        {m.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600">{m.value}</td>
                    <td className="py-3 px-4 text-right text-neutral-600">{pct}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-100 rounded-full h-1.5" role="progressbar"
                          aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                          aria-label={m.name + ': ' + pct + '%'}>
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: pct + '%', background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {municipioData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-400 text-sm">
                    Sin datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}