import { Router } from 'express'
import { response } from '../utils/response.js'

const router = Router()

// Base de conocimiento de Sabana Centro
const knowledge = [
  {
    keywords: ['hola', 'buenas', 'buenos', 'saludos', 'hey', 'hi'],
    answer: '¡Hola! 👋 Soy el asistente virtual de TerritoriApp. Puedo ayudarte con información sobre la plataforma, cómo reportar problemas, municipios y más. ¿En qué te puedo ayudar?'
  },
  {
    keywords: ['reporte', 'reportar', 'problema', 'crear reporte', 'nuevo reporte', 'como reporto'],
    answer: '📝 Para crear un reporte:\n1. Ve a la sección **Reportes** en el menú\n2. Haz clic en **Nuevo reporte**\n3. Completa el título y descripción\n4. Selecciona la categoría y municipio\n5. Opcionalmente agrega la dirección para ubicarlo en el mapa\n6. Haz clic en **Crear reporte**\n\n¡Tu reporte llegará a los operadores de inmediato!'
  },
  {
    keywords: ['categoria', 'categorias', 'tipo', 'tipos', 'clase'],
    answer: '🏷️ Las categorías de reportes disponibles son:\n\n• **SALUD** — Problemas en centros médicos, EPS, hospitales\n• **MOVILIDAD** — Vías, transporte, señalización\n• **VIVIENDA** — Problemas de habitabilidad, construcciones\n• **SERVICIOS PÚBLICOS** — Agua, luz, gas, internet\n• **SEGURIDAD** — Situaciones de riesgo o peligro\n• **OTRO** — Cualquier otro problema territorial'
  },
  {
    keywords: ['municipio', 'municipios', 'sabana centro', 'provincia', 'pueblos', 'ciudades'],
    answer: '🗺️ La provincia Sabana Centro está conformada por **11 municipios**:\n\nCajicá, Chía, Cogua, Cota, Gachancipá, Nemocón, Sopó, Tabio, Tenjo, Tocancipá y Zipaquirá.\n\nTodos hacen parte del departamento de Cundinamarca, Colombia.'
  },
  {
    keywords: ['estado', 'estados', 'pendiente', 'proceso', 'resuelto', 'rechazado'],
    answer: '📊 Los estados de un reporte son:\n\n• **PENDIENTE** 🟡 — Recién creado, esperando atención\n• **EN PROCESO** 🔵 — Un operador lo está atendiendo\n• **RESUELTO** 🟢 — El problema fue solucionado\n• **RECHAZADO** 🔴 — No procede o es duplicado\n\nPuedes ver el estado de tus reportes en la sección Reportes.'
  },
  {
    keywords: ['rol', 'roles', 'permisos', 'administrador', 'operador', 'ciudadano'],
    answer: '👥 Los roles del sistema son:\n\n• **CIUDADANO** — Puede crear reportes y comentar\n• **OPERADOR** — Puede gestionar y cambiar estados de reportes\n• **ADMINISTRADOR** — Acceso total: gestiona usuarios, reportes y estadísticas\n\nTu rol lo asigna el administrador del sistema.'
  },
  {
    keywords: ['mapa', 'ubicacion', 'ubicación', 'coordenadas', 'gps', 'donde', 'dónde'],
    answer: '🗺️ El mapa interactivo muestra todos los reportes con ubicación geográfica.\n\nAl crear un reporte puedes:\n1. Escribir la dirección exacta\n2. Hacer clic en **Buscar** para geocodificarla automáticamente\n3. El pin aparecerá en el mapa de Sabana Centro\n\nPuedes filtrar el mapa por estado del reporte.'
  },
  {
    keywords: ['estadistica', 'estadísticas', 'graficas', 'gráficas', 'datos', 'analitica', 'analítica'],
    answer: '📈 La sección de **Estadísticas** muestra:\n\n• Total de reportes por categoría\n• Distribución por municipio\n• Tendencia mensual de reportes\n• Tasa de resolución\n• Tabla resumen por municipio con porcentajes\n\nEs perfecta para tomar decisiones basadas en datos.'
  },
  {
    keywords: ['exportar', 'descargar', 'pdf', 'excel', 'informe', 'reporte'],
    answer: '📥 Puedes exportar los reportes en dos formatos:\n\n• **PDF** — Informe formal con tabla de datos y encabezado institucional\n• **Excel** — Datos completos con hoja de resumen por municipio\n\nAmbas opciones están disponibles en la sección **Reportes**, con los filtros que hayas aplicado.'
  },
  {
    keywords: ['registro', 'registrar', 'cuenta', 'crear cuenta', 'usuario nuevo'],
    answer: '✅ Para crear una cuenta:\n\n1. Haz clic en **Regístrate gratis** en la pantalla de login\n2. Ingresa tu nombre completo\n3. Escribe tu correo electrónico\n4. Crea una contraseña segura (mínimo 8 caracteres)\n5. Selecciona tu municipio\n6. Haz clic en **Crear cuenta**\n\n¡En segundos tendrás acceso a la plataforma!'
  },
  {
    keywords: ['contraseña', 'password', 'clave', 'olvidé', 'olvide', 'cambiar contraseña'],
    answer: '🔐 Para cambiar tu contraseña:\n\n1. Ve a **Mi perfil** (haz clic en tu nombre en el navbar)\n2. Selecciona la pestaña **Contraseña**\n3. Ingresa tu contraseña actual\n4. Escribe la nueva contraseña\n5. Confírmala y haz clic en **Cambiar contraseña**\n\nRecuerda que debe tener mínimo 8 caracteres, una letra y un número.'
  },
  {
    keywords: ['comentar', 'comentario', 'comentarios', 'responder'],
    answer: '💬 Puedes comentar en cualquier reporte:\n\n1. Haz clic en un reporte de la lista\n2. En la parte inferior verás la sección **Comentarios**\n3. Escribe tu comentario (máximo 500 caracteres)\n4. Haz clic en **Enviar**\n\nLos comentarios son visibles para todos los usuarios y ayudan a dar seguimiento al problema.'
  },
  {
    keywords: ['perfil', 'datos', 'editar perfil', 'mi perfil', 'información personal'],
    answer: '👤 En **Mi perfil** puedes:\n\n• Editar tu nombre completo\n• Cambiar tu municipio\n• Ver cuántos reportes y comentarios has hecho\n• Cambiar tu contraseña\n\nAccede haciendo clic en tu nombre en la barra de navegación.'
  },
  {
    keywords: ['oscuro', 'claro', 'tema', 'modo', 'dark', 'light'],
    answer: '🌙 Puedes cambiar entre modo claro y oscuro:\n\nHaz clic en el ícono del sol ☀️ o la luna 🌙 que aparece en la barra de navegación, junto a tu nombre.\n\nTu preferencia se guarda automáticamente.'
  },
  {
    keywords: ['ayuda', 'soporte', 'contacto', 'problema técnico', 'error', 'falla'],
    answer: '🛟 Si tienes problemas técnicos:\n\n• **Recarga la página** — Soluciona la mayoría de errores\n• **Verifica tu conexión** — La plataforma requiere internet\n• **Intenta cerrar sesión y volver a entrar**\n\nSi el problema persiste, comunícate con el administrador del sistema a través de la plataforma.'
  },
  {
    keywords: ['gracias', 'gracia', 'thanks', 'genial', 'excelente', 'perfecto', 'ok'],
    answer: '😊 ¡Con gusto! Si tienes más preguntas, aquí estaré. Recuerda que puedes reportar cualquier problema en tu municipio — ¡tu participación hace la diferencia en Sabana Centro!'
  },
  {
    keywords: ['adios', 'adiós', 'bye', 'chao', 'hasta', 'nos vemos'],
    answer: '👋 ¡Hasta luego! Recuerda que puedes volver cuando necesites ayuda. ¡Que tengas un excelente día!'
  },
]

const findAnswer = (message) => {
  const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Buscar coincidencias por keywords
  let bestMatch = null
  let maxMatches = 0

  for (const item of knowledge) {
    const matches = item.keywords.filter(kw => msg.includes(kw)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = item
    }
  }

  if (bestMatch && maxMatches > 0) return bestMatch.answer

  // Respuesta por defecto
  return '🤔 No estoy seguro de cómo ayudarte con eso. Puedo responder preguntas sobre:\n\n• Cómo crear reportes\n• Categorías y estados\n• Municipios de Sabana Centro\n• Cómo usar el mapa\n• Estadísticas y exportación\n• Tu perfil y cuenta\n\n¿Sobre cuál de estos temas te puedo ayudar?'
}

// POST /api/chatbot
router.post('/', (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) {
      return response.error(res, 'El mensaje no puede estar vacío', 400)
    }

    const answer = findAnswer(message.trim())
    
    return response.success(res, {
      message: answer,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return response.error(res, error.message)
  }
})

export default router