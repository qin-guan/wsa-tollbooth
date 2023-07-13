import { z } from 'zod'
import { protectedProcedure, router } from '../../trpc'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: defaultUserSelect,
    })
  }),
  updateAvatar: protectedProcedure
    .input(
      z.object({
        imageKey: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          image: `https://${useRuntimeConfig().r2.publicHostname}/${input.imageKey}`,
        },
        select: defaultUserSelect,
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: defaultUserSelect,
      })
    }),
})
