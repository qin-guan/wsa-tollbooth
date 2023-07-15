import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { SurveySchema } from '../../../../shared/survey'
import { surveySchema } from '../../../../shared/survey'
import { protectedProcedure, router } from '../../trpc'

export const surveyRouter = router({
  get: protectedProcedure.meta({ participants: true }).input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    try {
      const survey = await ctx.prisma.survey.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      })

      return {
        ...survey,
        schema: survey.schema as SurveySchema,
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

  list: protectedProcedure.query(async ({ ctx }) => {
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
})
