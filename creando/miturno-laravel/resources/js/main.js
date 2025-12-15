import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import router from './router'

// Importar estilos globales
import '../css/app.css'
import 'primeicons/primeicons.css'

// Crear la aplicación
const app = createApp(App)

// Usar plugins
app.use(createPinia())  // Estado global
app.use(router)         // Rutas
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: false,
            cssLayer: false
        }
    }
})
app.use(ToastService)
app.use(ConfirmationService)

// Montar la aplicación
app.mount('#app')
