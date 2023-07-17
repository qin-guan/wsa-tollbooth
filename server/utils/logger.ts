import type { HttpLogger } from 'pino-http'
import pino from 'pino-http'
import { isDevelopment } from 'std-env'

const pinoOptions = isDevelopment
  ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }
  : {
      transport: {
        target: '@axiomhq/pino',
        options: {
          dataset: useRuntimeConfig().axiom.dataset,
          token: useRuntimeConfig().axiom.token,
        },
      },
    }

const globalForPino = globalThis as unknown as { pino: HttpLogger }

export const logger
  = globalForPino.pino || pino(pinoOptions)

if (isDevelopment)
  globalForPino.pino = logger
