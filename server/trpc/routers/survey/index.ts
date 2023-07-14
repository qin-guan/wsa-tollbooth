import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'
import { adminProtectedProcedure, participantProtectedProcedure, router } from '../../trpc'
import type { SurveySchema } from '~/shared/survey'
import { surveyResponseSchema, surveySchema } from '~/shared/survey'

export const surveyRouter = router({
  get: participantProtectedProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    try {
      const [survey, submissionCount] = await Promise.all([
        ctx.prisma.survey.findUniqueOrThrow({ where: { id: input.id } }),
        ctx.prisma.response.count({
          where: {
            respondentId: ctx.session.user.id,
            surveyId: input.id,
          },
        })])

      return {
        ...survey,
        schema: survey.schema as SurveySchema,
        submissionCount,
      }
    }
    catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Survey not found',
            cause: err,
          })
        }
      }
    }
  }),

  respond: participantProtectedProcedure.input(z.object({
    id: z.string(),
    data: surveyResponseSchema,
  })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.response.create({
      data: {
        surveyId: input.id,
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

  list: adminProtectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.admin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      })
    }

    return await ctx.prisma.survey.findMany()
  }),

  create: adminProtectedProcedure.input(
    z.object({
      title: z.string(),
      description: z.string(),
      workshop: z.boolean(),
      schema: surveySchema,
    }),
  ).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.survey.create({
      data: input,
    })
  }),

  update: adminProtectedProcedure.input(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      workshop: z.boolean(),
      schema: surveySchema,
    }),
  ).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.survey.update({
      where: { id: input.id },
      data: input,
    })
  }),
})
