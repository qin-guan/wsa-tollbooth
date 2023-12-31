import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { render } from '@qingu/vue-email'
import { createSSRApp } from 'vue'

import { VerificationError } from './auth.error'
import { verifyToken } from './auth.service'
import { createTokenHash, createVfnToken } from './email.service'
import { publicProcedure, router } from '~/server/trpc/trpc'
import { VerificationCodeEmail } from '~/server/emails/verification-code'
import { defaultUserSelect } from '~/server/trpc/routers/user/user.select'

const admins = [
  'qinguan20040914@gmail.com',
  'cattolation@protonmail.com',
  's10223298@connect.np.edu.sg',
  'skyruspreyas@gmail.com',
  's10221930@connect.np.edu.sg',
]

export const emailSessionRouter = router({
  // Generate OTP.
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await verifyTurnstileToken(input.token)).success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed captcha. Please try again.',
        })
      }

      // TODO: instead of storing expires, store issuedAt to calculate when the next otp can be re-issued
      // TODO: rate limit this endpoint also
      const expires = new Date(Date.now() + useRuntimeConfig().otpExpiry * 1000)
      const token = createVfnToken()
      const hashedToken = createTokenHash(token, input.email)

      // May have one of them fail,
      // so users may get an email but not have the token saved, but that should be fine.
      const [_, html] = await Promise.all([
        ctx.prisma.verificationToken.upsert({
          where: {
            identifier: input.email,
          },
          update: {
            token: hashedToken,
            expires,
            attempts: 0,
          },
          create: {
            identifier: input.email,
            token: hashedToken,
            expires,
          },
        }),
        render(createSSRApp(VerificationCodeEmail, { appName: useRuntimeConfig().public.appName, verificationCode: token })),
      ])

      await ctx.resend.sendEmail({
        from: useRuntimeConfig().resend.fromAddress,
        to: input.email,
        subject: `${useRuntimeConfig().public.appName} - Login verification code`,
        html,
      })

      return input.email
    }),

  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      await ctx.session.clear()
      return true
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().length(6),
      }),
    )
    .mutation(async ({ ctx, input: { email, otp } }) => {
      try {
        await verifyToken(ctx.prisma, {
          token: otp,
          email,
        })
      }
      catch (e) {
        if (e instanceof VerificationError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: e.message,
            cause: e,
          })
        }
        throw e
      }

      let user = await ctx.prisma.user.findFirst({
        where: { email },
      })

      const data = {
        email,
        name: email.split('@')[0],
        admin: admins.includes(email),
      }
      if (user === null) {
        await ctx.prisma.user.create({
          data,
          select: defaultUserSelect,
        })
      }
      else {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data,
        })
      }

      user = await ctx.prisma.user.findFirstOrThrow({
        where: { email },
      })

      await ctx.session.update({
        id: user.id,
      })

      return user
    }),
})
