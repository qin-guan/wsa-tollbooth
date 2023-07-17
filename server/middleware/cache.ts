import type { Storage } from 'unstorage'
import { prefixStorage } from 'unstorage'

const baseStorage = useStorage('redis')
const userStorage = prefixStorage(baseStorage, 'users')
const surveyStorage = prefixStorage(baseStorage, 'surveys')

declare module 'h3' {
  interface H3EventContext {
    cache: {
      users: Storage
      surveys: Storage
    }
  }
}

// I don't think theres a huge perf hit when using globals for cache, but for consistency sake maybe it's better to pass through context
export default defineEventHandler((event) => {
  event.context.cache = {
    users: userStorage,
    surveys: surveyStorage,
  }
})
