<script setup lang="ts">
import Button from 'primevue/button'

const { $client } = useNuxtApp()
const config = useRuntimeConfig()

const { data: me } = await $client.me.get.useQuery(undefined, { lazy: true })

function docs() {
  window.open('https://start-docs.qinguan.me', '_target')
}
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
      <Button v-else label="Login" @click="$router.push('login')" />
    </header>
    <main>
      <section
        class="grid grid-cols-1 bg-$surface-section p-6 pt-15 lg:grid-cols-2 lg:p-30"
      >
        <div>
          <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl">
            This is probably an okay landing page. Maybe.
          </h1>
          <p class="mb-6 lg:text-xl md:text-lg">
            It has a cute dog though. That's gotta count for something, right?
          </p>
          <div flex="~ gap-2">
            <Button rounded label="Get started" @click="$router.push('/login')" />
            <Button link rounded label="Documentation" @click="docs" />
          </div>
        </div>
        <div py-20>
          <UndrawDog mx-auto max-h-sm />
        </div>
      </section>
    </main>
  </div>
</template>
