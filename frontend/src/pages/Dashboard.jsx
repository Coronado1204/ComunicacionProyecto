import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500 font-medium">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={15} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-semibold text-neutral-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl px-3 py-2 shadow-float text-sm">
        <p className="font-medium text-neutral-900">{label}</p>
        <p className="text-neutral-500">{payload[0].value} reportes</p>
      </div>
    )
  }
  return null
}

const STATUS_COLORS = {
  PENDIENTE: 'bg-amber-50 text-amber-600',
  EN_PROCESO: 'bg-blue-50 text-blue-600',
  RESUELTO: 'bg-green-50 text-green-600',
  RECHAZADO: 'bg-red-50 text-red-600',
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
  const enProceso = reports.filter(r => r.status === 'EN_PROCESO').length
  const resueltos = reports.filter(r => r.status === 'RESUELTO').length

  const categorias = reports.reduce((acc, r) => {
    const label = r.category.charAt(0) + r.category.slice(1).toLowerCase().replace('_', ' ')
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categorias).map(([name, value]) => ({ name, value }))
  const COLORS = ['#171717', '#404040', '#737373', '#A3A3A3', '#D4D4D4', '#E5E5E5']

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-900 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Hola, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Aquí está el resumen de la gestión territorial
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total reportes"
          value={total}
          sub="En el sistema"
          color="bg-neutral-100 text-neutral-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Pendientes"
          value={pendientes}
          sub="Requieren atención"
          color="bg-amber-50 text-amber-500"
        />
        <StatCard
          icon={Clock}
          label="En proceso"
          value={enProceso}
          sub="En gestión"
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Resueltos"
          value={resueltos}
          sub={total > 0 ? `${Math.round((resueltos/total)*100)}% del total` : '0%'}
          color="bg-green-50 text-green-500"
        />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Reportes por categoría</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Distribución actual</p>
            </div>
            <TrendingUp size={16} className="text-neutral-300" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#A3A3A3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#A3A3A3' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-neutral-300">
              <p className="text-sm">Sin datos aún</p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Últimos reportes</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Actividad reciente</p>
            </div>
          </div>
          <div className="space-y-4">
            {reports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{r.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{r.municipio}</p>
                </div>
                <span className={`badge shrink-0 ${STATUS_COLORS[r.status] || 'bg-neutral-100 text-neutral-500'}`}>
                  {r.status === 'EN_PROCESO' ? 'En proceso' : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="flex items-center justify-center h-32 text-neutral-300">
                <p className="text-sm">Sin reportes aún</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}