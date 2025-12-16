<template>
    <MainLayout>
        <!-- Cards de resumen -->
        <div class="grid grid-cols-4 gap-4 mb-5">
            <!-- Turnos de hoy -->
            <div class="card">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-muted mb-1">{{ $t('dashboard.todayAppointments') }}</p>
                            <p class="text-lg font-bold">{{ stats.turnosHoy }}</p>
                        </div>
                        <div class="text-info">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pendientes -->
            <div class="card">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-muted mb-1">{{ $t('agenda.pending') }}</p>
                            <p class="text-lg font-bold text-warning">{{ stats.pendientes }}</p>
                        </div>
                        <div class="text-warning">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Clientes -->
            <div class="card">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-muted mb-1">{{ $t('nav.clients') }}</p>
                            <p class="text-lg font-bold">{{ stats.clientes }}</p>
                        </div>
                        <div class="text-secondary">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Este mes -->
            <div class="card">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-muted mb-1">{{ $t('dashboard.monthAppointments') }}</p>
                            <p class="text-lg font-bold text-success">{{ stats.esteMes }}</p>
                        </div>
                        <div class="text-success">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Próximos turnos -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">{{ $t('dashboard.nextAppointments') }}</h3>
                <router-link to="/agenda" class="btn btn-sm btn-outline">
                    {{ $t('nav.agenda') }}
                </router-link>
            </div>

            <div v-if="loading" class="card-body text-center">
                <div class="spinner spinner-lg"></div>
            </div>

            <div v-else-if="proximosTurnos.length === 0" class="card-body text-center text-muted">
                <p>{{ $t('dashboard.noAppointments') }}</p>
                <router-link to="/agenda" class="btn btn-primary mt-3">
                    {{ $t('agenda.newAppointment') }}
                </router-link>
            </div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>{{ $t('agenda.time') }}</th>
                        <th>{{ $t('agenda.client') }}</th>
                        <th>{{ $t('agenda.notes') }}</th>
                        <th>{{ $t('agenda.status') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="turno in proximosTurnos" :key="turno.id">
                        <td>
                            <span class="font-semibold">{{ formatHora(turno.fecha_inicio) }}</span>
                            <span class="text-muted text-sm"> - {{ formatHora(turno.fecha_fin) }}</span>
                        </td>
                        <td>{{ turno.client?.nombre || $t('app.noData') }}</td>
                        <td>{{ turno.motivo || '-' }}</td>
                        <td>
                            <span :class="'badge badge-' + turno.estado">
                                {{ $t('agenda.' + turno.estado) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { appointmentsService, businessService } from '../services/api'

// Estados
const loading = ref(true)
const proximosTurnos = ref([])
const stats = reactive({
    turnosHoy: 0,
    pendientes: 0,
    clientes: 0,
    esteMes: 0,
})

// Formatear hora
const formatHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Cargar datos
const fetchData = async () => {
    loading.value = true

    try {
        // Obtener estadísticas del backend (una sola llamada)
        const statsRes = await businessService.getStats()
        stats.turnosHoy = statsRes.data.turnos_hoy
        stats.pendientes = statsRes.data.turnos_pendientes
        stats.clientes = statsRes.data.total_clientes
        stats.esteMes = statsRes.data.turnos_mes

        // Obtener turnos de hoy para la tabla
        const hoy = new Date().toISOString().split('T')[0]
        const turnosRes = await appointmentsService.getAll({ fecha: hoy })
        proximosTurnos.value = turnosRes.data.slice(0, 5)

    } catch (error) {
        console.error('Error cargando dashboard:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>
