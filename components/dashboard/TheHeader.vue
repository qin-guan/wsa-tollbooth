<script setup lang="ts">
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'

const props = defineProps<{
  avatarUrl: string | null
  name: string | null
}>()
const config = useRuntimeConfig()

const menuVisible = ref(false)
const menu = ref()
const items = ref([
  {
    label: 'Profile',
  },
  {
    label: 'Logout',
  },
])

function toggle(event: any) {
  menu.value.toggle(event)
}
</script>

<template>
  <div>
    <header class="flex items-center justify-between px6 py4">
      <NuxtLink to="/dashboard">
        <span font-semibold>{{ config.public.appName }}</span>
      </NuxtLink>

      <!-- For some reason, adding a chevron indicator breaks everything -->
      <div flex cursor-pointer items-center gap2 aria-haspopup="true" aria-controls="Dashboard__TheHeaderMenu">
        <Avatar v-if="props.avatarUrl" :image="props.avatarUrl" shape="circle" />
        <Avatar
          v-else-if="props.name" :label="props.name.slice(undefined, 1).toUpperCase()" shape="circle"
          @click="toggle"
        />
        <Avatar v-else label="U" shape="circle" />
      </div>
    </header>

    <Menu
      id="Dashboard__TheHeaderMenu" ref="menu" :model="items" :popup="true" @blur="menuVisible = false"
      @focus="menuVisible = true"
    />
  </div>
</template>

<style>
#Dashboard__TheHeaderMenu {
  --at-apply: shadow-md rounded-xl;
}
</style>
