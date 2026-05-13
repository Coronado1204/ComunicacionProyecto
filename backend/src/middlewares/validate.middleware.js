import { validationResult, body } from 'express-validator'
import { response } from '../utils/response.js'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return response.error(res, 'Datos inválidos', 400, errors.array().map(e => e.msg))
  }
  next()
}

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Za-z]/).withMessage('La contraseña debe contener al menos una letra')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
  body('municipio')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El municipio no puede tener más de 100 caracteres'),
]

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('El correo no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
]

export const reportValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('category')
    .notEmpty().withMessage('La categoría es requerida')
    .isIn(['SALUD', 'MOVILIDAD', 'VIVIENDA', 'SERVICIOS_PUBLICOS', 'SEGURIDAD', 'OTRO'])
    .withMessage('Categoría inválida'),
  body('municipio')
    .trim()
    .notEmpty().withMessage('El municipio es requerido')
    .isLength({ max: 100 }).withMessage('El municipio no puede tener más de 100 caracteres'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
]

export const commentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ min: 1, max: 500 }).withMessage('El comentario debe tener entre 1 y 500 caracteres'),
]