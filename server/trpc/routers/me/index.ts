import { z } from 'zod'
import { createStorage, prefixStorage } from 'unstorage'
import type { User } from '@prisma/client'
import { protectedProcedure, router } from '../../trpc'

const baseStorage = createStorage()
const userStorage = prefixStorage(baseStorage, 'users')

export const meRouter = router({
  get: protectedProcedure
    .meta({ participants: true })
    .query(async ({ ctx }) => {
      if (await userStorage.hasItem(ctx.session.user.id)) {
        console.log('cached from redis')
        return await userStorage.getItem<User>(ctx.session.user.id)
      }

      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        select: defaultUserSelect,
      })

      await userStorage.setItem(ctx.session.user.id, user)
      return user
    }),
  update: protectedProcedure
    .meta({ participants: true }).input(
      z.object({
        name: z.string(),
        nric: z.string().regex(/\d{3}[A-Z]/),
        phone: z.string().regex(/[689]\d{3}\s\d{4}/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
      await userStorage.setItem(ctx.session.user.id, user)
      return user
    }),
})
