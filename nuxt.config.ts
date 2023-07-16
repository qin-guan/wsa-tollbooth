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
    'primevue/resources/primevue.min.css',
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
  nitro: {
    storage: {
      redis: (() => (process.env.NUXT_ENABLE_REDIS
        ? {
            driver: 'redis',
            port: process.env.NUXT_REDIS_PORT,
            host: process.env.NUXT_REDIS_HOST,
            username: process.env.NUXT_REDIS_USERNAME,
            password: process.env.NUXT_REDIS_PASSWORD,
          }
        : {
            driver: 'memory',
          }
      ))(),
    },
    devStorage: {
      redis: {
        driver: 'memory',
      },
    },
  },

  runtimeConfig: {
    public: {
      appName: 'World Skills ASEAN',
    },

    skipEnvValidation: false,
    databaseUrl: '',
    otpExpiry: 600,

    sessionSecret: '',
    sessionName: 'h3',

    resend: {
      apiKey: '',
      fromAddress: '',
    },
  },
})
