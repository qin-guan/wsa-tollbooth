import { protectedProcedure, router } from '../../trpc'

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: defaultUserSelect,
    })
  }),
})
