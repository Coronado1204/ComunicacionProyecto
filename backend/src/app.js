import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/env.js'

import authRoutes from './routes/auth.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import municipiosRoutes from './routes/municipios.routes.js'
import usersRoutes from './routes/users.routes.js'
import commentsRoutes from './routes/comments.routes.js'

const app = express()

// Seguridad
app.use(helmet())
app.use(cors({ origin: config.frontendUrl, credentials: true }))

// Parseo de JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logs HTTP
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', env: config.nodeEnv, timestamp: new Date().toISOString() })
})

// Rutas API
app.use('/api/auth', authRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/municipios', municipiosRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/comments', commentsRoutes)

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.originalUrl} no encontrada` })
})

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Error interno del servidor' })
})

export default app
