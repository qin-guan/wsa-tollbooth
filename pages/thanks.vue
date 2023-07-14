<script setup lang="ts">
import InputMask from 'primevue/inputmask'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

definePageMeta({
  middleware: ['participant'],
})

const route = useRoute()
const { $client } = useNuxtApp()
const config = useRuntimeConfig()

const toast = useToast()

const { data } = await $client.analytics.myResponses.useQuery()
const { data: survey } = await $client.survey.get.useQuery({ id: route.query.id as string })
const { data: me } = await $client.me.get.useQuery()

const eligibleForLuckyDraw = computed(() => {
  if (data.value.length > 1)
    return true
  if (data.value.find(x => x.survey.workshop))
    return true
  return false
})

const formData = reactive({
  name: me.value.name ?? '',
  nric: me.value.nric ?? '',
  phone: me.value.phone ?? '',
  pending: false,
})

async function create() {
  formData.pending = true
  try {
    await $client.me.update.mutate({
      name: formData.name,
      nric: formData.nric,
      phone: formData.phone,
    })
    toast.add({
      summary: 'Profile updated!',
      detail: 'Successfully registered for lucky draw!',
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    formData.pending = false
  }
}
</script>

<template>
  <div p-6 lg:px-30>
    <header
      class="h-24 flex items-center justify-between"
    >
      <NuxtLink to="/">
        <span class="font-semibold">{{ config.public.appName }}</span>
      </NuxtLink>
    </header>
    <main flex flex-col gap10>
      <section flex flex-col>
        <h1 v-if="survey" text-5xl font-bold>
          Thanks for filling up {{ survey.title }}
        </h1>
        <h1 v-else text-5xl font-bold>
          Thanks for coming to World Skills ASEAN 2023!
        </h1>
        <span mt3 text-lg>
          Feel free to explore our other booths!
        </span>
      </section>

      <Card
        v-if="eligibleForLuckyDraw"
      >
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
              <Button label="Update" type="submit" size="small" :loading="formData.pending" />
            </div>
          </form>
        </template>
      </Card>

      <section>
        <h2 text-2xl font-semibold>
          Your completed surveys
        </h2>

        <div mt6 grid="~ cols-1 md:cols-2 lg:cols-3 gap-3">
          <div v-for="response in data" :key="response.id" class="rounded-lg bg-$surface-card p-3">
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
