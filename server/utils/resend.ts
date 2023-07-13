import { Resend } from 'resend'
import { isDevelopment } from 'std-env'

const globalForResend = globalThis as unknown as { resend: Resend }

export const resend
  = globalForResend.resend || new Resend(useRuntimeConfig().resend.apiKey)

if (isDevelopment)
  globalForResend.resend = resend
