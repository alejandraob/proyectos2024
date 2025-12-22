<template>
    <div v-if="isDev" class="plan-simulator">
        <div class="simulator-toggle" @click="isOpen = !isOpen">
            <span class="simulator-icon">🧪</span>
            <span v-if="isOpen" class="simulator-label">DEV</span>
        </div>

        <div v-if="isOpen" class="simulator-panel">
            <div class="simulator-header">
                <h4>Simulador de Planes</h4>
                <small>Solo visible en desarrollo</small>
            </div>

            <div class="simulator-current">
                <span class="label">Plan actual:</span>
                <span :class="['badge', `badge-${planName}`]">{{ planDisplayName }}</span>
            </div>

            <div v-if="appointmentsRemaining !== null" class="simulator-info">
                <span>Turnos restantes: {{ appointmentsRemaining }}/{{ appointmentsLimit }}</span>
            </div>
            <div v-else class="simulator-info">
                <span>Turnos: Ilimitados ∞</span>
            </div>

            <div class="simulator-features">
                <div class="feature-item">
                    <span :class="{ active: hasEmailReminders }">📧 Email</span>
                </div>
                <div class="feature-item">
                    <span :class="{ active: hasWhatsApp }">💬 WhatsApp</span>
                </div>
                <div class="feature-item">
                    <span :class="{ active: hasAdvancedReports }">📊 Reportes</span>
                </div>
            </div>

            <div class="simulator-buttons">
                <button
                    @click="changePlan('free')"
                    :class="{ active: planName === 'free' }"
                    :disabled="loading"
                >
                    FREE
                </button>
                <button
                    @click="changePlan('pro')"
                    :class="{ active: planName === 'pro' }"
                    :disabled="loading"
                >
                    PRO
                </button>
                <button
                    @click="changePlan('premium')"
                    :class="{ active: planName === 'premium' }"
                    :disabled="loading"
                >
                    PREMIUM
                </button>
            </div>

            <div v-if="loading" class="simulator-loading">
                Cambiando plan...
            </div>

            <div v-if="message" class="simulator-message" :class="messageType">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlanFeatures } from '@/composables/usePlanFeatures'

const {
    loadFeatures,
    simulatePlan,
    loading,
    planName,
    planDisplayName,
    appointmentsLimit,
    appointmentsRemaining,
    hasEmailReminders,
    hasWhatsApp,
    hasAdvancedReports,
} = usePlanFeatures()

const isDev = ref(true) // En producción, esto debería venir de una variable de entorno
const isOpen = ref(false)
const message = ref('')
const messageType = ref('success')

onMounted(async () => {
    await loadFeatures()
})

const changePlan = async (newPlan) => {
    try {
        message.value = ''
        const result = await simulatePlan(newPlan)
        message.value = result.message
        messageType.value = 'success'

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            message.value = ''
        }, 3000)
    } catch (err) {
        message.value = err.response?.data?.message || 'Error al cambiar plan'
        messageType.value = 'error'
    }
}
</script>

<style scoped>
.plan-simulator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: system-ui, -apple-system, sans-serif;
}

.simulator-toggle {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
}

.simulator-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.simulator-icon {
    font-size: 20px;
}

.simulator-label {
    display: none;
}

.simulator-panel {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 280px;
    background: #1a1a2e;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    color: #fff;
}

.simulator-header {
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 12px;
}

.simulator-header h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
}

.simulator-header small {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
}

.simulator-current {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.simulator-current .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

.badge-free {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
}

.badge-pro {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
}

.badge-premium {
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
}

.simulator-info {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
}

.simulator-features {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.feature-item span {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.2s;
}

.feature-item span.active {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.simulator-buttons {
    display: flex;
    gap: 8px;
}

.simulator-buttons button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;
}

.simulator-buttons button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}

.simulator-buttons button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
}

.simulator-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.simulator-loading {
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 12px;
}

.simulator-message {
    margin-top: 12px;
    padding: 8px;
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
}

.simulator-message.success {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.simulator-message.error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
}
</style>
