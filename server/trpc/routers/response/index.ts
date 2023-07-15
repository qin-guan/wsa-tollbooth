import { z } from 'zod'
import { protectedProcedure, router } from '../../trpc'
import { surveyResponseSchema } from '~/shared/survey'

const surveyProtectedProcedure = protectedProcedure.input(
  z.object({
    surveyId: z.string(),
  }),
)

export const responseRouter = router({
  submitted: protectedProcedure
    .meta({ participants: true })
    .query(async ({ ctx }) => {
      const data = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          surveyResponses: {
            include: {
              survey: true,
            },
          },
        },
      })

      return data.surveyResponses
    }),

  list: surveyProtectedProcedure.query(async ({ ctx, input }) => {
    const data = await ctx.prisma.response.findMany({
      where: {
        surveyId: input.surveyId,
      },
      include: {
        respondent: true,
      },
    })

    return data
  }),

  create: surveyProtectedProcedure.meta({ participants: true }).input(
    z.object({
      data: surveyResponseSchema,
    }),
  ).mutation(async ({ ctx, input }) => {
    await ctx.prisma.response.create({
      data: {
        surveyId: input.surveyId,
        respondentId: ctx.session.user.id,
        data: input.data,
      },
    })

    return ctx.prisma.response.count({
      where: {
        respondentId: ctx.session.user.id,
      },
    })
  }),
})
