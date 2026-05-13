import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { authLimiter } from '../middlewares/rateLimit.middleware.js'
import { registerValidation, loginValidation, validate } from '../middlewares/validate.middleware.js'

const router = Router()

router.post('/register', authLimiter, registerValidation, validate, authController.register)
router.post('/login',    authLimiter, loginValidation,    validate, authController.login)
router.get('/me',        authMiddleware, authController.me)

export default router