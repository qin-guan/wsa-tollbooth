import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { authRouter } from './auth/auth.router'
import { meRouter } from './me/me.router'
import { surveyRouter } from './survey/survey.router'
import { analyticsRouter } from './analytics/analytics.router'
import { responseRouter } from './response/response.router'
import { luckyDrawRouter } from './lucky-draw/lucky-draw.router'

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
