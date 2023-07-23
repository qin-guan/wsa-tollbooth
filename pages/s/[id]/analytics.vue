<script setup lang="ts">
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import type { SurveyResponseSchema } from 'shared/survey'

const Paginator = defineAsyncComponent(() => import('primevue/paginator'))
const Dialog = defineAsyncComponent(() => import('primevue/dialog'))
const Button = defineAsyncComponent(() => import('primevue/button'))
const Textarea = defineAsyncComponent(() => import('primevue/textarea'))
const Chart = defineAsyncComponent(() => import('primevue/chart'))
const RadioButton = defineAsyncComponent(() => import('primevue/radiobutton'))

definePageMeta({
  middleware: ['survey-permissions'],
})

const route = useRoute()
const { $client } = useNuxtApp()

const responsePreview = reactive({
  visible: false,
  idx: 0, // Hacky, may fail if no qns in survey
  qnIdx: 0, // Same
})

const { data: responses, pending: responsesPending, error: responsesError } = await $client.response.list.useQuery({ surveyId: route.params.id as string }, { lazy: true })
const { data: chart, pending: chartPending, error: chartError } = await $client.analytics.chartResponses.useQuery({ id: route.params.id as string }, { lazy: true })
const { data: survey, pending: surveyPending, error: surveyError } = await $client.survey.get.useQuery({ id: route.params.id as string }, { lazy: true })

useSeoMeta({
  title: `${survey.value?.title} Analytics` ?? 'Loading...',
})

const responsesByQn = computed(() => {
  return responses.value.map((r) => {
    return (r.data as SurveyResponseSchema)[responsePreview.qnIdx]
  })
})
</script>

<template>
  <div p-6 lg:px-30>
    <main>
      <Dialog v-model:visible="responsePreview.visible" modal header="Response" :style="{ width: '50vw' }">
        <Skeleton v-if="surveyPending" height="100px" />
        <DashboardError v-else-if="surveyError" v-bind="surveyError" />
        <div v-else-if="survey" flex flex-col divide-y divide-gray>
          <div v-for="(question, idx) in survey.questions" :key="idx" flex flex-col gap3 py6>
            <span font-semibold>{{ question.title }}</span>

            <div
              v-if="
                // @ts-expect-error This exists
                responses[responsePreview.idx].data[idx]
              "
            >
              <Textarea
                v-if="question.type === 'text'"
                class="w-full" disabled :value="
                  // @ts-expect-error Answer exists on text type
                  responses[responsePreview.idx].data[idx].answer
                "
              />
              <div v-else-if="question.type === 'mcq'" flex flex-col gap3>
                <div v-for="(option, optionIdx) in question.options" :key="option" class="flex items-center">
                  <RadioButton
                    disabled
                    :model-value="
                      // @ts-expect-error Option does exist, but discriminated unions don't work well here
                      responses[responsePreview.idx].data[idx].option
                    "
                    :value="optionIdx"
                    :input-id="option"
                  />
                  <label :for="option" class="ml-2">{{ option }}</label>
                </div>
              </div>
            </div>
            <div v-else>
              <span text-red-600>
                No response as this question is new!
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      <NuxtImg preload fit="inside" width="135" height="135" alt="World Skills ASEAN" densities="x1 x2 x3" src="/images/logo.webp" />

      <Skeleton v-if="surveyPending" height="45px" />
      <h1 v-else-if="survey" mt8 text-xl font-bold>
        Responses for {{ survey.title }}
      </h1>

      <Skeleton v-if="surveyPending || responsesPending" height="500px" />
      <DashboardError v-else-if="responsesError" v-bind="responsesError" />
      <TabView v-else-if="responses" class="mt-10">
        <TabPanel header="Data table">
          <DataTable :value="responses" table-class="w-full">
            <Column field="id" header="ID" />
            <Column field="timestamp" header="Timestamp" />
            <Column header="Expand">
              <template #body="bodySlot">
                <Button icon="" link @click="responsePreview.idx = bodySlot.index; responsePreview.visible = true">
                  <div i-tabler-arrow-up-right text-xl />
                </Button>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel header="By response">
          <!-- Also hacky, uses same idx as dialog in tab panel above -->
          <Paginator v-model:first="responsePreview.idx" :rows="1" :total-records="responses.length" template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink" />

          <div v-for="(question, idx) in survey?.questions" :key="idx" flex flex-col gap3 py6>
            <span font-semibold>{{ question.title }}</span>

            <div
              v-if="
                // @ts-expect-error This exists
                responses[responsePreview.idx].data[idx]
              "
            >
              <Textarea
                v-if="question.type === 'text'"
                class="w-full" disabled :value="
                  // @ts-expect-error Answer exists on text type
                  responses[responsePreview.idx].data[idx].answer
                "
              />
              <div v-else-if="question.type === 'mcq'" flex flex-col gap3>
                <div v-for="(option, optionIdx) in question.options" :key="option" class="flex items-center">
                  <RadioButton
                    disabled
                    :model-value="
                      // @ts-expect-error Option does exist, but discriminated unions don't work well here
                      responses[responsePreview.idx].data[idx].option
                    "
                    :value="optionIdx"
                    :input-id="option"
                  />
                  <label :for="option" class="ml-2">{{ option }}</label>
                </div>
              </div>
            </div>
            <div v-else>
              <span text-red-600>
                No response as this question is new!
              </span>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="By question">
          <Paginator v-model:first="responsePreview.qnIdx" :rows="1" :total-records="survey?.questions.length" template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink" />

          <div flex>
            <span px2 py4 text-lg font-semibold>
              {{ survey?.questions[responsePreview.qnIdx].title }}
            </span>
          </div>

          <DataTable :value="responsesByQn">
            <Column header="ID" style="width: 10%">
              <template #body="bodySlot">
                {{ bodySlot.index + 1 }}
              </template>
            </Column>

            <Column v-if="survey?.questions[responsePreview.qnIdx].type === 'text'" field="answer" header="Answer" />
            <Column v-else-if="survey?.questions[responsePreview.qnIdx].type === 'mcq'" header="Option">
              <template #body="bodySlot">
                {{ survey?.questions[responsePreview.qnIdx].options[bodySlot.data.option] }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel header="Charts">
          <Skeleton v-if="chartPending" height="300px" />
          <DashboardError v-if="chartError" v-bind="chartError" />
          <div v-else-if="chart">
            <div mx-auto max-w-3xl flex flex-col gap15>
              <div
                v-for="(qnChartData, idx) in chart"
                :key="idx"
              >
                <div
                  v-if="qnChartData.labels.length > 0"
                >
                  <span font-semibold>
                    {{ survey?.questions[idx].title }}
                  </span>
                  <Chart
                    class="max-w-xl"
                    type="bar" :data="qnChartData" :options="{
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </main>
  </div>
</template>
