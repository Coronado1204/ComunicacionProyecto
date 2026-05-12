export const response = {
  success: (res, data, message = 'OK', status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    })
  },

  created: (res, data, message = 'Creado exitosamente') => {
    return res.status(201).json({
      success: true,
      message,
      data,
    })
  },

  error: (res, message = 'Error interno', status = 500, errors = null) => {
    return res.status(status).json({
      success: false,
      message,
      ...(errors && { errors }),
    })
  },

  notFound: (res, message = 'Recurso no encontrado') => {
    return res.status(404).json({
      success: false,
      message,
    })
  },

  unauthorized: (res, message = 'No autorizado') => {
    return res.status(401).json({
      success: false,
      message,
    })
  },

  forbidden: (res, message = 'Acceso denegado') => {
    return res.status(403).json({
      success: false,
      message,
    })
  },
}
