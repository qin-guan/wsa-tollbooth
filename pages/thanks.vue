<script setup lang="ts">
import Badge from 'primevue/badge'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const config = useRuntimeConfig()

const { $client } = useNuxtApp()

const { data } = await $client.analytics.myResponses.useQuery()
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
    <main>
      <section>
        <h1 text-3xl font-bold>
          Thanks for your feedback!
        </h1>
        <span>
          Feel free to explore the other booths!
        </span>
      </section>

      <hr my-10>

      <section mt6>
        <h2 text-2xl font-semibold>
          Your completed surveys
        </h2>

        <div mt6 grid="~ cols-1 md:cols-2 lg:cols-3 gap-3">
          <div v-for="survey in data" :key="survey.id" class="rounded-lg bg-$surface-card p-3">
            <div flex items-center justify-between>
              <span text-xl font-semibold>
                {{ survey.title }}
              </span>
              <Badge v-if="survey.workshop" value="Workshop" />
              <Badge v-else value="Booth" severity="warning" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
