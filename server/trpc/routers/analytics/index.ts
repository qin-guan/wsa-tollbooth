import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../../trpc'
import type { QuestionsSchema, SurveyPermissionSchema, SurveyResponseSchema } from '../../../../shared/survey'

// TODO probably need a better name for all the functions here
export const analyticsRouter = router({
  // This has participants: true as users with access to individual survey analytics needs this procedure
  chartResponses: protectedProcedure
    .meta({ participants: true })
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .use(async ({ ctx, input, next }) => {
      if (ctx.session.user.admin)
        return next()

      const survey = await ctx.prisma.survey.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      })
      const permissions = survey.permissions as SurveyPermissionSchema
      if (
        permissions
        && permissions.find(p =>
          p.email === ctx.session.user.email && p.permission === 'read',
        )
      )
        return next()

      throw new TRPCError({
        code: 'UNAUTHORIZED',
      })
    })
    .query(async ({ ctx, input }) => {
      const [responses, survey] = await Promise.all([ctx.prisma.response.findMany({
        where: {
          surveyId: input.id,
        },
      }), ctx.prisma.survey.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      })])

      const questionsSchema = survey.questions as QuestionsSchema

      /**
     * [
     *  { // Question 1
     *    "A label": 10,
     *    "Another label": 20,
     *  }
     * ]
     */
      const labels: (Record<string, number>)[] = Array.from({ length: questionsSchema.length }).map(() => ({}))

      for (const idx in responses) { // For every response
        const responseData = responses[idx].data as SurveyResponseSchema

        for (const qnIdx in responseData) { // For every question in response
          const qnData = responseData[qnIdx]

          if (qnData.type === 'mcq') {
            const textOption = questionsSchema[qnIdx].options[qnData.option]
            if (!labels[qnIdx][textOption])
              labels[qnIdx][textOption] = 0

            labels[qnIdx][textOption]++
          }
        }
      }

      const chartData = labels.map((qn) => {
        return {
          labels: Object.keys(qn),
          datasets: [
            {
              label: 'Responses',
              data: Object.values(qn),
            },
          ],
        }
      })

      return chartData
    }),
})
