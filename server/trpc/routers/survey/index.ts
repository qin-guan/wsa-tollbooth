import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../../trpc'
import { surveyResponseSchema, surveySchema } from '~/shared/survey'

export const surveyRouter = router({
  get: protectedProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const [survey, submissionCount] = await Promise.all([
      ctx.prisma.survey.findUniqueOrThrow({ where: { id: input.id } }),
      ctx.prisma.response.count({
        where: {
          respondentId: ctx.session.user.id,
          surveyId: input.id,
        },
      })])
    const result = await surveySchema.safeParseAsync(survey.schema)
    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      })
    }

    return {
      ...survey,
      schema: result.data,
      submissionCount,
    }
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.admin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      })
    }

    return await ctx.prisma.survey.findMany()
  }),
  create: protectedProcedure.input(
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
  update: protectedProcedure.input(
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
  respond: protectedProcedure.input(z.object({
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
})
