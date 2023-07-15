<script setup lang="ts">
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputSwitch from 'primevue/inputswitch'
import Badge from 'primevue/badge'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'
import { TRPCClientError } from '@trpc/client'

useSeoMeta({
  title: 'Dashboard',
})

const toast = useToast()
const { $client } = useNuxtApp()
const { data: surveys, pending: surveysPending, error: surveysError } = await $client.survey.list.useQuery(undefined, { lazy: true })
const { data: pastWinners, pending: pastWinnersPending, error: pastWinnersError, refresh: pastWinnersRefresh } = await $client.luckyDraw.pastWinners.useQuery(undefined, { lazy: true })

const visible = ref(false)
const createForm = reactive({
  title: '',
  description: '',
  workshop: false,
  pending: false,
})

async function create() {
  createForm.pending = true

  try {
    const survey = await $client.survey.create.mutate({
      ...createForm,
      schema: [],
    })
    navigateTo(`/dashboard/surveys/${survey.id}`)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    createForm.pending = false
  }
}

async function draw() {
  try {
    await $client.luckyDraw.draw.mutate()
    await pastWinnersRefresh()
  }
  catch (err) {
    console.error(err)
    if (err instanceof TRPCClientError) {
      toast.add({
        severity: 'error',
        summary: err.message,
      })
    }
  }
}

async function deleteWinner(id: string) {
  try {
    await $client.luckyDraw.deleteWinner.mutate({
      id,
    })
    await pastWinnersRefresh()
  }
  catch (err) {
    console.error(err)
    if (err instanceof TRPCClientError) {
      toast.add({
        severity: 'error',
        summary: err.message,
      })
    }
  }
}
</script>

<template>
  <main mx-auto flex flex-col gap10 p-6 container>
    <Dialog v-model:visible="visible" modal header="New survey" style="min-width: 300px;">
      <form @submit.prevent="create">
        <div class="flex flex-col gap-2">
          <label for="title">Survey title</label>
          <InputText id="title" v-model="createForm.title" required />
        </div>

        <br>

        <div class="flex flex-col gap-2">
          <label for="description">Survey description</label>
          <Textarea id="description" v-model="createForm.description" />
        </div>

        <br>

        <div class="flex items-center justify-between">
          <label for="workshop">Workshop</label>
          <InputSwitch id="workshop" v-model="createForm.workshop" />
        </div>

        <br>

        <Button type="submit" label="Create" icon="" :loading="createForm.pending" />
      </form>
    </Dialog>

    <section>
      <h2 text-3xl font-bold>
        Surveys
      </h2>

      <br>

      <Skeleton v-if="surveysPending" height="300px" />
      <DashboardError v-else-if="surveysError" v-bind="surveysError" />

      <template v-else>
        <div v-if="surveys.length === 0" mt-20 flex flex-col items-center>
          <span text-xl font-semibold>No surveys</span>
          <br>
          <Button size="small" label="Create new" @click="visible = true" />
        </div>

        <DataTable v-else :value="surveys" table-style="width: 100%;">
          <Column field="id" header="ID" style="width: 20%;" />
          <Column field="title" header="Title" style="width: 50%" />
          <Column field="workshop" header="Type" style="width: 20%">
            <template #body="slotProps">
              <Badge v-if="slotProps.data.workshop" value="Workshop" />
              <Badge v-else value="Booth" severity="warning" />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <NuxtLink :to="`/dashboard/surveys/${slotProps.data.id}`">
                <Button label="Edit" size="small" link />
              </NuxtLink>
            </template>
          </Column>
        </DataTable>

        <br>

        <Button v-if="surveys.length !== 0" size="small" label="Create new" @click="visible = true" />
      </template>
    </section>
    <section>
      <div flex items-center justify-between>
        <h2 text-3xl font-bold>
          Lucky draw
        </h2>
        <Button label="Draw" @click="draw" />
      </div>

      <div mt-6 flex flex-col gap3>
        <h3 text-xl font-semibold>
          Past winners
        </h3>

        <DataTable v-if="pastWinners" :value="pastWinners">
          <Column field="id" header="ID" style="width: 30%" />
          <Column field="name" header="Name" style="width 20%" />
          <Column field="nric" header="NRIC" style="width: 20%" />
          <Column field="phone" header="Phone" style="width: 20%" />
          <Column header="Delete" style="width: 10%">
            <template #body="slotProps">
              <Button label="Delete" size="small" severity="danger" @click="deleteWinner(slotProps.data.id)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </section>
  </main>
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
