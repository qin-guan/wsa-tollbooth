import { router } from '../../trpc'
import { emailSessionRouter } from './email'

export const authRouter = router({
  email: emailSessionRouter,
})

// export type definition of API
export type AuthRouter = typeof authRouter
