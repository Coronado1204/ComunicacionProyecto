import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { reportService } from '../services/reportService.js'
import toast from 'react-hot-toast'
import {
  ArrowLeft, MapPin, MessageCircle, Trash2,
  Send, Clock, CheckCircle, AlertCircle, XCircle, Calendar
} from 'lucide-react'
import { SkeletonCard } from '../components/common/SkeletonCard.jsx'

const STATUS_CONFIG = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-amber-50 text-amber-700 border border-amber-100',  icon: AlertCircle,   dot: 'bg-amber-400' },
  EN_PROCESO: { label: 'En proceso', color: 'bg-blue-50 text-blue-700 border border-blue-100',     icon: Clock,         dot: 'bg-blue-400'  },
  RESUELTO:   { label: 'Resuelto',   color: 'bg-green-50 text-green-700 border border-green-100',  icon: CheckCircle,   dot: 'bg-green-400' },
  RECHAZADO:  { label: 'Rechazado',  color: 'bg-red-50 text-red-700 border border-red-100',        icon: XCircle,       dot: 'bg-red-400'   },
}

const STATUS_LABELS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto', RECHAZADO: 'Rechazado' }

const ROLE_COLORS = {
  ADMINISTRADOR: 'bg-green-50 text-green-700',
  OPERADOR:      'bg-blue-50 text-blue-700',
  CIUDADANO:     'bg-neutral-100 text-neutral-600',
}

const categoryColor = (c) => ({
  SALUD:             'bg-red-50 text-red-600',
  MOVILIDAD:         'bg-orange-50 text-orange-600',
  VIVIENDA:          'bg-purple-50 text-purple-600',
  SERVICIOS_PUBLICOS:'bg-blue-50 text-blue-600',
  SEGURIDAD:         'bg-yellow-50 text-yellow-700',
  OTRO:              'bg-neutral-100 text-neutral-500',
}[c] || 'bg-neutral-100 text-neutral-500')

export const ReporteDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isOperador } = useAuth()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: report, isLoading: loadingReport } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get('/reports/' + id)
      return data.data
    }
  })

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data } = await api.get('/comments/' + id)
      return data.data
    }
  })

  const createComment = useMutation({
    mutationFn: (content) => api.post('/comments/' + id, { content }),
    onSuccess: () => { qc.invalidateQueries(['comments', id]); setComment(''); toast.success('Comentario agregado') },
    onError: () => toast.error('Error al agregar comentario'),
  })

  const deleteComment = useMutation({
    mutationFn: (commentId) => api.delete('/comments/' + commentId),
    onSuccess: () => { qc.invalidateQueries(['comments', id]); toast.success('Comentario eliminado') },
    onError: () => toast.error('Error al eliminar comentario'),
  })

  const statusMutation = useMutation({
    mutationFn: (status) => reportService.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['report', id]); toast.success('Estado actualizado') },
    onError: () => toast.error('Error al actualizar estado'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    createComment.mutate(comment)
  }

  if (loadingReport) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <SkeletonCard /><SkeletonCard />
    </div>
  )

  if (!report) return (
    <div className="card text-center py-16 max-w-3xl mx-auto">
      <p className="text-neutral-500">Reporte no encontrado</p>
      <button onClick={() => navigate('/reportes')} className="btn-primary mt-4">Volver</button>
    </div>
  )

  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDIENTE
  const StatusIcon = statusCfg.icon

  return (
    <main className="space-y-6 max-w-3xl mx-auto" aria-labelledby="detalle-title">

      {/* Back */}
      <button onClick={() => navigate('/reportes')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-600 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
        aria-label="Volver a la lista de reportes">
        <ArrowLeft size={15} aria-hidden="true" /> Volver a reportes
      </button>

      {/* Reporte */}
      <article className="card space-y-5" aria-labelledby="detalle-title">
        <header>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={'badge text-xs ' + statusCfg.color} aria-label={'Estado: ' + statusCfg.label}>
                <StatusIcon size={11} className="mr-1" aria-hidden="true" />
                {statusCfg.label}
              </span>
              <span className={'badge text-xs ' + categoryColor(report.category)}>{report.category}</span>
              {report.latitude && <span className="badge bg-brand-50 text-brand-600 text-xs">📍 Con ubicación</span>}
            </div>
            {isOperador && (
              <div>
                <label htmlFor="status-select" className="sr-only">Cambiar estado</label>
                <select id="status-select" className="input w-40 text-sm" value={report.status}
                  onChange={e => statusMutation.mutate(e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            )}
          </div>
          <h1 id="detalle-title" className="text-xl font-bold text-neutral-900">{report.title}</h1>
        </header>

        <p className="text-neutral-600 leading-relaxed">{report.description}</p>

        <footer className="flex items-center gap-4 flex-wrap pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <MapPin size={12} className="text-brand-400" aria-hidden="true" /> {report.municipio}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <Calendar size={12} className="text-brand-400" aria-hidden="true" />
            {new Date(report.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {report.user && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              Reportado por <span className="font-bold text-neutral-700">{report.user.name}</span>
            </div>
          )}
        </footer>
      </article>

      {/* Comentarios */}
      <section aria-labelledby="comments-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-brand-500" aria-hidden="true" />
          <h2 id="comments-title" className="text-base font-bold text-neutral-900">
            Comentarios
            {comments?.length > 0 && (
              <span className="ml-2 bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
            )}
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} aria-label="Agregar comentario" className="card p-4">
          <label htmlFor="comment-input" className="block text-xs font-bold text-neutral-600 mb-2">
            Escribe un comentario
          </label>
          <div className="flex gap-2">
            <input id="comment-input" className="input text-sm" value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Agrega información relevante sobre este reporte..."
              maxLength={500} aria-required="true" />
            <button type="submit" disabled={!comment.trim() || createComment.isPending}
              aria-label="Enviar comentario" className="btn-primary shrink-0 px-3">
              <Send size={14} aria-hidden="true" />
              {createComment.isPending ? '...' : 'Enviar'}
            </button>
          </div>
          <p className={'text-xs mt-1.5 text-right ' + (comment.length > 450 ? 'text-amber-500' : 'text-neutral-400')}>
            {comment.length}/500
          </p>
        </form>

        {/* Lista */}
        {loadingComments ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : comments?.length === 0 ? (
          <div className="card text-center py-10" role="status" aria-label="Sin comentarios">
            <MessageCircle size={28} className="text-neutral-200 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-semibold text-neutral-400">Sin comentarios aún</p>
            <p className="text-xs text-neutral-300 mt-1">Sé el primero en comentar</p>
          </div>
        ) : (
          <ol aria-label="Lista de comentarios" className="space-y-3">
            {comments?.map(c => (
              <li key={c.id} className="card p-4 hover:border-brand-100 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                      <span className="text-xs font-bold text-white">
                        {c.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900">{c.user?.name}</span>
                        <span className={'badge text-xs ' + (ROLE_COLORS[c.user?.role] || 'bg-neutral-100 text-neutral-500')}>
                          {c.user?.role}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(c.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                  {(c.user?.id === user?.id || isOperador) && (
                    <button
                      onClick={() => { if (confirm('¿Eliminar este comentario?')) deleteComment.mutate(c.id) }}
                      aria-label={'Eliminar comentario de ' + c.user?.name}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}