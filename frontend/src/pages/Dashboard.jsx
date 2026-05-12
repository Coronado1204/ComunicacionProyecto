import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { FileText, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
)

const COLORS = ['#1D9E75', '#534AB7', '#F59E0B', '#EF4444']

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
    acc[r.category] = (acc[r.category] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categorias).map(([name, value]) => ({ name, value }))

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bienvenido, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">Panel de gestión territorial — Sabana Centro</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}    label="Total reportes"  value={total}     color="bg-primary-400" />
        <StatCard icon={AlertCircle} label="Pendientes"       value={pendientes} color="bg-amber-400" />
        <StatCard icon={Clock}       label="En proceso"       value={enProceso}  color="bg-secondary-400" />
        <StatCard icon={CheckCircle} label="Resueltos"        value={resueltos}  color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 mb-4">Reportes por categoría</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-12">Sin datos aún</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-base font-medium text-gray-900 mb-4">Últimos reportes</h2>
          <div className="space-y-3">
            {reports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{r.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {r.municipio}
                  </p>
                </div>
                <span className={`badge text-xs shrink-0 ${
                  r.status === 'RESUELTO' ? 'bg-green-100 text-green-700' :
                  r.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{r.status}</span>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Sin reportes aún</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
