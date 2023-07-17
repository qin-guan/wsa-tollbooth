import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event, SessionConfig } from 'h3'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(_event: H3Event) {
  const config: SessionConfig = {
    name: useRuntimeConfig().sessionName,
    password: useRuntimeConfig().sessionSecret,
  }

  return {
    prisma: _event.context.prisma,
    resend: _event.context.resend,
    session: await useSession(_event, config),
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
