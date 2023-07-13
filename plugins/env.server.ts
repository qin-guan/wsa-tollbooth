import { z } from 'zod'
import { createConsola } from 'consola'

const log = createConsola()

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const client = z.object({
  public: z.object({
    enableStorage: z.boolean(),
    enableSgid: z.boolean(),
    appName: z.string().optional(),
  }),
})

/** Feature flags */
const baseR2Schema = z.object({
  r2: z.object({
    accessKeyId: z.string().optional(),
    accountId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    publicHostname: z.string().optional(),
    avatarsBucketName: z.string().optional(),
  }),
})

const r2ServerSchema = z.object({
  r2: z.object({
    accessKeyId: z.string().min(1),
    accountId: z.string().min(1),
    secretAccessKey: z.string().min(1),
    publicHostname: z.string().min(1),
    avatarsBucketName: z.string().min(1),
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
  .merge(baseR2Schema)
  .merge(resendSchema)
  .merge(client)
  // Add on refinements as needed for conditional environment variables
  // .superRefine((val, ctx) => ...)
  .superRefine((val, ctx) => {
    if (!val.public.enableStorage)
      return

    const parse = r2ServerSchema.safeParse(val)
    if (!parse.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['public.enableStorage'],
        message: 'R2 environment variables are missing',
      })
      parse.error.issues.forEach((issue) => {
        ctx.addIssue(issue)
      })
    }
  })
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
