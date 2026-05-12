import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

// POST /api/auth/register
router.post('/register', authController.register)

// POST /api/auth/login
router.post('/login', authController.login)

// GET /api/auth/me  (requiere token)
router.get('/me', authMiddleware, authController.me)

export default router
