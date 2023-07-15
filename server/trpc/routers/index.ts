import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { authRouter } from './auth'
import { meRouter } from './me'
import { surveyRouter } from './survey'
import { analyticsRouter } from './analytics'
import { responseRouter } from './response'

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string().nullish(),
      }),
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
        time: new Date(),
      }
    }),
  auth: authRouter,
  survey: surveyRouter,
  response: responseRouter,
  analytics: analyticsRouter,
  me: meRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
