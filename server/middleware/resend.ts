import { Resend } from 'resend'

let resend: Resend

declare module 'h3' {
  interface H3EventContext {
    resend: Resend
  }
}

export default defineEventHandler((event) => {
  if (!resend)
    resend = new Resend(useRuntimeConfig().resend.apiKey)

  event.context.resend = resend
})
