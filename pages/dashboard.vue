<script setup lang="ts">
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'

definePageMeta({
  middleware: ['auth'],
})

const config = useRuntimeConfig()

useSeoMeta({
  title: config.public.appName,
})

const { $client } = useNuxtApp()
const { data } = await $client.me.get.useQuery()
const { data: posts, error } = await $client.post.unreadCount.useQuery()

const FILTER_VAL_TO_LABEL = {
  all: 'All feedback',
  draft: 'Draft',
  unread: 'Unread',
  replied: 'Replied',
  repliedByMe: 'Replied by me',
  unreplied: 'Unreplied',
  unrepliedByMe: 'Unreplied by me',
}
const FILTER_OPTIONS = Object.entries(FILTER_VAL_TO_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  }),
)

const filter = ref('all')
</script>

<template>
  <div class="h-full flex flex-col bg-$surface-ground">
    <DashboardTheHeader :name="data.name" :avatar-url="data.image" />

    <main flex flex-1>
      <div id="sidebar" p4>
        <NuxtLink to="/dashboard" class="inline-block w-[230px] rounded-md p-3 text-left font-semibold">
          Feedback
        </NuxtLink>
      </div>

      <Card class="m-3 flex-1 rounded-xl">
        <template #content>
          <div flex justify-between>
            <span>
              <strong>
                {{ posts.unreadCount }}{{ ' ' }}
              </strong>
              <small opacity-75>of {{ posts.totalCount }} unread.</small>
            </span>

            <div flex>
              <Dropdown v-model="filter" :options="FILTER_OPTIONS" option-label="label" option-value="value" />
            </div>
          </div>
        </template>
      </Card>
    </main>
  </div>
</template>

<style scoped lang="scss">
#sidebar {
  :deep(a.router-link-active) {
    background-color: var(--highlight-bg);
    color: var(--highlight-text-color);
    --at-apply: font-bold;
  }

  :deep(a.router-link-active:hover) {
    background-color: var(--highlight-bg);
    color: var(--highlight-text-color);
  }

  :deep(a.router-link-active>.menu-icon i) {
    color: var(--highlight-text-color);
  }
}
</style>
