import type { SessionConfig } from 'h3'
import { prefixStorage } from 'unstorage'

const baseStorage = useStorage('redis')
const userStorage = prefixStorage(baseStorage, 'users')
const surveyStorage = prefixStorage(baseStorage, 'surveys')

export default defineEventHandler(async (event) => {
  const config: SessionConfig = {
    name: useRuntimeConfig().sessionName,
    password: useRuntimeConfig().sessionSecret,
  }

  const session = await useSession(event, config)
  if (!session.data.id) {
    return createError({
      status: 403,
    })
  }

  await Promise.all([
    userStorage.clear(),
    surveyStorage.clear(),
  ])

  return { ok: true }
})
