import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/env.js'
import { generalLimiter } from './middlewares/rateLimit.middleware.js'

import authRoutes from './routes/auth.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import municipiosRoutes from './routes/municipios.routes.js'
import usersRoutes from './routes/users.routes.js'
import commentsRoutes from './routes/comments.routes.js'
import chatbotRoutes from './routes/chatbot.routes.js'

const app = express()

// Seguridad
app.use(helmet())
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting general
app.use(generalLimiter)

// Parseo
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Logs
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', env: config.nodeEnv, timestamp: new Date().toISOString() })
})

// Rutas
app.use('/api/auth',       authRoutes)
app.use('/api/reports',    reportsRoutes)
app.use('/api/municipios', municipiosRoutes)
app.use('/api/users',      usersRoutes)
app.use('/api/comments',   commentsRoutes)
app.use('/api/chatbot',    chatbotRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta ' + req.originalUrl + ' no encontrada' })
})

// Error global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Error interno del servidor' })
})

export default app