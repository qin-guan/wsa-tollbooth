import { z } from 'zod'

const questionSchema = z.object({
  type: z.enum(['text', 'mcq']),
  title: z.string(),
  description: z.string(),
  options: z.array(z.string()),
})

export const questionsSchema = z.array(questionSchema)

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

export const surveyResponseSchema = z.array(questionResponseSchema)

export type QuestionResponseSchema = z.infer<typeof questionResponseSchema>
export type SurveyResponseSchema = z.infer<typeof surveyResponseSchema>
export type QuestionsSchema = z.infer<typeof questionsSchema>

export const surveyPermissionSchema = z.array(z.object({
  email: z.string(),
  permission: z.enum(['read']),
}))

export type SurveyPermissionSchema = z.infer<typeof surveyPermissionSchema>
