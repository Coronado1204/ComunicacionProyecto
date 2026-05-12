import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'
import prisma from '../config/db.js'
import { response } from '../utils/response.js'

const router = Router()

// GET /api/municipios  — público
router.get('/', async (req, res) => {
  try {
    const municipios = await prisma.municipio.findMany({ orderBy: { name: 'asc' } })
    return response.success(res, municipios)
  } catch (error) {
    return response.error(res, error.message)
  }
})

// GET /api/municipios/:id
router.get('/:id', async (req, res) => {
  try {
    const municipio = await prisma.municipio.findUnique({ where: { id: req.params.id } })
    if (!municipio) return response.notFound(res)
    return response.success(res, municipio)
  } catch (error) {
    return response.error(res, error.message)
  }
})

// POST /api/municipios  — solo admin
router.post('/', authMiddleware, rolesMiddleware('ADMINISTRADOR'), async (req, res) => {
  try {
    const municipio = await prisma.municipio.create({ data: req.body })
    return response.created(res, municipio)
  } catch (error) {
    return response.error(res, error.message, 400)
  }
})

export default router
