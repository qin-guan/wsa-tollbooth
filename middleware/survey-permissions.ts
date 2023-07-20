export default defineNuxtRouteMiddleware(async (to) => {
  const { $client } = useNuxtApp()
  const { error } = await $client.response.list.useQuery({ surveyId: to.params.id as string })
  if (error.value?.data?.code === 'UNAUTHORIZED')
    return '/____________login'
})
