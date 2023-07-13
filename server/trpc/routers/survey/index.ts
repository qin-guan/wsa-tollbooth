import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, publicProcedure, router } from '../../trpc'

const questionSchema = z.object({
  type: z.enum(['text', 'mcq']),
  title: z.string(),
  description: z.string(),
  options: z.array(z.string()),
})

const surveySchema = z.array(questionSchema)

const textQuestionResponseSchema = z.object({
  type: z.literal('text'),
  answer: z.string(),
})

const mcqQuestionResponseSchema = z.object({
  type: z.literal('mcq'),
  option: z.number(),
})

const questionResponseSchema = z.discriminatedUnion('type', [
  textQuestionResponseSchema,
  mcqQuestionResponseSchema,
])

const surveyResponseSchema = z.array(questionResponseSchema)

export const surveyRouter = router({
  get: publicProcedure.input(z.object({
    id: z.string(),
  })).query(async ({ ctx, input }) => {
    const survey = await ctx.prisma.survey.findUniqueOrThrow({ where: { id: input.id } })
    const result = await surveySchema.safeParseAsync(survey.schema)
    if (!result.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      })
    }

    return {
      ...survey,
      schema: result.data,
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
  respond: protectedProcedure.input(z.object({
    id: z.string(),
    data: surveyResponseSchema,
  })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.response.create({
      data: {
        surveyId: input.id,
        respondentId: ctx.session.user.id,
        data: input.data,
      },
    })
  }),
})
