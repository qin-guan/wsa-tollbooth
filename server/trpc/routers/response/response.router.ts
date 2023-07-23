import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Prisma, Response, Survey, User } from '@prisma/client'

import { protectedProcedure, publicProcedure, router } from '~/server/trpc/trpc'
import type { SurveyPermissionSchema } from '~/shared/survey'
import { surveyResponseSchema } from '~/shared/survey'

const surveyProtectedProcedure = protectedProcedure.input(
  z.object({
    surveyId: z.string(),
  }),
)

const surveyPublicProcedure = publicProcedure.input(
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
      if (await ctx.cache.surveys.hasItem(`${ctx.session.user.id}-submitted`)) {
        data = await ctx.cache.surveys.getItem<UserIncludeSurvey>(`${ctx.session.user.id}-submitted`)
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
        await ctx.cache.surveys.setItem(`${ctx.session.user.id}-submitted`, data)
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
      let data = await ctx.cache.surveys.getItem<Response[]>(`${input.surveyId}-responses`)
      data ??= await ctx.prisma.response.findMany({
        where: {
          surveyId: input.surveyId,
        },
      })

      await ctx.cache.surveys.setItem(`${input.surveyId}-responses`, data)

      return data
    }),

  create: surveyPublicProcedure
    .input(
      z.object({
        data: surveyResponseSchema,
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyTurnstileToken(input.token)).success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed captcha. Please try again.',
        })
      }

      let user
      if (!ctx.session.data.id) {
        user = await ctx.prisma.user.create({
          data: {
            admin: false,
          },
        })
        await ctx.session.update({
          id: user.id,
        })
      }
      else {
        user = await ctx.cache.users.getItem<User>(ctx.session.data.id)
        user ??= await ctx.prisma.user.findUnique({
          where: { id: ctx.session.data.id },
        })

        if (user === null)
          throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      await Promise.all([
        ctx.prisma.response.create({
          data: {
            surveyId: input.surveyId,
            respondentId: user.id,
            data: input.data,
          },
        }),
        ctx.cache.surveys.removeItem(`${user.id}-submitted`),
        ctx.cache.surveys.removeItem(`${input.surveyId}-responses`),
      ])

      return true
    }),
})
