import api from './api.js'

export const reportService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/reports', { params })
    return data.data
  },

  getById: async (id) => {
    const { data } = await api.get(`/reports/${id}`)
    return data.data
  },

  create: async (reportData) => {
    const { data } = await api.post('/reports', reportData)
    return data.data
  },

  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/reports/${id}/status`, { status })
    return data.data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/reports/${id}`)
    return data.data
  },

  getByMunicipio: async (municipio) => {
    const { data } = await api.get(`/reports/municipio/${municipio}`)
    return data.data
  },
}
