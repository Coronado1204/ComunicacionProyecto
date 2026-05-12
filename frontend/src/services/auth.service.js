import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import { generateToken } from '../utils/jwt.js'

export const authService = {
  register: async ({ name, email, password, municipio }) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('El correo ya está registrado')

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashed, municipio },
      select: { id: true, name: true, email: true, role: true, municipio: true, createdAt: true },
    })

    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    return { user, token }
  },

  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) throw new Error('Credenciales inválidas')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Credenciales inválidas')

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    const { password: _, ...userSafe } = user
    return { user: userSafe, token }
  },

  me: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, municipio: true, createdAt: true },
    })
    if (!user) throw new Error('Usuario no encontrado')
    return user
  },
}
