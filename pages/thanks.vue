<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import InputMask from 'primevue/inputmask'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'
import { TRPCClientError } from '@trpc/client'

definePageMeta({
  middleware: ['participant'],
})

useSeoMeta({
  title: 'Thanks',
})

const route = useRoute()

const toast = useToast()
const { $client } = useNuxtApp()

const { data: responses, pending: responsesPending, error: responsesError } = await $client.response.submitted.useQuery(undefined, { lazy: true })
const { data: survey, pending: surveyPending } = await $client.survey.get.useQuery({ id: route.query.id as string }, { lazy: true })
const { data: me } = await $client.me.get.useQuery(undefined, { lazy: true })

const formData = reactive({
  name: '',
  nric: '',
  phone: '',
  token: '',
  pending: false,
  showDetails: true,
})

const eligibleForLuckyDraw = computed(() => {
  if (responsesPending.value || responsesError.value)
    return false

  if (responses.value.length > 1)
    return true
  if (responses.value.find(x => x.survey.workshop))
    return true

  return false
})

const progresses = computed(() => {
  if (!responses.value) {
    return {
      booths: 0,
      workshops: 0,
    }
  }
  return {
    booths: responses.value.filter(x => !x.survey.workshop).length / 2 * 100,
    workshops: responses.value.filter(x => x.survey.workshop).length / 1 * 100,
  }
})

watch(me, (value) => {
  if (value) {
    formData.name = value.name ?? ''
    formData.nric = value.nric ?? ''
    formData.phone = value.phone ?? ''

    if (value.name && value.nric && value.phone)
      formData.showDetails = false
  }
}, { immediate: true })

async function create() {
  formData.pending = true
  try {
    await $client.me.update.mutate({
      name: formData.name,
      nric: formData.nric,
      phone: formData.phone,
      token: formData.token,
    })
    toast.add({
      summary: 'Profile updated!',
      detail: 'Successfully registered for lucky draw!',
    })
    formData.showDetails = false
  }
  catch (err) {
    console.error(err)
    if (err instanceof TRPCClientError) {
      if (err.data.code === 'BAD_REQUEST') {
        toast.add({
          severity: 'error',
          summary: 'Please enter a valid NRIC and phone number!',
        })
      }
    }
  }
  finally {
    formData.pending = false
  }
}
</script>

<template>
  <div p-6 lg:px-30>
    <main flex flex-col gap10>
      <div class="w-[135px]">
        <NuxtImg preload width="135px" densities="x1 x2 x3" quality="100" src="/images/logo.webp" />
      </div>

      <section>
        <Skeleton v-if="surveyPending" height="200px" />
        <span v-else flex flex-col>
          <h1 v-if="survey" text-5xl font-bold>
            Thanks for filling up {{ survey.title }}
          </h1>
          <h1 v-else text-5xl font-bold>
            Thanks for coming to World Skills ASEAN 2023!
          </h1>
          <span mt3 text-lg>
            Feel free to explore our other booths!
          </span>
        </span>
      </section>

      <Skeleton v-if="responsesPending" height="300px" />

      <template
        v-else-if="eligibleForLuckyDraw"
      >
        <Card v-if="formData.showDetails">
          <template #title>
            🎉 You're eligible for lucky draw
          </template>
          <template #subtitle>
            Stand a chance to win by updating your personal information below.
          </template>
          <template #content>
            <form flex="~ col gap6" @submit.prevent="create">
              <div class="flex flex-col gap-2">
                <label for="name">Name</label>
                <InputText id="name" v-model="formData.name" placeholder="John Smith" required type="text" aria-describedby="name-help" class="max-w-md" />
                <small id="name-help" class="sr-only">Enter your name</small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="nric">NRIC (last 4 characters)</label>
                <InputMask id="nric" v-model="formData.nric" mask="999a" placeholder="123B" required type="text" aria-describedby="nric-help" class="max-w-md" />
                <small id="nric-help" class="sr-only">Enter the last 4 characters of your NRIC</small>
              </div>

              <div class="flex flex-col gap-2">
                <label for="phone">Phone number</label>
                <InputMask id="phone" v-model="formData.phone" date="phone" mask="9999 9999" placeholder="8888 8888" required aria-describedby="phone-help" class="max-w-md" />
                <small id="phone-help" class="sr-only">Enter the last 4 characters of your NRIC</small>
              </div>

              <div>
                <NuxtTurnstile v-model="formData.token" />
                <br>
                <Button label="Submit!" type="submit" size="small" :loading="formData.pending" />
              </div>
            </form>
          </template>
        </Card>
        <Card v-else>
          <template #title>
            🎉 You're all set!
          </template>
          <template #subtitle>
            You're in the lucky draw! Remember to make sure your details are correct!
          </template>
          <template #content>
            <Button label="Update my details" type="button" size="small" @click="formData.showDetails = true" />
          </template>
        </Card>
      </template>
      <Card v-else>
        <template #title>
          Fill out more forms to participate in the lucky draw!
        </template>
        <template #subtitle>
          Stand a chance to win by going for:
          <ul list-disc list-inside>
            <li>
              1 workshop
            </li>
            <li>
              2 booths
            </li>
          </ul>
        </template>
        <template #content>
          <div flex flex-col gap3>
            <div>
              <span>Booths</span>
              <br>
              <ProgressBar :value="progresses.booths" />
              <div />
            </div>
            <div>
              <span>Workshops</span>
              <br>
              <ProgressBar :value="progresses.workshops" />
            </div>
          </div>
        </template>
      </Card>

      <section>
        <h2 text-2xl font-semibold>
          Your completed surveys
        </h2>

        <Skeleton v-if="responsesPending" />

        <DashboardError v-else-if="responsesError" v-bind="responsesError" />

        <div v-else-if="responses.length === 0" class="mt3 flex justify-center rounded-lg bg-$surface-card px4 py20">
          <span text-center text-xl>No surveys completed.</span>
        </div>

        <div v-else mt6 grid="~ cols-1 md:cols-2 lg:cols-3 gap-3">
          <div v-for="response in responses" :key="response.id" class="rounded-lg bg-$surface-card p-3">
            <div flex items-center justify-between>
              <span text-xl font-semibold>
                {{ response.survey.title }}
              </span>
              <Badge v-if="response.survey.workshop" value="Workshop" />
              <Badge v-else value="Booth" severity="warning" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
