export default defineNuxtRouteMiddleware(async () => {
  const { $client } = useNuxtApp()

  const { data, error } = await $client.me.get.useQuery()
  if (error.value?.data?.code === 'UNAUTHORIZED')
    return '/login'

  if (!data.value.admin)
    return '/thanks'
})
