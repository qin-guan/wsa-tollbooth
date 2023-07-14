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

const route = useRoute()
const { $client } = useNuxtApp()

const responsePreview = reactive({
  visible: false,
  idx: -1,
})

const { data } = await $client.analytics.listResponses.useQuery({ id: route.params.id as string })
const { data: allChartData } = await $client.analytics.chartResponses.useQuery({ id: route.params.id as string })
</script>

<template>
  <main mx-auto p-6 container>
    <Dialog v-model:visible="responsePreview.visible" modal header="Response" :style="{ width: '50vw' }">
      <div flex flex-col divide-y divide-gray>
        <div v-for="(question, idx) in data.schema" :key="idx" flex flex-col gap3 py6>
          <span font-semibold>{{ question.title }}</span>

          <div
            v-if="
              // @ts-expect-error This exists
              data.responses[responsePreview.idx].data[idx]
            "
          >
            <Textarea
              v-if="question.type === 'text'" disabled :value="
                // @ts-expect-error Answer exists on text type
                data.responses[responsePreview.idx].data[idx].answer
              "
            />
            <div v-else-if="question.type === 'mcq'" flex flex-col gap3>
              <div v-for="(option, optionIdx) in question.options" :key="option" class="flex items-center">
                <RadioButton
                  disabled
                  :model-value="
                    // @ts-expect-error Option does exist, but discriminated unions don't work well here
                    data.responses[responsePreview.idx].data[idx].option
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

    <h1 text-3xl font-bold>
      Analytics
    </h1>

    <br>

    <TabView>
      <TabPanel header="Data table">
        <DataTable :value="data.responses" table-class="w-full">
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
        <div flex flex-col gap6>
          <div
            v-for="(qnChartData, idx) in allChartData"
            :key="idx"
          >
            <div
              v-if="qnChartData.labels.length > 0"
            >
              <span font-semibold>
                {{ data.schema[idx].title }}
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
</template>
