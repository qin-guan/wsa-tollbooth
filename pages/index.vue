<script setup lang="ts">
import Button from 'primevue/button'

const { $client } = useNuxtApp()
const config = useRuntimeConfig()

const { data: me } = await $client.me.get.useQuery(undefined, { lazy: true })
</script>

<template>
  <div>
    <header
      class="h-24 flex items-center justify-between bg-$surface-section p-6 lg:px-30"
    >
      <NuxtLink to="/">
        <span class="font-semibold">{{ config.public.appName }}</span>
      </NuxtLink>

      <Button v-if="me && me.admin" label="Dashboard" @click="$router.push('dashboard')" />
    </header>
    <main>
      <section
        class="grid grid-cols-1 bg-$surface-section p-6 pt-15 lg:grid-cols-2 lg:p-30"
      >
        <div>
          <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl">
            This is a survey platform for {{ config.public.appName }}
          </h1>
          <p class="mb-6 lg:text-xl md:text-lg">
            If you are a participant, please scan QR codes available at booths to get started.
          </p>
        </div>
        <div py-20>
          <UndrawDog mx-auto max-h-sm />
        </div>
      </section>
    </main>
  </div>
</template>
