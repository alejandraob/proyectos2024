<template>
    <MainLayout>
        <div class="page-container">
            <div class="page-header">
                <div>
                    <h2>{{ $t('income.title') }}</h2>
                    <p class="text-muted">{{ $t('income.subtitle') }}</p>
                </div>
                <button class="btn btn-primary" @click="showNewPaymentModal = true">
                    <i class="pi pi-plus"></i>
                    {{ $t('income.registerPayment') }}
                </button>
            </div>

            <!-- Resumen -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-success">
                        <i class="pi pi-wallet"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${{ totals.today.toLocaleString('es-AR') }}</span>
                        <span class="stat-label">{{ $t('income.today') }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-info">
                        <i class="pi pi-calendar"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${{ totals.week.toLocaleString('es-AR') }}</span>
                        <span class="stat-label">{{ $t('income.thisWeek') }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="pi pi-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${{ totals.month.toLocaleString('es-AR') }}</span>
                        <span class="stat-label">{{ $t('income.thisMonth') }}</span>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="filters-bar">
                <div class="filter-group">
                    <label>{{ $t('income.from') }}</label>
                    <input type="date" v-model="filters.from" class="form-control" />
                </div>
                <div class="filter-group">
                    <label>{{ $t('income.to') }}</label>
                    <input type="date" v-model="filters.to" class="form-control" />
                </div>
                <div class="filter-group">
                    <label>{{ $t('income.method') }}</label>
                    <select v-model="filters.method" class="form-control">
                        <option value="">{{ $t('income.allMethods') }}</option>
                        <option value="efectivo">{{ $t('income.cash') }}</option>
                        <option value="transferencia">{{ $t('income.transfer') }}</option>
                        <option value="tarjeta">{{ $t('income.card') }}</option>
                        <option value="mercadopago">{{ $t('income.mercadopago') }}</option>
                    </select>
                </div>
                <button class="btn btn-outline" @click="exportData">
                    <i class="pi pi-download"></i>
                    {{ $t('app.export') }}
                </button>
            </div>

            <!-- Lista de cobros -->
            <div class="card">
                <div class="card-body">
                    <div v-if="payments.length === 0" class="empty-state">
                        <i class="pi pi-wallet"></i>
                        <p>{{ $t('income.noPayments') }}</p>
                        <button class="btn btn-primary" @click="showNewPaymentModal = true">
                            {{ $t('income.firstPayment') }}
                        </button>
                    </div>
                    <table v-else class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('billing.date') }}</th>
                                <th>{{ $t('income.client') }}</th>
                                <th>{{ $t('income.service') }}</th>
                                <th>{{ $t('income.method') }}</th>
                                <th>{{ $t('income.amount') }}</th>
                                <th>{{ $t('app.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="payment in payments" :key="payment.id">
                                <td>{{ formatDate(payment.date) }}</td>
                                <td>{{ payment.client }}</td>
                                <td>{{ payment.service || '-' }}</td>
                                <td>
                                    <span :class="'method-badge method-' + payment.method">
                                        {{ $t('income.' + payment.method) }}
                                    </span>
                                </td>
                                <td class="text-success font-bold">
                                    ${{ payment.amount.toLocaleString('es-AR') }}
                                </td>
                                <td>
                                    <button class="btn btn-ghost btn-sm" :title="$t('app.edit')" @click="editPayment(payment)">
                                        <i class="pi pi-pencil"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm text-danger" :title="$t('app.delete')" @click="deletePayment(payment)">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal nuevo cobro -->
        <Dialog
            v-model:visible="showNewPaymentModal"
            :header="$t('income.registerPayment')"
            :modal="true"
            :style="{ width: '450px' }"
        >
            <form @submit.prevent="savePayment">
                <div class="form-group">
                    <label>{{ $t('income.client') }} *</label>
                    <input type="text" v-model="paymentForm.client" class="form-control" required />
                </div>
                <div class="form-group">
                    <label>{{ $t('income.service') }}</label>
                    <input type="text" v-model="paymentForm.service" class="form-control" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('income.amount') }} *</label>
                        <input type="number" v-model="paymentForm.amount" class="form-control" min="0" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('income.method') }} *</label>
                        <select v-model="paymentForm.method" class="form-control" required>
                            <option value="efectivo">{{ $t('income.cash') }}</option>
                            <option value="transferencia">{{ $t('income.transfer') }}</option>
                            <option value="tarjeta">{{ $t('income.card') }}</option>
                            <option value="mercadopago">{{ $t('income.mercadopago') }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>{{ $t('billing.date') }}</label>
                    <input type="date" v-model="paymentForm.date" class="form-control" />
                </div>
                <div class="form-group">
                    <label>{{ $t('income.notes') }}</label>
                    <textarea v-model="paymentForm.notes" class="form-control" rows="2"></textarea>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-ghost" @click="showNewPaymentModal = false">{{ $t('app.cancel') }}</button>
                <button class="btn btn-primary" @click="savePayment">{{ $t('app.save') }}</button>
            </template>
        </Dialog>
    </MainLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Dialog from 'primevue/dialog'
import { useNotify } from '../composables/useNotify'

const { success, confirm } = useNotify()

const showNewPaymentModal = ref(false)

// Totales (TODO: obtener del backend)
const totals = ref({
    today: 0,
    week: 0,
    month: 0
})

// Filtros
const filters = reactive({
    from: '',
    to: '',
    method: ''
})

// Pagos (TODO: obtener del backend)
const payments = ref([
    // Ejemplo
    // { id: 1, date: '2025-12-16', client: 'María García', service: 'Corte', method: 'efectivo', amount: 5000 },
])

// Formulario
const paymentForm = reactive({
    id: null,
    client: '',
    service: '',
    amount: null,
    method: 'efectivo',
    date: new Date().toISOString().split('T')[0],
    notes: ''
})

const resetForm = () => {
    paymentForm.id = null
    paymentForm.client = ''
    paymentForm.service = ''
    paymentForm.amount = null
    paymentForm.method = 'efectivo'
    paymentForm.date = new Date().toISOString().split('T')[0]
    paymentForm.notes = ''
}

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-AR')
}

const savePayment = () => {
    // TODO: Guardar en backend
    success('Cobro registrado correctamente')
    showNewPaymentModal.value = false
    resetForm()
}

const editPayment = (payment) => {
    Object.assign(paymentForm, payment)
    showNewPaymentModal.value = true
}

const deletePayment = async (payment) => {
    const confirmed = await confirm(`¿Eliminar el cobro de $${payment.amount} a ${payment.client}?`)
    if (confirmed) {
        // TODO: Eliminar en backend
        success('Cobro eliminado')
    }
}

const exportData = () => {
    // TODO: Exportar a Excel/PDF
    success('Exportando datos...')
}
</script>

<style scoped>
.page-container {
    max-width: 1100px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);
}

.page-header h2 {
    margin-bottom: var(--spacing-xs);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    background: var(--color-white);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.stat-icon i {
    font-size: 1.25rem;
}

.bg-success { background-color: var(--color-success); }
.bg-info { background-color: var(--color-info); }
.bg-primary { background-color: var(--color-primary); }

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
}

.filters-bar {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-end;
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.filter-group label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
}

.filter-group .form-control {
    min-width: 140px;
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

.method-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
}

.method-efectivo {
    background-color: #dcfce7;
    color: #166534;
}

.method-transferencia {
    background-color: #dbeafe;
    color: #1e40af;
}

.method-tarjeta {
    background-color: #fef3c7;
    color: #92400e;
}

.method-mercadopago {
    background-color: #e0e7ff;
    color: #3730a3;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

.text-success {
    color: var(--color-success);
}

.font-bold {
    font-weight: 600;
}

.text-danger {
    color: var(--color-danger) !important;
}

/* Dark mode */
.dark-mode .stat-card {
    background: #27272a;
}

.dark-mode .stat-value {
    color: #e4e4e7;
}

.dark-mode .method-efectivo {
    background-color: #14532d;
    color: #86efac;
}

.dark-mode .method-transferencia {
    background-color: #1e3a5f;
    color: #93c5fd;
}

.dark-mode .method-tarjeta {
    background-color: #78350f;
    color: #fcd34d;
}

.dark-mode .method-mercadopago {
    background-color: #312e81;
    color: #a5b4fc;
}
</style>
