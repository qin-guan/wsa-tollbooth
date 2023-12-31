import type { SessionConfig } from 'h3'

export default defineEventHandler(async (event) => {
  const baseStorage = useStorage('redis')

  const config: SessionConfig = {
    name: useRuntimeConfig().sessionName,
    password: useRuntimeConfig().sessionSecret,
  }

  const session = await useSession(event, config)
  if (!session.data.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized',
    })
  }

  await baseStorage.clear()

  return { ok: true }
})
