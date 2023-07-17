import type { Survey } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { QuestionsSchema, SurveyPermissionSchema } from '../../../../shared/survey'
import { questionsSchema, surveyPermissionSchema } from '../../../../shared/survey'
import { protectedProcedure, router } from '../../trpc'

const ALL_SURVEYS_KEY = '__all_surveys'

export const surveyRouter = router({
  get: protectedProcedure.meta({ participants: true }).input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    if (await ctx.cache.surveys.hasItem(input.id)) {
      const survey = await ctx.cache.surveys.getItem<Survey>(input.id)
      if (!survey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        })
      }

      return {
        ...survey,
        questions: survey?.questions as QuestionsSchema,
        // Fallback to [] as it could be null
        permissions: (survey?.permissions ?? []) as SurveyPermissionSchema,
      }
    }

    try {
      const survey = await ctx.prisma.survey.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      })

      await ctx.cache.surveys.setItem(input.id, survey)

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
    if (await ctx.cache.surveys.hasItem(ALL_SURVEYS_KEY))
      return await ctx.cache.surveys.getItem<Survey[]>(ALL_SURVEYS_KEY) ?? []

    const surveys = await ctx.prisma.survey.findMany()
    await ctx.cache.surveys.setItem(ALL_SURVEYS_KEY, surveys)

    return surveys
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
    )
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        workshop: z.boolean(),
        questions: questionsSchema,
        permissions: surveyPermissionSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const survey = await ctx.prisma.survey.create({
        data: input,
      })

      await Promise.all([
        ctx.cache.surveys.setItem(survey.id, survey),
        ctx.cache.surveys.removeItem(ALL_SURVEYS_KEY),
      ])

      return {
        ...survey,
        questions: survey.questions as QuestionsSchema,
        // Fallback to [] as it could be null
        permissions: (survey.permissions ?? []) as SurveyPermissionSchema,
      }
    }),

  clone: protectedProcedure.input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const base = await ctx.prisma.survey.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    })

    const clone = await ctx.prisma.survey.create({
      data: {
        title: input.title ?? `Copy of ${base.title}`,
        description: base.description,
        workshop: base.workshop,
        questions: base.questions ?? {},
      },
    })

    await ctx.cache.surveys.setItem(clone.id, clone)
    await ctx.cache.surveys.removeItem(ALL_SURVEYS_KEY)

    return clone
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
    const survey = await ctx.prisma.survey.update({
      where: { id: input.id },
      data: input,
    })

    await ctx.cache.surveys.setItem(survey.id, survey)

    return survey
  }),

  delete: protectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    await ctx.prisma.survey.delete({
      where: { id: input.id },
    })

    await ctx.cache.surveys.removeItem(ALL_SURVEYS_KEY)
    await ctx.cache.surveys.removeItem(input.id)
  }),
})
