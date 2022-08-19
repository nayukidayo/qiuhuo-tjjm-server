import process from 'node:process'
import Fastify from 'fastify'

const f = Fastify({
  logger: {
    level: 'warn',
    file: './log/error.log',
  },
})

f.setErrorHandler(async (err, req, res) => {
  if (err.validation) {
    f.log.warn(err)
    res.code(400)
    return { err: 4001, msg: err.message }
  }
  f.log.error(err)
  res.code(500)
  return { err: 5001, msg: '服务器未知错误' }
})

!(async () => {
  try {
    await f.register(import('./store.js'))
    await f.register(import('./mqtt.js'))
    await f.register(import('./routes.js'), { prefix: '/api' })
    await f.listen({ host: '0.0.0.0', port: 50007 })
  } catch (err) {
    f.log.fatal(err)
    process.exit(1)
  }
})()
