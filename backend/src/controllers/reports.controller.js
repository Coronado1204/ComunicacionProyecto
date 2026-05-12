import { reportsService } from '../services/reports.service.js'
import { response } from '../utils/response.js'

export const reportsController = {
  create: async (req, res) => {
    try {
      const report = await reportsService.create(req.body, req.user.id)
      return response.created(res, report, 'Reporte creado exitosamente')
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  getAll: async (req, res) => {
    try {
      const result = await reportsService.getAll(req.query)
      return response.success(res, result)
    } catch (error) {
      return response.error(res, error.message)
    }
  },

  getById: async (req, res) => {
    try {
      const report = await reportsService.getById(req.params.id)
      return response.success(res, report)
    } catch (error) {
      return response.notFound(res, error.message)
    }
  },

  updateStatus: async (req, res) => {
    try {
      const report = await reportsService.updateStatus(req.params.id, req.body.status)
      return response.success(res, report, 'Estado actualizado')
    } catch (error) {
      return response.error(res, error.message, 400)
    }
  },

  delete: async (req, res) => {
    try {
      await reportsService.delete(req.params.id)
      return response.success(res, null, 'Reporte eliminado')
    } catch (error) {
      return response.error(res, error.message)
    }
  },

  getByMunicipio: async (req, res) => {
    try {
      const data = await reportsService.getByMunicipio(req.params.municipio)
      return response.success(res, data)
    } catch (error) {
      return response.error(res, error.message)
    }
  },
}
