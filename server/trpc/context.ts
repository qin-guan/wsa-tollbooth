import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { createSessionContext } from '../utils/session'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export function createContext(_event: H3Event) {
  // TODO better logging for this
  // logger(_event.node.req, _event.node.res)

  const session = createSessionContext(_event)

  return {
    prisma,
    session,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
