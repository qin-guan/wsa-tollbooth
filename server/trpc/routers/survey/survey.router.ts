import type { Survey } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure, publicProcedure, router } from '~/server/trpc/trpc'

import type { QuestionsSchema, SurveyPermissionSchema } from '~/shared/survey'
import { questionsSchema, surveyPermissionSchema } from '~/shared/survey'

const ALL_SURVEYS_KEY = '__all_surveys'
const RESPONSE_COUNT_KEY = '__response_count'

export const surveyRouter = router({
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
    let [surveys, responseCount] = await Promise.all([
      ctx.cache.surveys.getItem<Survey[]>(ALL_SURVEYS_KEY),
      ctx.cache.surveys.getItem<{
        surveyId: string
        _count: {
          _all: number
        }
      }[]>(RESPONSE_COUNT_KEY),
    ])

    surveys ??= await ctx.prisma.survey.findMany()
    responseCount ??= await ctx.prisma.response.groupBy({
      by: ['surveyId'],
      _count: {
        _all: true,
      },
    })

    await Promise.all([
      ctx.cache.surveys.setItem(ALL_SURVEYS_KEY, surveys),
      ctx.cache.surveys.setItem(RESPONSE_COUNT_KEY, responseCount),
    ])

    const result = surveys.map(r => ({ responseCount: 0, ...r }))

    for (const { surveyId, _count } of responseCount) {
      const survey = result.find(s => s.id === surveyId)
      if (!survey)
        continue

      survey.responseCount = _count._all
    }

    return result
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

    await Promise.all([
      ctx.cache.surveys.setItem(survey.id, survey),
      ctx.cache.surveys.removeItem(ALL_SURVEYS_KEY),
    ])

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
