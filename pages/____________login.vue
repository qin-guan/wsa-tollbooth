<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import type { TRPCError } from '@trpc/server'

const config = useRuntimeConfig()
const { $client } = useNuxtApp()

useSeoMeta({
  title: config.public.appName,
})

const formData = reactive<{
  email: string
  otp: string
  pending: boolean
  stage: 'email' | 'otp'
  token: string
  error?: string
}>({
  email: '',
  otp: '',
  pending: false,
  token: '',
  stage: 'email',
})

async function generateOtp() {
  formData.pending = true
  try {
    await $client.auth.email.login.mutate({
      email: formData.email,
      token: formData.token,
    })
    formData.stage = 'otp'
  }
  catch (err) {
    console.error(err)
    formData.error = (err as TRPCError).message
  }
  finally {
    formData.pending = false
  }
}

async function verifyOtp() {
  formData.pending = true
  try {
    await $client.auth.email.verifyOtp.mutate({
      email: formData.email,
      otp: formData.otp,
    })
    navigateTo('/dashboard')
  }
  catch (err) {
    console.error(err)
    formData.error = (err as TRPCError).message
  }
  finally {
    formData.pending = false
  }
}
</script>

<template>
  <div>
    <header
      class="h-24 flex items-center justify-between p-6 lg:px-30"
    >
      <NuxtLink to="/">
        <span font-semibold>{{ config.public.appName }}</span>
      </NuxtLink>
    </header>

    <main>
      <div grid grid-cols-1 lg:grid-cols-2 lg:py-20>
        <div mx-auto max-w-lg w-full p-10>
          <UndrawLogin />
        </div>

        <div p-6 lg:px-30>
          <h1 text-3xl font-bold>
            Login
          </h1>

          <div mt-8>
            <form v-if="formData.stage === 'email'" @submit.prevent="generateOtp">
              <div class="flex flex-col gap-2">
                <label for="email">Email</label>
                <InputText id="email" v-model="formData.email" autofocus :required="true" placeholder="sam@example.com" type="email" aria-describedby="email-help" class="max-w-md" />
                <small id="email-help" class="sr-only">Enter your email</small>
              </div>

              <div mt6>
                <NuxtTurnstile v-model="formData.token" />
                <br>
                <Button type="submit" :loading="formData.pending" icon="" icon-pos="right" label="Get OTP" />
              </div>
            </form>

            <form v-else-if="formData.stage === 'otp'" @submit.prevent="verifyOtp">
              <div class="flex flex-col gap-2">
                <label for="otp">OTP</label>
                <InputText id="otp" v-model="formData.otp" autofocus :required="true" placeholder="123456" aria-describedby="otp-help" class="max-w-md" />
                <small id="otp-help" class="sr-only">Enter your OTP</small>
              </div>

              <div mt6>
                <Button type="submit" :loading="formData.pending" icon="" icon-pos="right" label="Login" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
