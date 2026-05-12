import prisma from '../config/db.js'

export const reportsService = {
  create: async (data, userId) => {
    return prisma.report.create({
      data: { ...data, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  },

  getAll: async ({ municipio, category, status, page = 1, limit = 10 }) => {
    const where = {}
    if (municipio) where.municipio = municipio
    if (category) where.category = category
    if (status) where.status = status

    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.report.count({ where }),
    ])

    return { reports, total, page: Number(page), pages: Math.ceil(total / limit) }
  },

  getById: async (id) => {
    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!report) throw new Error('Reporte no encontrado')
    return report
  },

  updateStatus: async (id, status) => {
    return prisma.report.update({
      where: { id },
      data: { status },
    })
  },

  delete: async (id) => {
    return prisma.report.delete({ where: { id } })
  },

  getByMunicipio: async (municipio) => {
    return prisma.report.groupBy({
      by: ['category', 'status'],
      where: { municipio },
      _count: true,
    })
  },
}
