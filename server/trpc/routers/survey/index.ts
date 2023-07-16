import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { QuestionsSchema, SurveyPermissionSchema } from '../../../../shared/survey'
import { questionsSchema, surveyPermissionSchema } from '../../../../shared/survey'
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
        questions: survey.questions as QuestionsSchema,
        // Fallback to [] as it could be null
        permissions: (survey.permissions ?? []) as SurveyPermissionSchema,
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

  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/surveys' } })
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        workshop: z.boolean(),
        questions: questionsSchema,
        permissions: surveyPermissionSchema,
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
      questions: questionsSchema,
      permissions: surveyPermissionSchema,
    }),
  ).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.survey.update({
      where: { id: input.id },
      data: input,
    })
  }),
})
