import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import { generateToken } from '../utils/jwt.js'
import { emailService } from './email.service.js'

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

export const authService = {
  register: async ({ name, email, password, municipio }) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('El correo ya está registrado')

    const hashed = await bcrypt.hash(password, 10)
    const code = generateCode()
    const exp = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashed,
        municipio,
        verified: false,
        verificationCode: code,
        verificationExp: exp,
      },
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, createdAt: true,
        verified: true,
      },
    })

    // Enviar email de verificación
    await emailService.sendVerificationCode(email, name, code)

    return { user, requiresVerification: true }
  },

  verifyEmail: async ({ email, code }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Usuario no encontrado')
    if (user.verified) throw new Error('La cuenta ya está verificada')
    if (!user.verificationCode || !user.verificationExp) {
      throw new Error('No hay un código de verificación pendiente')
    }
    if (new Date() > user.verificationExp) {
      throw new Error('El código ha expirado. Solicita uno nuevo.')
    }
    if (user.verificationCode !== code) {
      throw new Error('Código incorrecto')
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        verificationCode: null,
        verificationExp: null,
      },
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, createdAt: true,
        verified: true,
      },
    })

    // Enviar email de bienvenida
    await emailService.sendWelcome(email, user.name)

    const token = generateToken({ id: updated.id, email: updated.email, role: updated.role })
    return { user: updated, token }
  },

  resendCode: async ({ email }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Usuario no encontrado')
    if (user.verified) throw new Error('La cuenta ya está verificada')

    const code = generateCode()
    const exp = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { verificationCode: code, verificationExp: exp }
    })

    await emailService.sendVerificationCode(email, user.name, code)
    return { message: 'Código reenviado exitosamente' }
  },

  login: async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) throw new Error('Credenciales inválidas')
    if (!user.verified) throw new Error('UNVERIFIED')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Credenciales inválidas')

    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    const { password: _, verificationCode, verificationExp, ...userSafe } = user
    return { user: userSafe, token }
  },

  me: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true,
        role: true, municipio: true, createdAt: true,
        verified: true,
      },
    })
    if (!user) throw new Error('Usuario no encontrado')
    return user
  },
}