<script setup lang="ts">
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'

import type { SurveyResponseSchema } from '~/shared/survey'

definePageMeta({
  middleware: ['participant'],
})

const config = useRuntimeConfig()
const { $client } = useNuxtApp()

const route = useRoute()
const { data, error } = await $client.survey.get.useQuery({ id: route.params.id as string })
if (data.value.submissionCount > 0) {
  await navigateTo({
    path: '/thanks',
    query: {
      id: route.params.id,
    },
  })
}

const initFormData: SurveyResponseSchema = data.value.schema.map((question) => {
  if (question.type === 'mcq') {
    return {
      type: 'mcq',
      option: -1,
    }
  }
  return {
    type: 'text',
    answer: '',
  }
})
const formData = reactive<SurveyResponseSchema>(initFormData)
const pending = ref(false)

async function submit() {
  pending.value = true

  try {
    await $client.survey.respond.mutate({
      id: route.params.id as string,
      data: formData,
    })
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div p-6 lg:px-30>
    <header
      class="h-24 flex items-center justify-between"
    >
      <NuxtLink to="/">
        <span class="font-semibold">{{ config.public.appName }}</span>
      </NuxtLink>
    </header>
    <main>
      <div v-if="error">
        An error occurred!
        <small>
          Details: {{ error }}
        </small>
      </div>
      <div v-else mx-auto mt-3 max-w-3xl container>
        <div>
          <h1 text-5xl font-bold>
            {{ data.title }}
          </h1>
          <br>
          <span>
            {{ data.description }}
          </span>
        </div>

        <br>
        <hr>

        <form @submit.prevent="submit">
          <div v-for="(question, idx) in data.schema" :key="idx" mt-10>
            <h2 text-2xl font-semibold>
              {{ question.title }}
            </h2>
            <span>
              {{ question.description }}
            </span>

            <div mt-4>
              <div v-if="question.type === 'text'">
                <Textarea
                  v-model="
                    // @ts-expect-error Answer does exist, but discriminated unions don't work well here
                    formData[idx].answer
                  " class="w-full" placeholder="Your response here"
                />
              </div>

              <div v-else-if="question.type === 'mcq'" flex flex-col gap-3>
                <div v-for="(option, optionIdx) in question.options" :key="option" class="flex items-center">
                  <RadioButton
                    v-model="
                      // @ts-expect-error Option does exist, but discriminated unions don't work well here
                      formData[idx].option
                    "
                    :value="optionIdx"
                    :input-id="option"
                  />
                  <label :for="option" class="ml-2">{{ option }}</label>
                </div>
              </div>
            </div>
          </div>

          <div mt-8>
            <Button label="Submit" type="submit" :loading="pending" />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
