<script setup lang="ts">
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Breadcrumb from 'primevue/breadcrumb'

import { useConfirm } from 'primevue/useconfirm'

const { $client } = useNuxtApp()
const route = useRoute()
const confirm = useConfirm()

const {
  data: survey,
  pending: surveyPending,
  error: surveyError,
} = await $client.survey.get.useQuery(
  { id: route.params.id as string },
  { lazy: true },
)

useSeoMeta({
  title: survey.value?.title ?? 'Loading...',
})

const pending = ref(false)
const formData = ref(survey.value)
const permissionsDialog = reactive({
  visible: false,
  tempEmail: '',
})

watch(survey, (value) => {
  if (value)
    formData.value = value
})

const options = [
  { name: 'Text', code: 'text' },
  { name: 'MCQ', code: 'mcq' },
]

async function printQR() {
  await navigateTo(`/dashboard/surveys/${route.params.id}/print`, { open: { target: '_blank' } })
}

async function openAnalytics() {
  await navigateTo(`/dashboard/surveys/${route.params.id}/analytics`)
}

async function openPreview() {
  await navigateTo(`/s/${route.params.id}`)
}

async function update() {
  pending.value = true

  try {
    await $client.survey.update.mutate(formData.value!)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    pending.value = false
  }
}

function addQuestion() {
  formData.value?.questions.push({
    title: '',
    description: '',
    type: 'text',
    options: [],
  })
}

function deleteQuestion(event: any, questionIdx: number) {
  confirm.require({
    target: event.currentTarget,
    message: 'Are you sure you want to delete this question?',
    acceptClass: 'p-button-danger',
    accept: () => {
      formData.value?.questions.splice(questionIdx, 1)
    },
    reject: () => {
    },
  })
}

function addOption(questionIdx: number) {
  formData.value?.questions[questionIdx].options.push('')
}

function deleteOption(questionIdx: number, optionIdx: number) {
  formData.value?.questions[questionIdx].options.splice(optionIdx, 1)
}

function addPermission() {
  formData.value?.permissions.push({
    email: permissionsDialog.tempEmail,
    permission: 'read',
  })
  permissionsDialog.tempEmail = ''
}

function deletePermission(permissionIdx: number) {
  formData.value?.permissions.splice(permissionIdx, 1)
}
</script>

<template>
  <main mx-auto p-6 container>
    <div v-if="surveyPending" flex flex-col gap5>
      <Skeleton height="50px" />
      <Skeleton height="75px" />
      <Skeleton height="300px" />
      <Skeleton height="300px" />
    </div>

    <DashboardError v-else-if="surveyError" v-bind="surveyError" />

    <!-- formData should be populated when survey loads -->
    <div v-else-if="formData">
      <Dialog v-model:visible="permissionsDialog.visible" :closable="false" modal header="Permissions" class="min-w-sm lg:min-w-lg">
        <form @submit.prevent="addPermission">
          <div pb6>
            <div v-if="formData.permissions.length === 0" flex items-center justify-center>
              <span>
                No permissions set. Add new email below.
              </span>
            </div>

            <div v-else flex flex-col divide-y>
              <div v-for="(user, idx) in formData.permissions" :key="idx" flex items-center justify-between py2>
                <span>{{ user.email }}</span>
                <Button size="small" text rounded icon="" @click="deletePermission(idx)">
                  <div i-tabler-trash />
                </Button>
              </div>
            </div>
          </div>

          <InputText id="permission-email" v-model="permissionsDialog.tempEmail" autofocus required w-full type="email" placeholder="New email" />
        </form>

        <div mt4 flex justify-end gap2>
          <Button outlined size="small" label="Cancel" @click="permissionsDialog.visible = false" />
          <Button :loading="pending" label="Save" size="small" @click="update(); permissionsDialog.visible = false" />
        </div>
      </Dialog>

      <div flex flex-wrap items-center justify-between gap-3>
        <Breadcrumb
          :home="{
            to: '/dashboard',
            label: 'Dashboard',
          }"
          :model="[
            {
              label: 'Surveys',
              to: '/dashboard',
            },
            {
              label: `${formData.title}`,
            },
          ]"
        />

        <div flex gap3>
          <div>
            <Button text label="Preview" :pt="{ root: { class: 'p2!' } }" @click="openPreview" />
          </div>
          <div>
            <Button text label="Print QR" :pt="{ root: { class: 'p2!' } }" @click="printQR" />
          </div>
          <div>
            <Button label="Permissions" outlined :pt="{ root: { class: 'p2!' } }" @click="permissionsDialog.visible = true" />
          </div>
          <div>
            <Button label="Analytics" :pt="{ root: { class: 'p2!' } }" @click="openAnalytics" />
          </div>
        </div>
      </div>

      <div my-6 border-red-600 rounded-md bg-red-500 bg-opacity-50 p-5>
        <span font-semibold>
          Warning!
        </span>
        <br>
        Please take caution when editing a form after it has received responses. As much as possible, it should be avoided.
        <br>
        The type of a question should never be changed.
      </div>

      <form flex flex-col gap5 @submit.prevent="update">
        <div class="flex flex-col gap-2">
          <label for="title">Form title</label>
          <InputText id="title" v-model="formData.title" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="description">Form description</label>
          <Textarea id="description" v-model="formData.description" />
        </div>

        <br>

        <div flex items-center justify-between>
          <span text-lg font-semibold>Questions</span>
          <Button type="button" text label="Add question" @click="addQuestion" />
        </div>

        <hr>

        <Card v-for="(_, idx) in formData.questions" :key="idx">
          <template #content>
            <div flex flex-wrap gap3>
              <div class="flex flex-1 flex-col gap-2">
                <label :for="`title-${idx}`">Title</label>
                <InputText :id="`title-${idx}`" v-model="formData.questions[idx].title" />
              </div>

              <div class="min-w-[150px] flex flex-col gap-2">
                <label :for="`type-${idx}`">Type</label>
                <Dropdown
                  :id="`type-${idx}`" v-model="formData.questions[idx].type" :options="options" option-label="name"
                  option-value="code" placeholder="Question type"
                />
              </div>

              <div>
                <Button icon="" text @click="deleteQuestion($event, idx)">
                  <div i-tabler-trash />
                </Button>
              </div>
            </div>

            <br>

            <div>
              <div class="flex flex-1 flex-col gap-2">
                <label :for="`description-${idx}`">Description</label>
                <Textarea :id="`description-${idx}`" v-model="formData.questions[idx].description" />
              </div>

              <br>

              <div v-if="formData.questions[idx].type === 'mcq'" class="flex flex-1 flex-col gap-2">
                <div flex items-center justify-between>
                  <span mb2 font-semibold>Options</span>
                  <Button label="Add" :pt="{ root: { class: 'p2!' } }" @click="addOption(idx)" />
                </div>
                <div v-for="(_, optionIdx) in formData.questions[idx].options" :key="optionIdx" flex items-center>
                  <span mr4>
                    {{ optionIdx + 1 }}.
                  </span>
                  <InputText v-model="formData.questions[idx].options[optionIdx]" />
                  <Button icon="" text rounded size="small" @click="deleteOption(idx, optionIdx)">
                    <div i-tabler-trash text-red-600 />
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <div>
          <Button type="submit" label="Save" severity="success" :pt="{ root: { class: 'p2!' } }" :loading="pending" />
        </div>
      </form>
    </div>
  </main>
</template>
