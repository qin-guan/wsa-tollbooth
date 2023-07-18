import type { HttpLogger } from 'pino-http'
import pino from 'pino-http'
import axiomPino from '@axiomhq/pino'
import { isDevelopment } from 'std-env'

let logger: HttpLogger

export default defineEventHandler(async (event) => {
  if (!logger) {
    if (isDevelopment) {
      logger = pino()
    }
    else {
      logger = pino(await axiomPino({
        dataset: useRuntimeConfig().axiom.dataset,
        token: useRuntimeConfig().axiom.token,
      }))
    }
  }

  logger(event.node.req, event.node.res)
})
