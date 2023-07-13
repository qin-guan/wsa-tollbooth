import { z } from 'zod'
import { createConsola } from 'consola'

const log = createConsola()

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const client = z.object({
  public: z.object({
    appName: z.string().optional(),
  }),
})

const resendSchema = z.object({
  resend: z.object({
    apiKey: z.string(),
    fromAddress: z.union([
      z.string().email(),
      z.string().length(0),
    ]),
  }),
})

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z
  .object({
    databaseUrl: z.string().url(),
    otpExpiry: z.coerce.number().positive().optional().default(600),
    postmanApiKey: z.string().optional(),
    sessionSecret: z.string().min(32),
    sessionName: z.string().optional(),
  })
  // Add on schemas as needed that requires conditional validation.
  .merge(resendSchema)
  .merge(client)
  .refine(val => !(val.resend.apiKey && !val.resend.fromAddress), {
    message: 'resend.fromAddress is required when resend.apiKey is set',
    path: ['resend.fromAddress'],
  })

let init = false
export default defineNuxtPlugin(() => {
  if (init)
    return

  const config = useRuntimeConfig()

  if (config.skipEnvValidation) {
    log.info('skipping env validation')
    return
  }

  log.info('running env validation')

  const parsed = server.safeParse(config)
  if (!parsed.success) {
    log.error('invalid environment variables: \n', parsed.error.flatten().fieldErrors)
    return
  }

  log.info('passed env validation')
  init = true
})
