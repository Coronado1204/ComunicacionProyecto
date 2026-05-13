import rateLimit from 'express-rate-limit'

// Límite general — 100 peticiones por 15 minutos
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Límite estricto para auth — 10 intentos por 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Límite para creación de reportes — 20 por hora
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Has creado demasiados reportes. Intenta de nuevo en 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})