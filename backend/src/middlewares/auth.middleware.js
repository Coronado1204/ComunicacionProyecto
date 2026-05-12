import { verifyToken } from '../utils/jwt.js'
import { response } from '../utils/response.js'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'Token no proporcionado')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return response.unauthorized(res, 'Token inválido o expirado')
  }
}
