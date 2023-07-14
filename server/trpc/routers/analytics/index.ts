import { z } from 'zod'
import { adminProtectedProcedure, participantProtectedProcedure, router } from '../../trpc'
import type { SurveyResponseSchema, SurveySchema } from '../../../../shared/survey'

// TODO probably need a better name for all the functions here
export const analyticsRouter = router({
  myResponses: participantProtectedProcedure.query(async ({ ctx }) => {
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
    return data?.surveyResponses
  }),

  listResponses: adminProtectedProcedure.input(
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

    return {
      ...data,
      schema: data.schema as SurveySchema,
    }
  }),

  chartResponses: adminProtectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    const [responses, survey] = await Promise.all([ctx.prisma.response.findMany({
      where: {
        surveyId: input.id,
      },
    }), ctx.prisma.survey.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    })])

    const surveySchema = survey.schema as SurveySchema

    /**
     * [
     *  { // Question 1
     *    "A label": 10,
     *    "Another label": 20,
     *  }
     * ]
     */
    const labels: (Record<string, number>)[] = Array.from({ length: surveySchema.length }).map(() => ({}))

    for (const idx in responses) { // For every response
      const responseData = responses[idx].data as SurveyResponseSchema

      for (const qnIdx in responseData) { // For every question in response
        const qnData = responseData[qnIdx]

        if (qnData.type === 'mcq') {
          const textOption = surveySchema[qnIdx].options[qnData.option]
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
