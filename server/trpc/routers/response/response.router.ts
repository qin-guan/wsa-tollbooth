import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma, Survey } from '@prisma/client'

import { protectedProcedure, router } from '~/server/trpc/trpc'

import type { SurveyPermissionSchema } from '~/shared/survey'
import { surveyResponseSchema } from '~/shared/survey'

const surveyProtectedProcedure = protectedProcedure.input(
  z.object({
    surveyId: z.string(),
  }),
)

type UserIncludeSurvey = Prisma.UserGetPayload<{
  include: {
    surveyResponses: {
      include: {
        survey: true
      }
    }
  }
}>

export const responseRouter = router({
  submitted: protectedProcedure
    .meta({ participants: true })
    .query(async ({ ctx }) => {
      let data
      if (await ctx.cache.users.hasItem(`${ctx.session.user.id}-submitted`)) {
        data = await ctx.cache.users.getItem<UserIncludeSurvey>(`${ctx.session.user.id}-submitted`)
        if (!data)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      else {
        data = await ctx.prisma.user.findUniqueOrThrow({
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
        await ctx.cache.users.setItem(`${ctx.session.user.id}-submitted`, data)
      }

      return data.surveyResponses
    }),

  // This has participants: true as users with access to individual survey analytics needs this procedure
  list: surveyProtectedProcedure
    .meta({ participants: true })
    .use(async ({ ctx, input, next }) => {
      if (ctx.session.user.admin)
        return next()

      let survey
      if (await ctx.cache.surveys.hasItem(input.surveyId)) {
        survey = await ctx.cache.surveys.getItem<Survey>(input.surveyId)
        if (!survey) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
          })
        }
      }
      else {
        survey = await ctx.prisma.survey.findUniqueOrThrow({
          where: {
            id: input.surveyId,
          },
        })
      }

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

    await ctx.cache.surveys.removeItem(`${ctx.session.user.id}-submitted`)

    return ctx.prisma.response.count({
      where: {
        respondentId: ctx.session.user.id,
      },
    })
  }),
})
