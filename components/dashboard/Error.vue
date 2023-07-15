<script setup lang="ts">
const props = defineProps<{
  message?: string
  data?: any
}>()
</script>

<template>
  <div>
    <span text-xl font-semibold>
      {{ props.message ?? 'An error occurred' }}
    </span>
    <br>
    <br>
    <details v-if="props.data">
      {{ props.data }}
    </details>
  </div>
</template>
