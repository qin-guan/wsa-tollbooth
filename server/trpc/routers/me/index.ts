import { z } from 'zod'
import { protectedProcedure, router } from '../../trpc'

export const meRouter = router({
  get: protectedProcedure
    .meta({ participants: true })
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        select: defaultUserSelect,
      })
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
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
    }),
})
