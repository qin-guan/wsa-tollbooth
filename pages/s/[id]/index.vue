<script setup lang="ts">
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import Card from 'primevue/card'
import { useToast } from 'primevue/usetoast'

import type { SurveyResponseSchema } from '~/shared/survey'

const { $client } = useNuxtApp()

const route = useRoute()
const toast = useToast()

const { data: survey, error: surveyError } = await $client.survey.get.useQuery({ id: route.params.id as string }, { lazy: true })
const { data: responses } = await $client.response.submitted.useQuery(undefined, { lazy: true })

useSeoMeta({
  title: survey.value?.title ?? 'Loading...',
})

const formData = ref<SurveyResponseSchema | null>(null)
const turnstileToken = ref<string>('')
const pending = ref(false)

const responded = computed(() => {
  if (!responses.value)
    return false

  if (responses.value.find(v => v.surveyId === route.params.id))
    return true

  return false
})

watch(survey, (value) => {
  if (!value)
    return
  const initFormData: SurveyResponseSchema = value.questions.map((question) => {
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
  formData.value = initFormData
}, { immediate: true })

async function submit() {
  if (!formData.value)
    return

  for (const question of formData.value) {
    if (question.type === 'mcq' && question.option === -1) {
      toast.add({
        severity: 'error',
        summary: 'Please fill in all options',
      })
      return
    }
  }

  pending.value = true

  try {
    await $client.response.create.mutate({
      surveyId: route.params.id as string,
      data: formData.value,
      token: turnstileToken.value,
    })
    await navigateTo({
      path: '/thanks',
      query: {
        id: route.params.id,
      },
    })
  }
  catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      // @ts-expect-error for some reason the TRPCClientError instanceof does not work
      summary: err.message,
    })
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div p-6 pb-30 lg:px-30>
    <main>
      <DashboardError v-if="surveyError" v-bind="surveyError" />
      <template v-else-if="survey">
        <div mx-auto max-w-3xl container>
          <div class="w-[135px]">
            <NuxtImg preload width="135px" densities="x1 x2 x3" quality="100" src="/images/logo.webp" />
          </div>

          <div mt10>
            <h1 text-5xl font-bold>
              {{ survey.title }}
            </h1>
            <br>
            <span>
              {{ survey.description }}
            </span>
          </div>

          <br>
          <hr>

          <div v-if="responded" mt-10>
            <Card>
              <template #title>
                You've filled in this survey already!
              </template>
              <template #subtitle>
                You can only fill in a survey once.
                Do check out our other booths and workshops!
              </template>
              <template #content>
                <Button label="Edit lucky draw information" @click="navigateTo('/thanks')" />
              </template>
            </Card>
          </div>

          <form v-else-if="formData" @submit.prevent="submit">
            <div v-for="(question, idx) in survey.questions" :key="idx" role="group" mt-15>
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
                    "
                    required class="w-full" placeholder="Your response here"
                  />
                </div>

                <div v-else-if="question.type === 'mcq'" role="radiogroup" flex flex-col gap-3>
                  <div v-for="(option, optionIdx) in question.options" :key="option" class="w-full flex items-center">
                    <RadioButton
                      v-model="
                        // @ts-expect-error Option does exist, but discriminated unions don't work well here
                        formData[idx].option
                      "
                      :name="idx.toString()"
                      :value="optionIdx"
                      :input-id="`${idx}-${option}`"
                      class="w-full"
                    />
                    <label :for="`${idx}-${option}`" class="ml-2 w-full">{{ option }}</label>
                  </div>
                </div>
              </div>
            </div>

            <div mt-8>
              <NuxtTurnstile v-model="turnstileToken" />
              <br>
              <Button label="Submit" type="submit" :loading="pending" />
            </div>
          </form>
        </div>
      </template>
    </main>
  </div>
</template>
