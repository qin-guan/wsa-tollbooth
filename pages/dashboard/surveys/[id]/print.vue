<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'

const route = useRoute()
const { $client } = useNuxtApp()

const data = computed(() => {
  return `https://wsa.qinguan.me/s/${route.params.id}`
})

const qrcode = useQRCode(data.value, {
  type: 'image/png',
  width: 1000,
})

const { data: survey } = await $client.survey.get.useQuery({ id: route.params.id as string })

useSeoMeta({
  title: survey.value?.title ?? 'Loading...',
})
</script>

<template>
  <div class="h-4/5 flex flex-col items-center justify-center">
    <h1 class="text-center text-5xl font-bold">
      {{ survey?.title }}
    </h1>
    <br>
    <img :src="qrcode" :alt="data" style="width: 500px">
    <br>
    <span class="text-lg font-semibold md:text-xl">
      {{ data }}
    </span>
  </div>
</template>
