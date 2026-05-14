import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, MapPin, ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { SkeletonStat, SkeletonCard } from '../components/common/SkeletonCard.jsx'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  PENDIENTE:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  dot: 'bg-amber-400',  label: 'Pendiente'  },
  EN_PROCESO: { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   dot: 'bg-blue-400',   label: 'En proceso' },
  RESUELTO:   { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  dot: 'bg-green-400',  label: 'Resuelto'   },
  RECHAZADO:  { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-400',    label: 'Rechazado'  },
}

const CHART_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl px-3 py-2 text-sm shadow-float" role="tooltip">
        <p className="font-semibold text-neutral-900">{label}</p>
        <p className="text-brand-600 font-medium">{payload[0].value} reportes</p>
      </div>
    )
  }
  return null
}

export const Dashboard = () => {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getAll({ limit: 100 }),
  })

  const reports = data?.reports || []
  const total = data?.total || 0
  const pendientes = reports.filter(r => r.status === 'PENDIENTE').length
  const enProceso  = reports.filter(r => r.status === 'EN_PROCESO').length
  const resueltos  = reports.filter(r => r.status === 'RESUELTO').length

  const categorias = reports.reduce((acc, r) => {
    const label = r.category.charAt(0) + r.category.slice(1).toLowerCase().replace('_', ' ')
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categorias).map(([name, value]) => ({ name, value }))

  const porMes = reports.reduce((acc, r) => {
    const fecha = new Date(r.createdAt)
    const key = fecha.toLocaleDateString('es-CO', { month: 'short' })
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const tendenciaData = Object.entries(porMes).map(([mes, total]) => ({ mes, total }))

  const resueltosPct = total > 0 ? Math.round((resueltos / total) * 100) : 0

  return (
    <main className="space-y-6" aria-labelledby="dashboard-title">

      {/* Hero header */}
      <section className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #60A5FA, transparent)', transform: 'translate(30%, -30%)' }} aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)', transform: 'translate(-30%, 30%)' }} aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-blue-200 text-xs font-medium">Sistema activo</span>
          </div>
          <h1 id="dashboard-title" className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Hola, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-blue-200 text-sm">
            Panel de gestión territorial — Provincia Sabana Centro, Cundinamarca
          </p>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Link to="/reportes" className="inline-flex items-center gap-2 bg-white text-brand-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              <FileText size={14} aria-hidden="true" /> Ver reportes
            </Link>
            <Link to="/estadisticas" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              <TrendingUp size={14} aria-hidden="true" /> Estadísticas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Estadísticas generales">
        <h2 className="sr-only">Estadísticas generales</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText,    label: 'Total reportes', value: total,     sub: 'En el sistema',       color: 'from-brand-500 to-brand-700',   bg: 'bg-brand-50',   text: 'text-brand-600' },
              { icon: AlertCircle, label: 'Pendientes',     value: pendientes, sub: 'Requieren atención', color: 'from-amber-400 to-amber-600',   bg: 'bg-amber-50',   text: 'text-amber-600' },
              { icon: Clock,       label: 'En proceso',     value: enProceso,  sub: 'En gestión',         color: 'from-blue-400 to-blue-600',     bg: 'bg-blue-50',    text: 'text-blue-600'  },
              { icon: CheckCircle, label: 'Resueltos',      value: resueltos,  sub: resueltosPct + '% del total', color: 'from-green-400 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
            ].map(({ icon: Icon, label, value, sub, color, bg, text }) => (
              <article key={label} className="card flex flex-col gap-3" aria-label={label + ': ' + value}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
                  <div className={'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ' + color} aria-hidden="true">
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className={'text-3xl font-bold ' + text} aria-live="polite">{value ?? '—'}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar chart */}
        <section className="card lg:col-span-2" aria-label="Reportes por categoría">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Reportes por categoría</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Distribución actual del sistema</p>
            </div>
            <Link to="/estadisticas" className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline" aria-label="Ver estadísticas completas">
              Ver más <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
          {isLoading ? (
            <div className="h-52 flex items-center justify-center" role="status" aria-label="Cargando">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} role="img" aria-label="Gráfica de barras">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFF6FF' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-neutral-300" role="status">
              <p className="text-sm">Sin datos aún</p>
            </div>
          )}
        </section>

        {/* Recent */}
        <section className="card" aria-label="Últimos reportes">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Actividad reciente</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Últimos reportes</p>
            </div>
            <Link to="/reportes" className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline">
              Ver todos <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-neutral-300" role="status">
              <p className="text-sm">Sin reportes aún</p>
            </div>
          ) : (
            <ol className="space-y-3" aria-label="Lista de últimos reportes">
              {reports.slice(0, 5).map(r => {
                const sc = STATUS_COLORS[r.status] || STATUS_COLORS.PENDIENTE
                return (
                  <li key={r.id}>
                    <Link to={'/reportes/' + r.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors group">
                      <div className={'w-2 h-2 rounded-full mt-1.5 shrink-0 ' + sc.dot} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand-600 transition-colors">{r.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={9} aria-hidden="true" /> {r.municipio}
                        </p>
                      </div>
                      <span className={'badge text-xs ' + sc.bg + ' ' + sc.text}>{sc.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      {/* Tendencia mensual */}
      {tendenciaData.length > 1 && (
        <section className="card" aria-label="Tendencia mensual">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Tendencia mensual</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Evolución de reportes en el tiempo</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={tendenciaData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Reportes" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

    </main>
  )
}