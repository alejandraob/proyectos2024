<template>
    <MainLayout>
        <div class="page-container">
            <div class="page-header">
                <h2>{{ $t('billing.title') }}</h2>
                <p class="text-muted">{{ $t('billing.subtitle') }}</p>
            </div>

            <!-- Plan actual -->
            <div class="card mb-4">
                <div class="card-header">
                    <h3>{{ $t('billing.currentPlan') }}</h3>
                </div>
                <div class="card-body">
                    <div class="current-plan">
                        <div class="plan-info">
                            <span class="plan-badge-large">{{ currentPlan.name }}</span>
                            <p class="plan-description">{{ currentPlan.description }}</p>
                        </div>
                        <div class="plan-price-info">
                            <span class="plan-price">${{ currentPlan.price }}</span>
                            <span class="plan-period">/mes</span>
                        </div>
                    </div>
                    <div class="plan-status" v-if="currentPlan.name !== 'FREE'">
                        <p><strong>{{ $t('billing.nextBilling') }}:</strong> {{ nextBillingDate }}</p>
                        <p><strong>{{ $t('billing.paymentMethod') }}:</strong> **** **** **** 4532</p>
                    </div>
                    <div class="plan-actions">
                        <router-link to="/planes" class="btn btn-outline">
                            <i class="pi pi-arrow-up"></i>
                            {{ $t('billing.changePlan') }}
                        </router-link>
                        <button v-if="currentPlan.name !== 'FREE'" class="btn btn-ghost text-danger">
                            {{ $t('billing.cancelSubscription') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Historial de pagos -->
            <div class="card">
                <div class="card-header">
                    <h3>{{ $t('billing.paymentHistory') }}</h3>
                </div>
                <div class="card-body">
                    <div v-if="invoices.length === 0" class="empty-state">
                        <i class="pi pi-file-pdf"></i>
                        <p>{{ $t('billing.noPayments') }}</p>
                    </div>
                    <table v-else class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('billing.date') }}</th>
                                <th>{{ $t('billing.description') }}</th>
                                <th>{{ $t('billing.amount') }}</th>
                                <th>{{ $t('billing.status') }}</th>
                                <th>{{ $t('app.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="invoice in invoices" :key="invoice.id">
                                <td>{{ formatDate(invoice.date) }}</td>
                                <td>{{ invoice.description }}</td>
                                <td>${{ invoice.amount.toLocaleString('es-AR') }}</td>
                                <td>
                                    <span :class="'badge badge-' + invoice.status">
                                        {{ $t('billing.' + invoice.status) }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-ghost btn-sm" :title="$t('billing.download')">
                                        <i class="pi pi-download"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'

// TODO: Obtener del backend
const currentPlan = ref({
    name: 'FREE',
    description: 'Plan gratuito con funciones básicas',
    price: 0
})

const nextBillingDate = computed(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toLocaleDateString('es-AR')
})

// TODO: Obtener del backend
const invoices = ref([
    // Ejemplo de datos
    // { id: 1, date: '2025-12-01', description: 'Plan PRO - Diciembre 2025', amount: 3500, status: 'paid' },
    // { id: 2, date: '2025-11-01', description: 'Plan PRO - Noviembre 2025', amount: 3500, status: 'paid' },
])

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-AR')
}
</script>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: var(--spacing-xl);
}

.page-header h2 {
    margin-bottom: var(--spacing-sm);
}

.current-plan {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--spacing-md);
}

.plan-badge-large {
    display: inline-block;
    background: var(--color-primary);
    color: white;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: var(--spacing-xs);
}

.plan-description {
    color: var(--color-text-muted);
    margin: 0;
}

.plan-price-info {
    text-align: right;
}

.plan-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
}

.plan-period {
    color: var(--color-text-muted);
}

.plan-status {
    margin-bottom: var(--spacing-md);
}

.plan-status p {
    margin: var(--spacing-xs) 0;
    color: var(--color-text-muted);
}

.plan-actions {
    display: flex;
    gap: var(--spacing-md);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-muted);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.text-danger {
    color: var(--color-danger) !important;
}

.badge-paid {
    background-color: var(--color-success);
    color: white;
}

.badge-pending {
    background-color: var(--color-warning);
    color: var(--color-dark);
}

.badge-failed {
    background-color: var(--color-danger);
    color: white;
}

/* Dark mode */
.dark-mode .plan-price {
    color: #e4e4e7;
}

.dark-mode .current-plan {
    border-color: #3f3f46;
}
</style>
