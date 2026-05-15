import { authService } from '../services/auth.service.js'
import { response } from '../utils/response.js'

export const authController = {
  register: async (req, res) => {
    try {
      const data = await authService.register(req.body)
      return response.created(res, data, 'Registro exitoso. Revisa tu correo para verificar tu cuenta.')
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const data = await authService.verifyEmail(req.body)
      return response.success(res, data, 'Cuenta verificada exitosamente')
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  resendCode: async (req, res) => {
    try {
      const data = await authService.resendCode(req.body)
      return response.success(res, data)
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  login: async (req, res) => {
    try {
      const data = await authService.login(req.body)
      return response.success(res, data, 'Inicio de sesión exitoso')
    } catch (error) {
      if (error.message === 'UNVERIFIED') {
        return response.error(res, 'Debes verificar tu cuenta antes de iniciar sesión', 403)
      }
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