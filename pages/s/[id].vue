<script setup lang="ts">
const { $client } = useNuxtApp()

const route = useRoute()
const { data, error } = await $client.survey.get.useQuery({ id: route.params.id as string })
</script>

<template>
  <div>
    <div v-if="error">
      An error occurred!
      <small>
        Details: {{ error }}
      </small>
    </div>
    <div v-else>
      {{ data }}
    </div>
  </div>
</template>
