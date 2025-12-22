/**
 * ============================================
 * COMPOSABLE: usePlanFeatures
 * ============================================
 *
 * Maneja las features del plan del usuario.
 * Permite verificar qué funcionalidades tiene habilitadas
 * según su plan actual (FREE, PRO, PREMIUM).
 *
 * Uso:
 *   const { features, loadFeatures, canUse, isPro, isPremium } = usePlanFeatures()
 *
 *   await loadFeatures()
 *   if (canUse('whatsapp_enabled')) { ... }
 */

import { ref, computed } from 'vue'
import { featuresService, paymentsService } from '@/services/api'

// Estado global reactivo (singleton)
const features = ref(null)
const loading = ref(false)
const error = ref(null)

export function usePlanFeatures() {
    /**
     * Cargar features del usuario desde la API
     */
    const loadFeatures = async () => {
        if (loading.value) return

        loading.value = true
        error.value = null

        try {
            const response = await featuresService.get()
            features.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar features'
            console.error('Error loading features:', err)
        } finally {
            loading.value = false
        }
    }

    /**
     * Verificar si el usuario puede usar una feature específica
     * @param {string} featureName - Nombre de la feature (ej: 'whatsapp_enabled', 'email_reminders')
     */
    const canUse = (featureName) => {
        if (!features.value) return false
        return !!features.value[featureName]
    }

    /**
     * Obtener el valor de una feature
     * @param {string} featureName
     */
    const getFeature = (featureName) => {
        if (!features.value) return null
        return features.value[featureName]
    }

    // Computed properties para los planes
    const planName = computed(() => features.value?.plan_name || 'free')
    const planDisplayName = computed(() => features.value?.plan_display_name || 'FREE')

    const isFree = computed(() => planName.value === 'free')
    const isPro = computed(() => planName.value === 'pro')
    const isPremium = computed(() => planName.value === 'premium')

    // Límites
    const appointmentsLimit = computed(() => features.value?.appointments_limit)
    const appointmentsRemaining = computed(() => features.value?.appointments_remaining)
    const hasUnlimitedAppointments = computed(() => appointmentsLimit.value === null)

    // Features booleanas
    const hasEmailReminders = computed(() => !!features.value?.email_reminders)
    const hasWhatsApp = computed(() => !!features.value?.whatsapp_enabled)
    const hasPublicPage = computed(() => !!features.value?.public_page)
    const hasPrioritySupport = computed(() => !!features.value?.priority_support)
    const hasAdvancedReports = computed(() => !!features.value?.advanced_reports)

    /**
     * Simular cambio de plan (solo desarrollo)
     * @param {string} planName - 'free', 'pro', 'premium'
     */
    const simulatePlan = async (newPlanName) => {
        loading.value = true
        error.value = null

        try {
            const response = await paymentsService.simulateUpgrade(newPlanName)
            // Recargar features después de cambiar el plan
            await loadFeatures()
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al simular plan'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Limpiar features (para logout)
     */
    const clearFeatures = () => {
        features.value = null
        error.value = null
    }

    return {
        // Estado
        features,
        loading,
        error,

        // Métodos
        loadFeatures,
        canUse,
        getFeature,
        simulatePlan,
        clearFeatures,

        // Plan actual
        planName,
        planDisplayName,
        isFree,
        isPro,
        isPremium,

        // Límites
        appointmentsLimit,
        appointmentsRemaining,
        hasUnlimitedAppointments,

        // Features
        hasEmailReminders,
        hasWhatsApp,
        hasPublicPage,
        hasPrioritySupport,
        hasAdvancedReports,
    }
}
