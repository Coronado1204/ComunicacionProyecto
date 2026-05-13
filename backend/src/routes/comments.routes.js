import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { rolesMiddleware } from '../middlewares/roles.middleware.js'
import prisma from '../config/db.js'
import { response } from '../utils/response.js'

const router = Router()

router.use(authMiddleware)

// GET /api/comments/:reportId — obtener comentarios de un reporte
router.get('/:reportId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { reportId: req.params.reportId },
      include: {
        user: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    return response.success(res, comments)
  } catch (error) {
    return response.error(res, error.message)
  }
})

// POST /api/comments/:reportId — crear comentario
router.post('/:reportId', async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) {
      return response.error(res, 'El comentario no puede estar vacío', 400)
    }

    const report = await prisma.report.findUnique({
      where: { id: req.params.reportId }
    })
    if (!report) return response.notFound(res, 'Reporte no encontrado')

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        reportId: req.params.reportId,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    })
    return response.created(res, comment, 'Comentario agregado')
  } catch (error) {
    return response.error(res, error.message)
  }
})

// DELETE /api/comments/:id — eliminar comentario
router.delete('/:id', async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id }
    })
    if (!comment) return response.notFound(res, 'Comentario no encontrado')

    const isOwner = comment.userId === req.user.id
    const isAdminOrOperador = ['ADMINISTRADOR', 'OPERADOR'].includes(req.user.role)

    if (!isOwner && !isAdminOrOperador) {
      return response.forbidden(res, 'No tienes permiso para eliminar este comentario')
    }

    await prisma.comment.delete({ where: { id: req.params.id } })
    return response.success(res, null, 'Comentario eliminado')
  } catch (error) {
    return response.error(res, error.message)
  }
})

export default router