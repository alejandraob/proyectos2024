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

// Cargar tema de colores guardado
const savedTheme = localStorage.getItem('colorTheme') || 'default'
document.documentElement.setAttribute('data-theme', savedTheme)

// Cargar dark mode guardado
const savedDarkMode = localStorage.getItem('darkMode')
if (savedDarkMode === 'true') {
    document.documentElement.classList.add('dark-mode')
}

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
