import { response } from '../utils/response.js'

export const rolesMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return response.unauthorized(res)
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return response.forbidden(res, 'No tienes permisos para esta acción')
    }

    next()
  }
}
