/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { OpenApiMeta } from 'trpc-nuxt'
import type { Context } from '~/server/trpc/context'

interface Meta {
  // Accessible by participants
  participants: boolean
}

const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    defaultMeta: {
      participants: false,
    },
  })

const authMiddleware = t.middleware(async (opts) => {
  const { next, ctx, meta } = opts

  let user
  if (!ctx.session.data.id) {
    if (!meta?.participants)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    user = await ctx.prisma.user.create({
      data: {
        admin: false,
      },
    })

    await ctx.session.update({
      id: user.id,
    })
  }
  else {
    user = await prisma.user.findUnique({
      where: { id: ctx.session.data.id },
    })
    if (user === null)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    if (!meta?.participants && !user.admin)
      throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      session: {
        user,
      },
    },
  })
})

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure

/**
 * Create a protected procedure
 **/
export const protectedProcedure = t.procedure
  .use(authMiddleware)

export const router = t.router
export const middleware = t.middleware
