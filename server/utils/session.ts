import { getSession, sealSession, unsealSession, updateSession } from 'h3'
import type { H3Event, SessionConfig, SessionData } from 'h3'

export interface UserSessionData {
  id: string
}

type SessionUpdate<T extends SessionData = SessionData> = Partial<SessionData<T>> | ((oldData: SessionData<T>) => Partial<SessionData<T>> | undefined)

export function createSessionContext(event: H3Event) {
  const config: SessionConfig = {
    name: useRuntimeConfig().sessionName,
    password: useRuntimeConfig().sessionSecret,
  }

  return {
    get<T extends SessionData<UserSessionData>>() {
      return getSession<T>(event, config)
    },
    update<T extends SessionData<UserSessionData>>(update: SessionUpdate<T>) {
      return updateSession<T>(event, config, update)
    },
    seal<T extends SessionData<UserSessionData>>() {
      return sealSession<T>(event, config)
    },
    unseal(sealed: string) {
      return unsealSession(event, config, sealed)
    },
  }
}
