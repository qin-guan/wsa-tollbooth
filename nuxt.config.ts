// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: {
    componentIslands: true,
  },
  devtools: { enabled: true },
  routeRules: {
    '/dashboard/surveys/*/print': { ssr: false },
  },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
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
  runtimeConfig: {
    public: {
      // Nuxt generates wrong type for booleans but they work
      enableStorage: false,
      enableSgid: false,
      appName: 'WSA Tollbooth',
    },

    skipEnvValidation: false,
    databaseUrl: '',
    otpExpiry: 600,

    postmanApiKey: '',
    sessionSecret: '',
    sessionName: 'h3',

    r2: {
      accessKeyId: '',
      accountId: '',
      secretAccessKey: '',
      publicHostname: '',
      avatarsBucketName: '',
    },

    sgid: {
      clientId: '',
      clientSecret: '',
      privateKey: '',
      redirectUri: '',
    },

    resend: {
      apiKey: '',
      fromAddress: '',
    },
  },
})
