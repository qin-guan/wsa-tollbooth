// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    '/dashboard/surveys/*/print': { ssr: false },
  },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/html-validator',
    '@nuxt/image',
  ],
  typescript: {
    strict: true,
  },
  css: [
    '@unocss/reset/tailwind-compat.css',
    '~/styles/global.css',
  ],
  build: {
    transpile: [
      'primevue',
      'trpc-nuxt',
    ],
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width,height=device-height,initial-scale=1,maximum-scale=1,user-scalable=no,shrink-to-fit=no,viewport-fit=cover',
      htmlAttrs: { lang: 'en' },
    },
  },

  htmlValidator: {
    failOnError: true,
    options: {
      rules: {
        'wcag/h37': 'warn',
        'element-permitted-content': 'warn',
        'element-required-attributes': 'warn',
        'attribute-empty-style': 'off',
      },
    },
  },

  image: {},

  runtimeConfig: {
    public: {
      appName: 'World Skills ASEAN',
    },

    skipEnvValidation: false,
    databaseUrl: '',
    otpExpiry: 600,

    sessionSecret: '',
    sessionName: 'h3',

    axiom: {
      dataset: '',
      token: '',
    },

    redis: {
      enabled: false,
      host: '',
      port: 0,
      username: '',
      password: '',
    },

    resend: {
      apiKey: '',
      fromAddress: '',
    },
  },
})
