import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react'
import api from '../../services/api.js'

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  content: '👋 ¡Hola! Soy el asistente virtual de **TerritoriApp**.\n\nPuedo ayudarte con:\n• Cómo crear y gestionar reportes\n• Información sobre municipios\n• Uso del mapa y estadísticas\n• Tu cuenta y perfil\n\n¿En qué te puedo ayudar hoy?',
  time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const QUICK_QUESTIONS = [
  '¿Cómo creo un reporte?',
  '¿Qué municipios hay?',
  '¿Qué categorías existen?',
  '¿Cómo uso el mapa?',
]

const formatMessage = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export const Chatbot = () => {
  const [isOpen, setIsOpen]       = useState(false)
  const [isMin, setIsMin]         = useState(false)
  const [messages, setMessages]   = useState([WELCOME])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !isMin) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMin])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/chatbot', { message: msg })
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.data.message,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      if (!isOpen) setUnread(prev => prev + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: '😕 Hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Abrir asistente virtual"
            className="relative w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ boxShadow: '0 4px 20px rgb(37 99 235 / 0.4)' }}
          >
            <MessageCircle size={24} aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center" aria-label={unread + ' mensajes sin leer'}>
                {unread}
              </span>
            )}
          </button>
        )}

        {/* Ventana del chat */}
        {isOpen && (
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              width: '360px',
              height: isMin ? 'auto' : '520px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgb(0 0 0 / 0.15)',
            }}
            role="dialog"
            aria-label="Asistente virtual Sabana Centro"
            aria-modal="false"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Asistente TerritoriApp</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
                    <span className="text-xs text-blue-200">En línea</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMin(!isMin)}
                  aria-label={isMin ? 'Expandir chat' : 'Minimizar chat'}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <Minimize2 size={15} aria-hidden="true" />
                </button>
                <button onClick={() => setIsOpen(false)}
                  aria-label="Cerrar asistente"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            {!isMin && (
              <>
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-label="Conversación">
                  {messages.map(msg => (
                    <div key={msg.id} className={'flex gap-2 ' + (msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ' +
                        (msg.role === 'user' ? 'bg-brand-600' : 'bg-gradient-to-br from-brand-500 to-brand-700')}
                        aria-hidden="true">
                        {msg.role === 'user'
                          ? <User size={13} className="text-white" />
                          : <Bot size={13} className="text-white" />
                        }
                      </div>
                      <div className={'max-w-[80%] ' + (msg.role === 'user' ? 'items-end' : 'items-start') + ' flex flex-col gap-1'}>
                        <div
                          className={'px-3 py-2 rounded-2xl text-sm leading-relaxed ' +
                            (msg.role === 'user'
                              ? 'bg-brand-600 text-white rounded-tr-sm'
                              : 'rounded-tl-sm')}
                          style={msg.role !== 'user' ? {
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          } : {}}
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                        <span className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0" aria-hidden="true">
                        <Bot size={13} className="text-white" />
                      </div>
                      <div className="px-3 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                        role="status" aria-label="El asistente está escribiendo">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"
                            style={{ animationDelay: i * 0.15 + 's' }} aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick questions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 flex-shrink-0"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <label htmlFor="chat-input" className="sr-only">Escribe tu mensaje</label>
                  <input
                    id="chat-input"
                    ref={inputRef}
                    className="input text-sm py-2 flex-1"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    maxLength={300}
                    disabled={loading}
                    aria-label="Mensaje para el asistente"
                  />
                  <button type="submit" disabled={!input.trim() || loading}
                    aria-label="Enviar mensaje"
                    className="btn-primary px-3 py-2 shrink-0">
                    <Send size={14} aria-hidden="true" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}