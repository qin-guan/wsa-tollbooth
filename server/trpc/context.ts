import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event, SessionConfig } from 'h3'

import type { HttpLogger } from 'pino-http'
import pino from 'pino-http'
import pinoPretty from 'pino-pretty'
import axiomPino from '@axiomhq/pino'
import { isDevelopment } from 'std-env'

let logger: HttpLogger

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(_event: H3Event) {
  if (!logger) {
    if (isDevelopment) {
      logger = pino(pinoPretty({
        colorize: true,
      }))
    }
    else {
      logger = pino(await axiomPino({
        dataset: useRuntimeConfig().axiom.dataset,
        token: useRuntimeConfig().axiom.token,
      }))
    }
  }

  // TODO better logging for this
  logger(_event.node.req, _event.node.res)

  const config: SessionConfig = {
    name: useRuntimeConfig().sessionName,
    password: useRuntimeConfig().sessionSecret,
  }

  return {
    prisma,
    session: await useSession(_event, config),
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
