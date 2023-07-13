import { z } from 'zod'
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
  listResponses: protectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    return await ctx.prisma.response.findMany({
      where: {
        surveyId: input.id,
      },
    })
  }),
})
