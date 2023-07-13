<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
})

const { $client } = useNuxtApp()
const { data } = await $client.me.get.useQuery()
</script>

<template>
  <div class="h-full flex flex-col bg-$surface-ground">
    <DashboardTheHeader :name="data.name" />

    <NuxtPage />
  </div>
</template>
