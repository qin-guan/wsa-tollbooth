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
import type { Context } from '~/server/trpc/context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

const adminAuthMiddleware = t.middleware(async ({ next, ctx }) => {
  const session = await ctx.session.get()
  if (!session.data.id)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  // this code path is needed if a user does not exist in the database as they were deleted, but the session was active before
  const user = await prisma.user.findUnique({
    where: { id: session.data.id, admin: true },
  })

  if (user === null)
    throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({
    ctx: {
      session: {
        user,
      },
    },
  })
})

const temporarySessionMiddleware = t.middleware(async ({ next, ctx }) => {
  const session = await ctx.session.get()

  let user
  if (session.data.id) {
    user = await prisma.user.findUniqueOrThrow({
      where: { id: session.data.id },
    })
  }
  else {
    user = await ctx.prisma.user.create({
      data: {
        admin: false,
      },
    })
  }

  await ctx.session.update({
    id: user.id,
  })
  await ctx.session.seal()

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
export const adminProtectedProcedure = t.procedure
  .use(adminAuthMiddleware)

export const participantProtectedProcedure = t.procedure
  .use(temporarySessionMiddleware)

export const router = t.router
export const middleware = t.middleware
