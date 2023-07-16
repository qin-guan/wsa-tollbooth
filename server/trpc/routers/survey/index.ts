import type { Survey } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prefixStorage } from 'unstorage'
import type { QuestionsSchema, SurveyPermissionSchema } from '../../../../shared/survey'
import { questionsSchema, surveyPermissionSchema } from '../../../../shared/survey'
import { protectedProcedure, router } from '../../trpc'

const baseStorage = useStorage('redis')
const surveyStorage = prefixStorage(baseStorage, 'surveys')

export const surveyRouter = router({
  get: protectedProcedure.meta({ participants: true }).input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    if (await surveyStorage.hasItem(input.id)) {
      const survey = await surveyStorage.getItem<Survey>(input.id)
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

      await surveyStorage.setItem(input.id, survey)

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
    if (await surveyStorage.hasItem('__all_surveys'))
      return await surveyStorage.getItem<Survey[]>('__all_surveys') ?? []

    const surveys = await ctx.prisma.survey.findMany()
    await surveyStorage.setItem('__all_surveys', surveys)

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

      await surveyStorage.setItem(survey.id, survey)

      return {
        ...survey,
        questions: survey.questions as QuestionsSchema,
        // Fallback to [] as it could be null
        permissions: (survey.permissions ?? []) as SurveyPermissionSchema,
      }
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

    await surveyStorage.setItem(survey.id, survey)

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

    await surveyStorage.removeItem(input.id)
  }),
})
