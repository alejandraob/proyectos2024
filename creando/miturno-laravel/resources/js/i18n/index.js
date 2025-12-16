import { createI18n } from 'vue-i18n'
import es from './es'
import en from './en'
import pt from './pt'

// Obtener idioma guardado o usar español por defecto
const savedLocale = localStorage.getItem('locale') || 'es'

const i18n = createI18n({
    legacy: false, // Usar Composition API
    locale: savedLocale,
    fallbackLocale: 'es',
    messages: {
        es,
        en,
        pt,
    },
})

export default i18n

// Helper para cambiar idioma
export const setLocale = (locale) => {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.setAttribute('lang', locale)
}

// Helper para obtener idioma actual
export const getLocale = () => {
    return i18n.global.locale.value
}

// Lista de idiomas disponibles
export const availableLocales = [
    { code: 'es', name: 'Español', flag: '🇦🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
]
