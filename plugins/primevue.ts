import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import FocusTrap from 'primevue/focustrap'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: false })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)

  nuxtApp.vueApp.directive('tooltip', Tooltip)
  nuxtApp.vueApp.directive('focustrap', FocusTrap)
})
