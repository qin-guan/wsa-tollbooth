<script setup lang="ts">
import Toast from 'primevue/toast'

const cookieRaw = useCookie('theme')
const route = useRoute()
const resolvedTheme = computed(() => {
  let theme = 'lara-dark-indigo'
  if (route.query.theme)
    theme = cookieRaw.value = route.query.theme as string

  if (cookieRaw.value)
    theme = cookieRaw.value
  return `/themes/${theme}/theme.css`
})
</script>

<template>
  <div class="h-full">
    <Head>
      <link rel="stylesheet" :href="resolvedTheme">
    </Head>
    <Toast />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
