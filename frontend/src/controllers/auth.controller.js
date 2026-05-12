import { authService } from '../services/auth.service.js'
import { response } from '../utils/response.js'

export const authController = {
  register: async (req, res) => {
    try {
      const data = await authService.register(req.body)
      return response.created(res, data, 'Usuario registrado exitosamente')
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  login: async (req, res) => {
    try {
      const data = await authService.login(req.body)
      return response.success(res, data, 'Inicio de sesión exitoso')
    } catch (error) {
      return response.error(res, error.message, 401)
    }
  },

  me: async (req, res) => {
    try {
      const user = await authService.me(req.user.id)
      return response.success(res, user)
    } catch (error) {
      return response.notFound(res, error.message)
    }
  },
}
