export default defineNuxtRouteMiddleware(async () => {
  const { $client } = useNuxtApp()

  const { data } = await $client.me.get.useQuery()
  if (data.value?.id)
    return '/dashboard'
})
