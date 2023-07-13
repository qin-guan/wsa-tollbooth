<script setup lang="ts">
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const route = useRoute()
const { $client } = useNuxtApp()

const { data } = await $client.analytics.listResponses.useQuery({ id: route.params.id as string })

// const qnData = computed(() => {
//   return data.value.map((d) => d.data).reduce((acc, curr) => {

//   }, [])
// })
</script>

<template>
  <main mx-auto p-6 container>
    <h1 text-3xl font-bold>
      Surveys
    </h1>

    <br>

    <TabView>
      <TabPanel header="Data table">
        <DataTable :value="data" table-class="w-full">
          <Column field="id" header="ID" />
          <Column field="timestamp" header="Timestamp" />
          <Column field="respondentId" header="Respondent" />
          <Column header="Expand">
            <template #body="slotProps">
              <Button icon="" link>
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
