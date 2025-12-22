<template>
    <MainLayout>
        <div class="page-container">
            <div class="page-header">
                <div>
                    <h2>{{ $t('reports.title') }}</h2>
                    <p class="text-muted">{{ $t('reports.subtitle') }}</p>
                </div>
                <div class="header-actions">
                    <div class="filter-group">
                        <label>{{ $t('reports.period') }}</label>
                        <select v-model="periodo" class="form-input" @change="loadAllData">
                            <option value="week">{{ $t('reports.lastWeek') }}</option>
                            <option value="month">{{ $t('reports.lastMonth') }}</option>
                            <option value="quarter">{{ $t('reports.lastQuarter') }}</option>
                            <option value="year">{{ $t('reports.lastYear') }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="loading-container">
                <i class="pi pi-spin pi-spinner"></i>
                <p>{{ $t('reports.loading') }}</p>
            </div>

            <template v-else>
                <!-- Resumen General -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary">
                            <i class="pi pi-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.total_clientes_atendidos }}</span>
                            <span class="stat-label">{{ $t('reports.clientsServed') }}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon bg-success">
                            <i class="pi pi-calendar-plus"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.total_turnos }}</span>
                            <span class="stat-label">{{ $t('reports.totalAppointments') }}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon bg-info">
                            <i class="pi pi-percentage"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.tasa_asistencia }}%</span>
                            <span class="stat-label">{{ $t('reports.attendanceRate') }}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon bg-warning">
                            <i class="pi pi-wallet"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">${{ formatMoney(stats.ingresos_totales) }}</span>
                            <span class="stat-label">{{ $t('reports.totalIncome') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Secciones de reportes -->
                <div class="reports-grid">
                    <!-- Horarios más solicitados -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3><i class="pi pi-clock"></i> {{ $t('reports.popularHours') }}</h3>
                        </div>
                        <div class="card-body">
                            <div v-if="horariosPico.length === 0" class="empty-state-sm">
                                <p>{{ $t('reports.noData') }}</p>
                            </div>
                            <div v-else class="chart-bars">
                                <div v-for="hora in horariosPico" :key="hora.hora" class="bar-item">
                                    <div class="bar-label">{{ hora.hora }}:00</div>
                                    <div class="bar-container">
                                        <div class="bar-fill" :style="{ width: getBarWidth(hora.cantidad, maxHorario) }"></div>
                                    </div>
                                    <div class="bar-value">{{ hora.cantidad }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Días más ocupados -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3><i class="pi pi-calendar"></i> {{ $t('reports.busyDays') }}</h3>
                        </div>
                        <div class="card-body">
                            <div v-if="diasOcupados.length === 0" class="empty-state-sm">
                                <p>{{ $t('reports.noData') }}</p>
                            </div>
                            <div v-else class="chart-bars">
                                <div v-for="dia in diasOcupados" :key="dia.dia" class="bar-item">
                                    <div class="bar-label">{{ dia.nombre || getDayName(dia.dia) }}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill bar-info" :style="{ width: getBarWidth(dia.cantidad, maxDia) }"></div>
                                    </div>
                                    <div class="bar-value">{{ dia.cantidad }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Clientes Recurrentes -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3><i class="pi pi-star"></i> {{ $t('reports.topClients') }}</h3>
                        </div>
                        <div class="card-body">
                            <div v-if="topClientes.length === 0" class="empty-state-sm">
                                <p>{{ $t('reports.noData') }}</p>
                            </div>
                            <table v-else class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>{{ $t('reports.client') }}</th>
                                        <th class="text-center">{{ $t('reports.visits') }}</th>
                                        <th class="text-right">{{ $t('reports.spent') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(cliente, index) in topClientes" :key="cliente.id">
                                        <td>
                                            <div class="client-row">
                                                <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                                                {{ cliente.nombre }}
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge badge-primary">{{ cliente.total_turnos }}</span>
                                        </td>
                                        <td class="text-right text-success font-bold">
                                            ${{ formatMoney(cliente.total_gastado) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Servicios más populares -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3><i class="pi pi-chart-bar"></i> {{ $t('reports.popularServices') }}</h3>
                        </div>
                        <div class="card-body">
                            <div v-if="serviciosPopulares.length === 0" class="empty-state-sm">
                                <p>{{ $t('reports.noData') }}</p>
                            </div>
                            <div v-else class="chart-bars">
                                <div v-for="servicio in serviciosPopulares" :key="servicio.id" class="bar-item">
                                    <div class="bar-label">{{ servicio.nombre }}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill bar-success" :style="{ width: getBarWidth(servicio.cantidad, maxServicio) }"></div>
                                    </div>
                                    <div class="bar-value">{{ servicio.cantidad }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { reportsService } from '../services/income'
import { useNotify } from '../composables/useNotify'

const { error } = useNotify()

const loading = ref(true)
const periodo = ref('month')

// Datos
const stats = ref({
    total_clientes_atendidos: 0,
    total_turnos: 0,
    tasa_asistencia: 0,
    ingresos_totales: 0
})
const horariosPico = ref([])
const diasOcupados = ref([])
const topClientes = ref([])
const serviciosPopulares = ref([])

// Máximos para las barras
const maxHorario = computed(() => {
    if (horariosPico.value.length === 0) return 1
    return Math.max(...horariosPico.value.map(h => h.cantidad))
})

const maxDia = computed(() => {
    if (diasOcupados.value.length === 0) return 1
    return Math.max(...diasOcupados.value.map(d => d.cantidad))
})

const maxServicio = computed(() => {
    if (serviciosPopulares.value.length === 0) return 1
    return Math.max(...serviciosPopulares.value.map(s => s.cantidad))
})

const formatMoney = (amount) => {
    if (!amount) return '0'
    return parseFloat(amount).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const getBarWidth = (value, max) => {
    if (max === 0) return '0%'
    return `${(value / max) * 100}%`
}

const getDayName = (dayNumber) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[dayNumber] || dayNumber
}

const loadAllData = async () => {
    loading.value = true
    try {
        const [dashboardRes, hourlyRes, weekdayRes, clientsRes] = await Promise.all([
            reportsService.getDashboard({ periodo: periodo.value }),
            reportsService.getHourlyStats({ periodo: periodo.value }),
            reportsService.getWeekdayStats({ periodo: periodo.value }),
            reportsService.getTopClients({ periodo: periodo.value, limit: 10 })
        ])

        // Dashboard stats - adaptar a la estructura del backend
        const dashboard = dashboardRes.data
        stats.value = {
            total_clientes_atendidos: dashboard.clientes?.total || 0,
            total_turnos: dashboard.turnos?.total_mes || 0,
            tasa_asistencia: dashboard.turnos?.total_mes > 0
                ? Math.round((dashboard.turnos.confirmados / dashboard.turnos.total_mes) * 100)
                : 0,
            ingresos_totales: parseFloat(dashboard.ingresos?.total_mes) || 0
        }

        // Servicios populares del dashboard (si existe)
        serviciosPopulares.value = (dashboard.servicios_populares || []).slice(0, 5)

        // Horarios pico - el backend devuelve { data: [...] } con campo "total"
        const hourlyData = hourlyRes.data?.data || hourlyRes.data || []
        horariosPico.value = hourlyData
            .map(h => ({ hora: h.hora, cantidad: h.total }))
            .filter(h => h.cantidad > 0)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 8)

        // Días ocupados - el backend devuelve { data: [...] } con campo "total"
        const weekdayData = weekdayRes.data?.data || weekdayRes.data || []
        diasOcupados.value = weekdayData.map(d => ({
            dia: d.dia,
            nombre: d.nombre,
            cantidad: d.total
        }))

        // Top clientes - el backend devuelve { data: [...] }
        const clientsData = clientsRes.data?.data || clientsRes.data || []
        topClientes.value = clientsData.map(c => ({
            id: c.id,
            nombre: c.nombre,
            total_turnos: c.total_turnos,
            total_gastado: c.total_gastado || 0
        }))

    } catch (err) {
        console.error('Error cargando reportes:', err)
        error('Error al cargar los reportes')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadAllData()
})
</script>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
    gap: var(--spacing-md);
}

.page-header h2 {
    margin-bottom: var(--spacing-xs);
}

.header-actions {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-end;
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
    min-width: 160px;
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
    margin-bottom: var(--spacing-xl);
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

.bg-primary { background-color: var(--color-primary); }
.bg-success { background-color: var(--color-success); }
.bg-info { background-color: var(--color-info); }
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

.reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);
}

.report-card {
    min-height: 300px;
}

.card-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.card-header h3 i {
    color: var(--color-primary);
}

.empty-state-sm {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-muted);
}

/* Barras de gráfico */
.chart-bars {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.bar-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.bar-label {
    width: 80px;
    font-size: 0.875rem;
    color: var(--color-text);
    flex-shrink: 0;
}

.bar-container {
    flex: 1;
    height: 24px;
    background: var(--color-bg-light);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-sm);
    transition: width 0.3s ease;
}

.bar-fill.bar-info {
    background: var(--color-info);
}

.bar-fill.bar-success {
    background: var(--color-success);
}

.bar-value {
    width: 40px;
    text-align: right;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
}

/* Tabla de clientes */
.table-sm {
    font-size: 0.875rem;
}

.table-sm th,
.table-sm td {
    padding: 0.5rem 0.75rem;
}

.client-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--color-bg-light);
    color: var(--color-text-muted);
}

.rank-badge.rank-1 {
    background: #fef3c7;
    color: #92400e;
}

.rank-badge.rank-2 {
    background: #e5e7eb;
    color: #374151;
}

.rank-badge.rank-3 {
    background: #fed7aa;
    color: #9a3412;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-success { color: var(--color-success); }
.font-bold { font-weight: 600; }

/* Dark mode */
.dark-mode .stat-card,
.dark-mode .report-card {
    background: #27272a;
}

.dark-mode .stat-value {
    color: #e4e4e7;
}

.dark-mode .bar-container {
    background: #3f3f46;
}

.dark-mode .rank-badge {
    background: #3f3f46;
}

.dark-mode .rank-badge.rank-1 {
    background: #78350f;
    color: #fcd34d;
}

.dark-mode .rank-badge.rank-2 {
    background: #374151;
    color: #d1d5db;
}

.dark-mode .rank-badge.rank-3 {
    background: #7c2d12;
    color: #fdba74;
}
</style>
