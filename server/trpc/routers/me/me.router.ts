import { z } from 'zod'
import type { User } from '@prisma/client'

import { TRPCError } from '@trpc/server'
import { defaultUserSelect } from '~/server/trpc/routers/user/user.select'
import { protectedProcedure, router } from '~/server/trpc/trpc'

export const meRouter = router({
  get: protectedProcedure
    .meta({ participants: true })
    .query(async ({ ctx }) => {
      if (await ctx.cache.users.hasItem(ctx.session.user.id))
        return await ctx.cache.users.getItem<User>(ctx.session.user.id)

      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        select: defaultUserSelect,
      })

      await ctx.cache.users.setItem(ctx.session.user.id, user)
      return user
    }),
  update: protectedProcedure
    .meta({ participants: true })
    .input(
      z.object({
        name: z.string().min(1),
        nric: z.string().regex(/\d{3}[A-Z]/),
        phone: z.string().regex(/[689]\d{3}\s\d{4}/),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyTurnstileToken(input.token)).success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed captcha. Please try again.',
        })
      }

      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          nric: input.nric,
          phone: input.phone,
        },
      })
      await ctx.cache.users.setItem(ctx.session.user.id, user)

      return user
    }),
})
