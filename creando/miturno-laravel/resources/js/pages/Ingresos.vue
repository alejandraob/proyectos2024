<template>
    <MainLayout>
        <div class="page-container">
            <div class="page-header">
                <div>
                    <h2>{{ $t('income.title') }}</h2>
                    <p class="text-muted">{{ $t('income.subtitle') }}</p>
                </div>
                <button class="btn btn-primary" @click="openNewModal">
                    <i class="pi pi-plus"></i>
                    {{ $t('income.registerPayment') }}
                </button>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="loading-container">
                <i class="pi pi-spin pi-spinner"></i>
                <p>Cargando ingresos...</p>
            </div>

            <template v-else>
                <!-- Resumen -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon bg-success">
                            <i class="pi pi-wallet"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${{ formatMoney(summary.mes_actual?.total || 0) }}</span>
                            <span class="stat-label">{{ $t('income.thisMonth') }}</span>
                            <span v-if="summary.mes_actual?.porcentaje_cambio" class="stat-change" :class="summary.mes_actual.porcentaje_cambio >= 0 ? 'positive' : 'negative'">
                                {{ summary.mes_actual.porcentaje_cambio >= 0 ? '+' : '' }}{{ summary.mes_actual.porcentaje_cambio }}%
                            </span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon bg-info">
                            <i class="pi pi-calendar"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${{ formatMoney(summary.mes_anterior?.total || 0) }}</span>
                            <span class="stat-label">Mes anterior</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon bg-warning">
                            <i class="pi pi-clock"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${{ formatMoney(summary.pendiente || 0) }}</span>
                            <span class="stat-label">Pendiente de cobro</span>
                        </div>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filters-bar">
                    <div class="filter-group">
                        <label>{{ $t('income.from') }}</label>
                        <input type="date" v-model="filters.fecha_inicio" class="form-input" @change="loadPayments" />
                    </div>
                    <div class="filter-group">
                        <label>{{ $t('income.to') }}</label>
                        <input type="date" v-model="filters.fecha_fin" class="form-input" @change="loadPayments" />
                    </div>
                    <div class="filter-group">
                        <label>{{ $t('income.method') }}</label>
                        <select v-model="filters.metodo_pago" class="form-input" @change="loadPayments">
                            <option value="">{{ $t('income.allMethods') }}</option>
                            <option value="efectivo">{{ $t('income.cash') }}</option>
                            <option value="transferencia">{{ $t('income.transfer') }}</option>
                            <option value="tarjeta">{{ $t('income.card') }}</option>
                            <option value="mercadopago">{{ $t('income.mercadopago') }}</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Estado</label>
                        <select v-model="filters.estado" class="form-input" @change="loadPayments">
                            <option value="">Todos</option>
                            <option value="pagado">Pagado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="cancelado">Cancelado</option>
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
                            <button class="btn btn-primary" @click="openNewModal">
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
                                    <th>Estado</th>
                                    <th>{{ $t('income.amount') }}</th>
                                    <th>{{ $t('app.actions') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="payment in payments" :key="payment.id">
                                    <td>{{ formatDate(payment.fecha_pago) }}</td>
                                    <td>{{ payment.client?.nombre || '-' }}</td>
                                    <td>{{ payment.service?.nombre || payment.descripcion || '-' }}</td>
                                    <td>
                                        <span :class="'method-badge method-' + payment.metodo_pago">
                                            {{ getMethodLabel(payment.metodo_pago) }}
                                        </span>
                                    </td>
                                    <td>
                                        <span :class="'status-badge status-' + payment.estado">
                                            {{ getStatusLabel(payment.estado) }}
                                        </span>
                                    </td>
                                    <td class="text-success font-bold">
                                        ${{ formatMoney(payment.monto) }}
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
            </template>
        </div>

        <!-- Modal nuevo/editar cobro -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">{{ isEditing ? 'Editar Ingreso' : $t('income.registerPayment') }}</h3>
                    <button @click="closeModal" class="modal-close">&times;</button>
                </div>
                <form @submit.prevent="savePayment">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">{{ $t('income.client') }}</label>
                            <select v-model="paymentForm.client_id" class="form-input">
                                <option :value="null">-- Sin cliente --</option>
                                <option v-for="client in clients" :key="client.id" :value="client.id">
                                    {{ client.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Servicio</label>
                            <select v-model="paymentForm.service_id" class="form-input">
                                <option :value="null">-- Sin servicio --</option>
                                <option v-for="service in services" :key="service.id" :value="service.id">
                                    {{ service.nombre }} - ${{ formatMoney(service.precio) }}
                                </option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">{{ $t('income.amount') }} *</label>
                                <input type="number" v-model="paymentForm.monto" class="form-input" min="0" step="0.01" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">{{ $t('income.method') }} *</label>
                                <select v-model="paymentForm.metodo_pago" class="form-input" required>
                                    <option value="efectivo">{{ $t('income.cash') }}</option>
                                    <option value="transferencia">{{ $t('income.transfer') }}</option>
                                    <option value="tarjeta">{{ $t('income.card') }}</option>
                                    <option value="mercadopago">{{ $t('income.mercadopago') }}</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">{{ $t('billing.date') }} *</label>
                                <input type="date" v-model="paymentForm.fecha_pago" class="form-input" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Estado</label>
                                <select v-model="paymentForm.estado" class="form-input">
                                    <option value="pagado">Pagado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Descripcion</label>
                            <textarea v-model="paymentForm.descripcion" class="form-input" rows="2" placeholder="Notas adicionales..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Referencia</label>
                            <input type="text" v-model="paymentForm.referencia" class="form-input" placeholder="No. de transaccion, factura, etc." />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" @click="closeModal" class="btn btn-outline" :disabled="saving">{{ $t('app.cancel') }}</button>
                        <button type="submit" class="btn btn-primary" :disabled="saving">
                            <span v-if="saving" class="spinner"></span>
                            <span v-else>{{ $t('app.save') }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { useNotify } from '../composables/useNotify'
import { incomeService } from '../services/income'
import { clientsService, servicesService } from '../services/api'
import * as XLSX from 'xlsx'

const { success, error, confirmDelete } = useNotify()

const showModal = ref(false)
const isEditing = ref(false)
const loading = ref(true)
const saving = ref(false)

// Datos
const payments = ref([])
const clients = ref([])
const services = ref([])
const summary = ref({
    mes_actual: { total: 0, porcentaje_cambio: 0 },
    mes_anterior: { total: 0 },
    pendiente: 0
})

// Filtros
const filters = reactive({
    fecha_inicio: '',
    fecha_fin: '',
    metodo_pago: '',
    estado: ''
})

// Formulario
const paymentForm = reactive({
    id: null,
    client_id: null,
    service_id: null,
    monto: null,
    metodo_pago: 'efectivo',
    estado: 'pagado',
    fecha_pago: new Date().toISOString().split('T')[0],
    descripcion: '',
    referencia: ''
})

const resetForm = () => {
    paymentForm.id = null
    paymentForm.client_id = null
    paymentForm.service_id = null
    paymentForm.monto = null
    paymentForm.metodo_pago = 'efectivo'
    paymentForm.estado = 'pagado'
    paymentForm.fecha_pago = new Date().toISOString().split('T')[0]
    paymentForm.descripcion = ''
    paymentForm.referencia = ''
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-AR')
}

const formatMoney = (amount) => {
    if (!amount) return '0'
    return parseFloat(amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const getMethodLabel = (method) => {
    const labels = {
        efectivo: 'Efectivo',
        transferencia: 'Transferencia',
        tarjeta: 'Tarjeta',
        mercadopago: 'MercadoPago',
        otro: 'Otro'
    }
    return labels[method] || method
}

const getStatusLabel = (status) => {
    const labels = {
        pagado: 'Pagado',
        pendiente: 'Pendiente',
        cancelado: 'Cancelado',
        reembolsado: 'Reembolsado'
    }
    return labels[status] || status
}

// Cargar datos
const loadPayments = async () => {
    try {
        const response = await incomeService.getAll(filters)
        payments.value = response.data
    } catch (err) {
        console.error('Error cargando ingresos:', err)
    }
}

const loadSummary = async () => {
    try {
        const response = await incomeService.getSummary()
        summary.value = response.data
    } catch (err) {
        console.error('Error cargando resumen:', err)
    }
}

const loadClients = async () => {
    try {
        const response = await clientsService.getAll()
        clients.value = response.data
    } catch (err) {
        console.error('Error cargando clientes:', err)
    }
}

const loadServices = async () => {
    try {
        const response = await servicesService.getAll()
        services.value = response.data
    } catch (err) {
        console.error('Error cargando servicios:', err)
    }
}

// Al seleccionar servicio, autocompletar precio
watch(() => paymentForm.service_id, (newVal) => {
    if (newVal && !paymentForm.monto) {
        const service = services.value.find(s => s.id === newVal)
        if (service?.precio) {
            paymentForm.monto = service.precio
        }
    }
})

// Modal
const openNewModal = () => {
    resetForm()
    isEditing.value = false
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    resetForm()
}

const editPayment = (payment) => {
    isEditing.value = true
    paymentForm.id = payment.id
    paymentForm.client_id = payment.client_id
    paymentForm.service_id = payment.service_id
    paymentForm.monto = payment.monto
    paymentForm.metodo_pago = payment.metodo_pago
    paymentForm.estado = payment.estado
    paymentForm.fecha_pago = payment.fecha_pago
    paymentForm.descripcion = payment.descripcion || ''
    paymentForm.referencia = payment.referencia || ''
    showModal.value = true
}

const savePayment = async () => {
    if (!paymentForm.monto || !paymentForm.fecha_pago) {
        error('Completa los campos requeridos')
        return
    }

    saving.value = true
    try {
        const data = {
            client_id: paymentForm.client_id,
            service_id: paymentForm.service_id,
            monto: paymentForm.monto,
            metodo_pago: paymentForm.metodo_pago,
            estado: paymentForm.estado,
            fecha_pago: paymentForm.fecha_pago,
            descripcion: paymentForm.descripcion,
            referencia: paymentForm.referencia
        }

        if (isEditing.value) {
            await incomeService.update(paymentForm.id, data)
            success('Ingreso actualizado correctamente')
        } else {
            await incomeService.create(data)
            success('Ingreso registrado correctamente')
        }

        closeModal()
        await loadPayments()
        await loadSummary()
    } catch (err) {
        console.error('Error guardando:', err)
        error(err.response?.data?.message || 'Error al guardar el ingreso')
    } finally {
        saving.value = false
    }
}

const deletePayment = async (payment) => {
    const confirmed = await confirmDelete(`el ingreso de $${formatMoney(payment.monto)}`)
    if (confirmed) {
        try {
            await incomeService.delete(payment.id)
            success('Ingreso eliminado')
            await loadPayments()
            await loadSummary()
        } catch (err) {
            error('Error al eliminar el ingreso')
        }
    }
}

const exportData = () => {
    if (payments.value.length === 0) {
        error('No hay ingresos para exportar')
        return
    }

    try {
        const datos = payments.value.map(payment => ({
            Fecha: formatDate(payment.fecha_pago),
            Cliente: payment.client?.nombre || '-',
            Servicio: payment.service?.nombre || payment.descripcion || '-',
            Monto: `$${formatMoney(payment.monto)}`,
            'Método de Pago': getMethodLabel(payment.metodo_pago),
            Estado: getStatusLabel(payment.estado),
            Referencia: payment.referencia || '-',
        }))

        const ws = XLSX.utils.json_to_sheet(datos)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Ingresos')

        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 12 }, // Fecha
            { wch: 25 }, // Cliente
            { wch: 20 }, // Servicio
            { wch: 12 }, // Monto
            { wch: 15 }, // Método de Pago
            { wch: 12 }, // Estado
            { wch: 20 }, // Referencia
        ]

        const hoy = new Date().toISOString().split('T')[0]
        XLSX.writeFile(wb, `ingresos_${hoy}.xlsx`)

        success('Excel exportado correctamente')
    } catch (err) {
        console.error('Error exportando Excel:', err)
        error('Error al exportar Excel')
    }
}

// Cargar todo al montar
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            loadPayments(),
            loadSummary(),
            loadClients(),
            loadServices()
        ])
    } finally {
        loading.value = false
    }
})
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

.loading-container {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-muted);
}

.loading-container i {
    font-size: 2rem;
    margin-bottom: var(--spacing-md);
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
.bg-warning { background-color: #f59e0b; }

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

.stat-change {
    font-size: 0.75rem;
    font-weight: 600;
}

.stat-change.positive {
    color: var(--color-success);
}

.stat-change.negative {
    color: var(--color-danger);
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

.filter-group .form-input {
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

.method-badge, .status-badge {
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

.method-otro {
    background-color: #f3f4f6;
    color: #374151;
}

.status-pagado {
    background-color: #dcfce7;
    color: #166534;
}

.status-pendiente {
    background-color: #fef3c7;
    color: #92400e;
}

.status-cancelado {
    background-color: #fee2e2;
    color: #991b1b;
}

.status-reembolsado {
    background-color: #f3f4f6;
    color: #374151;
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

.dark-mode .status-pagado {
    background-color: #14532d;
    color: #86efac;
}

.dark-mode .status-pendiente {
    background-color: #78350f;
    color: #fcd34d;
}

.dark-mode .status-cancelado {
    background-color: #7f1d1d;
    color: #fca5a5;
}
</style>
