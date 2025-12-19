<template>
    <MainLayout>
        <div class="page-container">
            <div class="page-header">
                <h2>{{ $t('plans.title') }}</h2>
                <p class="text-muted">{{ $t('plans.subtitle') }}</p>
            </div>

            <div class="planes-grid">
                <!-- Plan FREE -->
                <div class="plan-card" :class="{ 'plan-current': currentPlan === 'free' }">
                    <div class="plan-badge" v-if="currentPlan === 'free'">{{ $t('plans.currentPlan') }}</div>
                    <div class="plan-header">
                        <h3 class="plan-name">FREE</h3>
                        <div class="plan-price">
                            <span class="price-amount">$0</span>
                            <span class="price-period">{{ $t('plans.perMonth') }}</span>
                        </div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="pi pi-check"></i> 1 {{ $t('plans.features.professionals').split(' | ')[0] }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.appointments', { count: 30 }) }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.basicAgenda') }}</li>
                        <li class="feature-disabled"><i class="pi pi-times"></i> {{ $t('plans.features.noReminders') }}</li>
                        <li class="feature-disabled"><i class="pi pi-times"></i> {{ $t('plans.features.noWhatsapp') }}</li>
                    </ul>
                    <button
                        class="btn btn-outline w-full"
                        :disabled="currentPlan === 'free'"
                    >
                        {{ currentPlan === 'free' ? $t('plans.currentPlan') : $t('plans.selectPlan') }}
                    </button>
                </div>

                <!-- Plan PRO -->
                <div class="plan-card plan-featured" :class="{ 'plan-current': currentPlan === 'pro' }">
                    <div class="plan-badge plan-badge-featured">{{ $t('plans.recommended') }}</div>
                    <div class="plan-header">
                        <h3 class="plan-name">PRO</h3>
                        <div class="plan-price">
                            <span class="price-amount">$3.500</span>
                            <span class="price-period">{{ $t('plans.perMonth') }}</span>
                        </div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="pi pi-check"></i> 1 {{ $t('plans.features.professionals').split(' | ')[0] }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.unlimited') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.emailReminders') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.publicPage') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.savedClients') }}</li>
                        <li class="feature-disabled"><i class="pi pi-times"></i> {{ $t('plans.features.noWhatsapp') }}</li>
                    </ul>
                    <button
                        class="btn btn-primary w-full"
                        :disabled="currentPlan === 'pro' || processingPlan === 'pro'"
                        @click="selectPlan('pro')"
                    >
                        {{ currentPlan === 'pro' ? $t('plans.currentPlan') : $t('plans.upgradeTo') + ' PRO' }}
                    </button>
                </div>

                <!-- Plan PREMIUM -->
                <div class="plan-card" :class="{ 'plan-current': currentPlan === 'premium' }">
                    <div class="plan-badge" v-if="currentPlan === 'premium'">{{ $t('plans.currentPlan') }}</div>
                    <div class="plan-header">
                        <h3 class="plan-name">PREMIUM</h3>
                        <div class="plan-price">
                            <span class="price-amount">$7.000</span>
                            <span class="price-period">{{ $t('plans.perMonth') }}</span>
                        </div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.professionals').split(' | ')[1] }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.unlimited') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.emailReminders') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.whatsapp') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.prioritySupport') }}</li>
                        <li><i class="pi pi-check"></i> {{ $t('plans.features.advancedReports') }}</li>
                    </ul>
                    <button
                        class="btn btn-secondary w-full"
                        :disabled="currentPlan === 'premium' || processingPlan === 'premium'"
                        @click="selectPlan('premium')"
                    >
                        {{ currentPlan === 'premium' ? $t('plans.currentPlan') : $t('plans.upgradeTo') + ' PREMIUM' }}
                    </button>
                </div>
            </div>

            <!-- Info pago anual -->
            <div class="annual-info">
                <i class="pi pi-info-circle"></i>
                <span>{{ $t('plans.annualDiscount') }}</span>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useNotify } from '../composables/useNotify'
import { paymentsService } from '../services/api'

const route = useRoute()
const { success, error } = useNotify()

const currentPlan = ref('free')
const plans = ref([])
const loading = ref(false)
const processingPlan = ref(null)

// Cargar plan actual del usuario
const fetchCurrentPlan = async () => {
    try {
        const response = await paymentsService.getCurrentPlan()
        currentPlan.value = response.data.plan?.name || 'free'
    } catch (err) {
        console.error('Error fetching current plan:', err)
    }
}

// Cargar planes disponibles
const fetchPlans = async () => {
    try {
        const response = await paymentsService.getPlans()
        plans.value = response.data
    } catch (err) {
        console.error('Error fetching plans:', err)
    }
}

// Seleccionar plan y redirigir a MercadoPago
const selectPlan = async (planName) => {
    const plan = plans.value.find(p => p.name === planName)
    if (!plan) {
        error('Plan no encontrado')
        return
    }

    processingPlan.value = planName
    loading.value = true

    try {
        const response = await paymentsService.createCheckout(plan.id)

        // response contiene: payment_link, payment_id, plan
        const checkoutUrl = response.data.payment_link

        if (checkoutUrl) {
            success('Redirigiendo a MercadoPago...')
            // Guardar el payment_id en sessionStorage por si lo necesitas después
            sessionStorage.setItem('payment_id', response.data.payment_id)
            window.location.href = checkoutUrl
        } else {
            error('Error al crear el link de pago')
        }
    } catch (err) {
        console.error('Error creating checkout:', err)
        error('Error al procesar el pago')
    } finally {
        loading.value = false
        processingPlan.value = null
    }
}

// Verificar estado del pago al volver de MercadoPago
const checkPaymentStatus = async () => {
    const status = route.query.status
    const paymentId = sessionStorage.getItem('payment_id')

    if (status) {
        if (status === 'approved') {
            success('¡Pago aprobado! Tu plan ha sido actualizado.')
            // Confirmar el pago en el backend
            if (paymentId) {
                try {
                    await paymentsService.confirmPayment(paymentId)
                } catch (err) {
                    console.error('Error confirming payment:', err)
                }
            }
            sessionStorage.removeItem('payment_id')
        } else if (status === 'pending') {
            success('Tu pago está pendiente de confirmación.')
        } else if (status === 'failure') {
            error('El pago no pudo ser procesado. Intenta nuevamente.')
            sessionStorage.removeItem('payment_id')
        }

        // Recargar plan actual
        await fetchCurrentPlan()
    }
}

onMounted(async () => {
    await Promise.all([fetchCurrentPlan(), fetchPlans()])
    await checkPaymentStatus()
})
</script>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.page-header h2 {
    margin-bottom: var(--spacing-sm);
}

.planes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.plan-card {
    position: relative;
    background: var(--color-white);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.plan-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.plan-featured {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
}

.plan-current {
    border-color: var(--color-success);
}

.plan-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-success);
    color: white;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
}

.plan-badge-featured {
    background: var(--color-primary);
}

.plan-header {
    text-align: center;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--spacing-md);
}

.plan-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
}

.plan-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--spacing-xs);
}

.price-amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
}

.price-period {
    color: var(--color-text-muted);
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--spacing-lg) 0;
}

.plan-features li {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) 0;
    color: var(--color-text);
}

.plan-features li i {
    font-size: 0.875rem;
}

.plan-features li .pi-check {
    color: var(--color-success);
}

.plan-features li .pi-times {
    color: var(--color-text-muted);
}

.feature-disabled {
    opacity: 0.5;
}

.annual-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--color-bg-light);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
}

.annual-info i {
    color: var(--color-info);
}

/* Dark mode */
.dark-mode .plan-card {
    background: #27272a;
    border-color: #3f3f46;
}

.dark-mode .plan-featured {
    border-color: var(--color-info);
}

.dark-mode .plan-header {
    border-color: #3f3f46;
}

.dark-mode .price-amount {
    color: #e4e4e7;
}

.dark-mode .plan-features li {
    color: #e4e4e7;
}

.dark-mode .annual-info {
    background: #3f3f46;
}
</style>
