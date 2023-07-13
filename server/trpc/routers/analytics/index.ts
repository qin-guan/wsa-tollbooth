import { protectedProcedure, router } from '../../trpc'

export const analyticsRouter = router({
  myResponses: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.survey.findMany({
      where: {
        responses: {
          every: {
            respondentId: ctx.session.user.id,
          },
        },
      },
    })
  }),
})
