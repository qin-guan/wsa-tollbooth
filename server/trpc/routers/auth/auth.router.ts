import { emailSessionRouter } from './email.router'
import { router } from '~/server/trpc/trpc'

export const authRouter = router({
  email: emailSessionRouter,
})

// export type definition of API
export type AuthRouter = typeof authRouter
