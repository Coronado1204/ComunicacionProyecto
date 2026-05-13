import { Router } from 'express'
import { reportsController } from '../controllers/reports.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'
import { createLimiter } from '../middlewares/rateLimit.middleware.js'
import { reportValidation, validate } from '../middlewares/validate.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/',                    reportsController.getAll)
router.get('/:id',                 reportsController.getById)
router.get('/municipio/:municipio', reportsController.getByMunicipio)

router.post('/',
  createLimiter,
  reportValidation,
  validate,
  reportsController.create
)

router.patch('/:id/status',
  rolesMiddleware('OPERADOR', 'ADMINISTRADOR'),
  reportsController.updateStatus
)

router.delete('/:id',
  rolesMiddleware('ADMINISTRADOR'),
  reportsController.delete
)

export default router