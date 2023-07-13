<script setup lang="ts">
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const { $client } = useNuxtApp()
const route = useRoute()

const { data } = await $client.survey.get.useQuery({ id: route.params.id as string })

const formData = reactive(data.value)

const options = [
  { name: 'Text', code: 'text' },
  { name: 'MCQ', code: 'mcq' },
]

async function update() {
}
</script>

<template>
  <main mx-auto p-6 container>
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

      <span font-lg font-semibold>Questions</span>

      <hr>

      <Card v-for="(question, idx) in formData.schema" :key="question.title">
        <template #content>
          <div flex gap3>
            <div class="flex flex-1 flex-col gap-2">
              <label :for="`title-${idx}`">Title</label>
              <InputText :id="`title-${idx}`" v-model="formData.schema[idx].title" />
            </div>

            <div class="min-w-[150px] flex flex-col gap-2">
              <label :for="`type-${idx}`">Type</label>
              <Dropdown :id="`type-${idx}`" v-model="formData.schema[idx].type" :options="options" option-label="name" option-value="code" placeholder="Question type" />
            </div>
          </div>

          <br>

          <div>
            <div class="flex flex-1 flex-col gap-2">
              <label :for="`description-${idx}`">Description</label>
              <Textarea :id="`description-${idx}`" v-model="formData.schema[idx].description" />
            </div>

            <br>
            <div v-if="formData.schema[idx].type === 'mcq'" class="flex flex-1 flex-col gap-2">
              <span mb2 font-semibold>Options</span>
              <div v-for="(option, optionIdx) in formData.schema[idx].options" :key="option">
                <span mr4>
                  {{ optionIdx + 1 }}
                </span>
                <InputText v-model="formData.schema[idx].options[optionIdx]" />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <div>
        <Button type="submit" label="Save" />
      </div>
    </form>
  </main>
</template>
