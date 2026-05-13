import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'
import prisma from '../config/db.js'
import { response } from '../utils/response.js'

const router = Router()

router.use(authMiddleware)
router.use(rolesMiddleware('ADMINISTRADOR'))

// GET /api/users — listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, active: true, createdAt: true,
        _count: { select: { reports: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return response.success(res, users)
  } catch (error) {
    return response.error(res, error.message)
  }
})

// PATCH /api/users/:id/role — cambiar rol
router.patch('/:id/role', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true }
    })
    return response.success(res, user, 'Rol actualizado')
  } catch (error) {
    return response.error(res, error.message, 400)
  }
})

// PATCH /api/users/:id/toggle — activar/desactivar
router.patch('/:id/toggle', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !user.active },
      select: { id: true, name: true, active: true }
    })
    return response.success(res, updated, `Usuario ${updated.active ? 'activado' : 'desactivado'}`)
  } catch (error) {
    return response.error(res, error.message, 400)
  }
})

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return response.error(res, 'No puedes eliminarte a ti mismo', 400)
    }
    await prisma.user.delete({ where: { id: req.params.id } })
    return response.success(res, null, 'Usuario eliminado')
  } catch (error) {
    return response.error(res, error.message)
  }
})

export default router