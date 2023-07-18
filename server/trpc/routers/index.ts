import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { authRouter } from './auth/auth.router'
import { meRouter } from './me/me'
import { surveyRouter } from './survey/survey'
import { analyticsRouter } from './analytics/analytics'
import { responseRouter } from './response/response'
import { luckyDrawRouter } from './lucky-draw/lucky-draw'

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
  luckyDraw: luckyDrawRouter,
  me: meRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
