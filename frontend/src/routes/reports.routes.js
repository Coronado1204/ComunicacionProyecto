import { Router } from 'express'
import { reportsController } from '../controllers/reports.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// GET /api/reports  — cualquier usuario autenticado
router.get('/', reportsController.getAll)

// GET /api/reports/:id
router.get('/:id', reportsController.getById)

// GET /api/reports/municipio/:municipio  — estadísticas por municipio
router.get('/municipio/:municipio', reportsController.getByMunicipio)

// POST /api/reports  — ciudadano, operador, admin
router.post('/', reportsController.create)

// PATCH /api/reports/:id/status  — solo operador y admin
router.patch(
  '/:id/status',
  rolesMiddleware('OPERADOR', 'ADMINISTRADOR'),
  reportsController.updateStatus
)

// DELETE /api/reports/:id  — solo admin
router.delete(
  '/:id',
  rolesMiddleware('ADMINISTRADOR'),
  reportsController.delete
)

export default router
