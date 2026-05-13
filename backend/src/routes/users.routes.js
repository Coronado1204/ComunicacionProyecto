import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'
import prisma from '../config/db.js'
import { response } from '../utils/response.js'

const router = Router()

router.use(authMiddleware)

// ===== RUTAS DE PERFIL (cualquier usuario autenticado) =====

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, active: true,
        createdAt: true,
        _count: { select: { reports: true, comments: true } }
      }
    })
    if (!user) return response.notFound(res, 'Usuario no encontrado')
    return response.success(res, user)
  } catch (error) {
    return response.error(res, error.message)
  }
})

// PATCH /api/users/profile
router.patch('/profile', async (req, res) => {
  try {
    const { name, municipio } = req.body
    if (!name?.trim()) return response.error(res, 'El nombre es requerido', 400)

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim(), municipio: municipio?.trim() || null },
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, createdAt: true
      }
    })
    return response.success(res, user, 'Perfil actualizado')
  } catch (error) {
    return response.error(res, error.message, 400)
  }
})

// PATCH /api/users/password
router.patch('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return response.error(res, 'Todos los campos son requeridos', 400)
    }
    if (newPassword.length < 8) {
      return response.error(res, 'La nueva contraseña debe tener al menos 8 caracteres', 400)
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.default.compare(currentPassword, user.password)

    if (!valid) return response.error(res, 'La contraseña actual es incorrecta', 400)

    const hashed = await bcrypt.default.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed }
    })

    return response.success(res, null, 'Contraseña actualizada exitosamente')
  } catch (error) {
    return response.error(res, error.message)
  }
})

// ===== RUTAS DE ADMINISTRADOR =====

// GET /api/users
router.get('/', rolesMiddleware('ADMINISTRADOR'), async (req, res) => {
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

// PATCH /api/users/:id/role
router.patch('/:id/role', rolesMiddleware('ADMINISTRADOR'), async (req, res) => {
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

// PATCH /api/users/:id/toggle
router.patch('/:id/toggle', rolesMiddleware('ADMINISTRADOR'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !user.active },
      select: { id: true, name: true, active: true }
    })
    return response.success(res, updated, updated.active ? 'Usuario activado' : 'Usuario desactivado')
  } catch (error) {
    return response.error(res, error.message, 400)
  }
})

// DELETE /api/users/:id
router.delete('/:id', rolesMiddleware('ADMINISTRADOR'), async (req, res) => {
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