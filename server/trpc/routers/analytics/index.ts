import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../../trpc'
import { surveySchema } from '../../../../shared/survey'

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
    const data = await ctx.prisma.survey.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      include: {
        responses: {
          include: {
            respondent: true,
          },
        },
      },
    })

    const result = await surveySchema.safeParseAsync(data.schema)
    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: result.error,
      })
    }

    return {
      ...data,
      schema: result.data,
    }
  }),
})
