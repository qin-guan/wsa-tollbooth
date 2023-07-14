<script setup lang="ts">
import RadioButton from 'primevue/radiobutton'
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Column from 'primevue/column'

const route = useRoute()
const { $client } = useNuxtApp()

const responsePreview = reactive({
  visible: false,
  idx: -1,
})
const { data } = await $client.analytics.listResponses.useQuery({ id: route.params.id as string })
// const qnData = computed(() => {
//   return data.value.map((d) => d.data).reduce((acc, curr) => {

//   }, [])
// })
</script>

<template>
  <main mx-auto p-6 container>
    <Dialog v-model:visible="responsePreview.visible" modal header="Response" :style="{ width: '50vw' }">
      <div flex flex-col divide-y divide-gray>
        <div v-for="(question, idx) in data.schema" :key="idx" flex flex-col gap3 py6>
          <span font-semibold>{{ question.title }}</span>
          <div>
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
          <Column field="respondent.name" header="Respondent" />
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
        <div />
      </TabPanel>
    </TabView>
  </main>
</template>
