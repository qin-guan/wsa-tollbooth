import redisDriver from 'unstorage/drivers/redis'
import memoryDriver from 'unstorage/drivers/memory'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = useRuntimeConfig().redis.enabled
    ? redisDriver({
      base: 'redis',
      host: useRuntimeConfig().redis.host,
      port: useRuntimeConfig().redis.port,
      username: useRuntimeConfig().redis.username,
      password: useRuntimeConfig().redis.password,
    })
    : memoryDriver()

  storage.mount('redis', driver)
})
