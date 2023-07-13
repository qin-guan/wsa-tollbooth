import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { render } from '@qingu/vue-email'
import { createSSRApp } from 'vue'

import { verifyToken } from '../../services/auth'
import { VerificationError } from '../../services/auth.error'
import { publicProcedure, router } from '../../trpc'
import type { UserSessionData } from '../../../utils/session'
import { VerificationCodeEmail } from '../../../emails/VerificationCodeEmail'

const admins = [
  'qinguan20040914@gmail.com',
]

export const emailSessionRouter = router({
  // Generate OTP.
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input: { email } }) => {
      // TODO: instead of storing expires, store issuedAt to calculate when the next otp can be re-issued
      // TODO: rate limit this endpoint also
      const expires = new Date(Date.now() + useRuntimeConfig().otpExpiry * 1000)
      const token = createVfnToken()
      const hashedToken = createTokenHash(token, email)

      // May have one of them fail,
      // so users may get an email but not have the token saved, but that should be fine.
      const [_, html] = await Promise.all([
        ctx.prisma.verificationToken.upsert({
          where: {
            identifier: email,
          },
          update: {
            token: hashedToken,
            expires,
            attempts: 0,
          },
          create: {
            identifier: email,
            token: hashedToken,
            expires,
          },
        }),
        render(createSSRApp(VerificationCodeEmail, { appName: useRuntimeConfig().public.appName, verificationCode: token })),
      ])
      await resend.sendEmail({
        from: useRuntimeConfig().resend.fromAddress,
        to: email,
        subject: `${useRuntimeConfig().public.appName} - Login verification code`,
        html,
      })
      return email
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

      const user = await ctx.prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: email.split('@')[0],
          admin: admins.includes(email),
        },
        select: defaultUserSelect,
      })

      await ctx.session.update<UserSessionData>({
        id: user.id,
      })

      await ctx.session.seal()

      return user
    }),
})
