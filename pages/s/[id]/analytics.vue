<script setup lang="ts">
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Column from 'primevue/column'
import Chart from 'primevue/chart'
import RadioButton from 'primevue/radiobutton'
import Skeleton from 'primevue/skeleton'

definePageMeta({
  middleware: ['survey-permissions'],
})

const route = useRoute()
const { $client } = useNuxtApp()

const responsePreview = reactive({
  visible: false,
  idx: -1,
})

const { data: responses, pending: responsesPending, error: responsesError } = await $client.response.list.useQuery({ surveyId: route.params.id as string }, { lazy: true })
const { data: chart, pending: chartPending, error: chartError } = await $client.analytics.chartResponses.useQuery({ id: route.params.id as string }, { lazy: true })
const { data: survey, pending: surveyPending, error: surveyError } = await $client.survey.get.useQuery({ id: route.params.id as string }, { lazy: true })

useSeoMeta({
  title: `${survey.value?.title} Analytics` ?? 'Loading...',
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
                v-if="question.type === 'text'" disabled :value="
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

      <Skeleton v-if="surveyPending" height="45px" />
      <div
        v-else-if="survey"
      >
        <div class="w-[135px]">
          <NuxtImg preload height="135px" width="auto" densities="x1 x2 x3" src="/images/logo.webp" />
        </div>

        <h1 v-if="survey" text-xl font-bold>
          Responses for {{ survey.title }}
        </h1>
      </div>

      <Skeleton v-if="surveyPending || responsesPending" height="500px" />
      <DashboardError v-else-if="responsesError" v-bind="responsesError" />
      <TabView v-else-if="responses" class="mt-10">
        <TabPanel header="Data table">
          <DataTable :value="responses" table-class="w-full">
            <Column field="id" header="ID" />
            <Column field="timestamp" header="Timestamp" />
            <Column header="Respondent">
              <template #body="bodySlot">
                <span v-if="bodySlot.data.respondent.name">
                  {{ bodySlot.data.respondent.name }}
                </span>
                <span v-else>
                  Unregistered
                </span>
              </template>
            </Column>
            <Column header="Expand">
              <template #body="bodySlot">
                <Button icon="" link @click="responsePreview.idx = bodySlot.index; responsePreview.visible = true">
                  <div i-tabler-arrow-up-right text-xl />
                </Button>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel header="Charts">
          <Skeleton v-if="chartPending" height="300px" />
          <DashboardError v-if="chartError" v-bind="chartError" />
          <div v-else-if="chart" flex flex-col gap6>
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
        </TabPanel>
      </TabView>
    </main>
  </div>
</template>
