export default defineNuxtRouteMiddleware(async () => {
  const { $client } = useNuxtApp()

  const { error } = await $client.me.get.useQuery()
  if (error.value?.data?.code === 'UNAUTHORIZED')
    return '/'
})
