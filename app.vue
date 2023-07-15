<script setup lang="ts">
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'

const config = useRuntimeConfig()
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${config.public.appName} - ${titleChunk}` : config.public.appName
  },
})

const cookieRaw = useCookie('theme')
const route = useRoute()
const resolvedTheme = computed(() => {
  let theme = 'tailwind-light'
  if (route.query.theme)
    theme = cookieRaw.value = route.query.theme as string

  if (cookieRaw.value)
    theme = cookieRaw.value

  return `https://cdn.jsdelivr.net/npm/primevue@latest/resources/themes/${theme}/theme.css`
})
</script>

<template>
  <div class="h-full">
    <Head>
      <link rel="stylesheet" :href="resolvedTheme">
    </Head>
    <Toast />
    <ConfirmPopup />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
