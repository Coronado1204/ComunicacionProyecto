import app from './app.js'
import { config } from './config/env.js'
import prisma from './config/db.js'

const start = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos')

    app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}`)
      console.log(`📋 Ambiente: ${config.nodeEnv}`)
      console.log(`🏥 Health check: http://localhost:${config.port}/health`)
    })
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('\n👋 Servidor cerrado correctamente')
  process.exit(0)
})

start()
