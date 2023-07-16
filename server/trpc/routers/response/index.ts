import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../../trpc'
import type { SurveyPermissionSchema } from '~/shared/survey'
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

  // This has participants: true as users with access to individual survey analytics needs this procedure
  list: surveyProtectedProcedure
    .meta({ participants: true })
    .use(async ({ ctx, input, next }) => {
      if (ctx.session.user.admin)
        return next()

      const survey = await ctx.prisma.survey.findUniqueOrThrow({
        where: {
          id: input.surveyId,
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
