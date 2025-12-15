<template>
    <MainLayout>
        <template #header-actions>
            <button @click="openModal()" class="btn btn-primary">
                + Nuevo turno
            </button>
        </template>

        <!-- Filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="flex items-center gap-4 flex-wrap">
                    <div class="form-group mb-0">
                        <label class="form-label">Fecha</label>
                        <input
                            v-model="filtros.fecha"
                            type="date"
                            class="form-input"
                            @change="fetchTurnos"
                        />
                    </div>
                    <div class="form-group mb-0">
                        <label class="form-label">Estado</label>
                        <select v-model="filtros.estado" class="form-select" @change="fetchTurnos">
                            <option value="">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="confirmado">Confirmados</option>
                            <option value="cancelado">Cancelados</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de turnos -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Turnos del {{ formatFecha(filtros.fecha) }}</h3>
            </div>

            <div v-if="loading" class="card-body text-center p-5">
                <div class="spinner spinner-lg"></div>
            </div>

            <div v-else-if="turnos.length === 0" class="card-body text-center p-5 text-muted">
                <p>No hay turnos para esta fecha</p>
            </div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th style="width: 80px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="turno in turnos" :key="turno.id">
                        <td>
                            <span class="font-semibold">{{ formatHora(turno.fecha_inicio) }}</span>
                            <span class="text-muted"> - {{ formatHora(turno.fecha_fin) }}</span>
                        </td>
                        <td>{{ turno.client?.nombre || 'Sin cliente' }}</td>
                        <td>{{ turno.client?.telefono || '-' }}</td>
                        <td>{{ turno.motivo || '-' }}</td>
                        <td>
                            <span :class="'badge badge-' + turno.estado">
                                {{ turno.estado }}
                            </span>
                        </td>
                        <td>
                            <div class="speeddial-container">
                                <SpeedDial
                                    :model="getAcciones(turno)"
                                    direction="right"
                                    :tooltipOptions="{ position: 'top' }"
                                    showIcon="pi pi-bars"
                                    hideIcon="pi pi-times"
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal turno (crear/editar) -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">{{ editandoId ? 'Editar' : 'Nuevo' }} turno</h3>
                    <button @click="closeModal" class="modal-close">&times;</button>
                </div>
                <form @submit.prevent="guardarTurno">
                    <div class="modal-body">
                        <div class="grid grid-cols-2 gap-3">
                            <div class="form-group">
                                <label class="form-label">Fecha</label>
                                <input v-model="turnoForm.fecha" type="date" class="form-input" required />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Hora inicio</label>
                                <input v-model="turnoForm.hora_inicio" type="time" class="form-input" required />
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Duración</label>
                            <select v-model="turnoForm.duracion" class="form-select">
                                <option value="15">15 minutos</option>
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">1 hora</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nombre del cliente</label>
                            <input v-model="turnoForm.nombre_cliente" type="text" class="form-input" placeholder="Ej: María García" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teléfono</label>
                            <input v-model="turnoForm.telefono_cliente" type="text" class="form-input" placeholder="Ej: 1122334455" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Motivo</label>
                            <input v-model="turnoForm.motivo" type="text" class="form-input" placeholder="Ej: Corte de pelo" />
                        </div>
                        <!-- Estado (solo al editar) -->
                        <div v-if="editandoId" class="form-group">
                            <label class="form-label">Estado</label>
                            <select v-model="turnoForm.estado" class="form-select">
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmado">Confirmado</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" @click="closeModal" class="btn btn-outline">Cancelar</button>
                        <button type="submit" class="btn btn-primary" :disabled="saving">
                            <span v-if="saving" class="spinner"></span>
                            <span v-else>Guardar</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import SpeedDial from 'primevue/speeddial'
import { appointmentsService } from '../services/api'
import { useNotify } from '../composables/useNotify'

// Notificaciones
const notify = useNotify()

// Estados
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editandoId = ref(null)
const turnos = ref([])

// Filtros
const filtros = reactive({
    fecha: new Date().toISOString().split('T')[0],
    estado: '',
})

// Formulario de turno (crear/editar)
const turnoForm = reactive({
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    duracion: '30',
    nombre_cliente: '',
    telefono_cliente: '',
    motivo: '',
    estado: 'pendiente',
})

// Generar acciones dinámicas por turno
const getAcciones = (turno) => {
    const acciones = []

    // Editar (excepto cancelados)
    if (turno.estado !== 'cancelado') {
        acciones.push({
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => openModal(turno)
        })
    }

    // Confirmar (solo pendientes)
    if (turno.estado === 'pendiente') {
        acciones.push({
            label: 'Confirmar',
            icon: 'pi pi-check',
            command: () => cambiarEstado(turno.id, 'confirmado')
        })
    }

    // Marcar pendiente (solo confirmados)
    if (turno.estado === 'confirmado') {
        acciones.push({
            label: 'Pendiente',
            icon: 'pi pi-clock',
            command: () => cambiarEstado(turno.id, 'pendiente')
        })
    }

    // Cancelar (excepto cancelados)
    if (turno.estado !== 'cancelado') {
        acciones.push({
            label: 'Cancelar',
            icon: 'pi pi-times',
            command: () => cancelarTurno(turno.id)
        })
    }

    return acciones
}

// Resetear formulario
const resetForm = () => {
    turnoForm.fecha = filtros.fecha
    turnoForm.hora_inicio = '09:00'
    turnoForm.duracion = '30'
    turnoForm.nombre_cliente = ''
    turnoForm.telefono_cliente = ''
    turnoForm.motivo = ''
    turnoForm.estado = 'pendiente'
}

// Formatear fecha
const formatFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
}

// Formatear hora
const formatHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Extraer hora de datetime
const extraerHora = (fechaHora) => {
    const date = new Date(fechaHora)
    return date.toTimeString().slice(0, 5)
}

// Calcular duración en minutos
const calcularDuracion = (inicio, fin) => {
    const fechaInicio = new Date(inicio)
    const fechaFin = new Date(fin)
    const diffMs = fechaFin - fechaInicio
    return Math.round(diffMs / 60000).toString()
}

// Cargar turnos
const fetchTurnos = async () => {
    loading.value = true
    try {
        const params = { fecha: filtros.fecha }
        if (filtros.estado) params.estado = filtros.estado

        const response = await appointmentsService.getAll(params)
        turnos.value = response.data
    } catch (error) {
        console.error('Error cargando turnos:', error)
        notify.error('No se pudieron cargar los turnos')
    } finally {
        loading.value = false
    }
}

// Abrir modal (nuevo o editar)
const openModal = (turno = null) => {
    if (turno) {
        // Modo edición
        editandoId.value = turno.id
        turnoForm.fecha = turno.fecha_inicio.split('T')[0].split(' ')[0]
        turnoForm.hora_inicio = extraerHora(turno.fecha_inicio)
        turnoForm.duracion = calcularDuracion(turno.fecha_inicio, turno.fecha_fin)
        turnoForm.nombre_cliente = turno.client?.nombre || ''
        turnoForm.telefono_cliente = turno.client?.telefono || ''
        turnoForm.motivo = turno.motivo || ''
        turnoForm.estado = turno.estado
    } else {
        // Modo creación
        editandoId.value = null
        resetForm()
    }
    showModal.value = true
}

// Cerrar modal
const closeModal = () => {
    showModal.value = false
    editandoId.value = null
}

// Guardar turno (crear o actualizar)
const guardarTurno = async () => {
    saving.value = true

    try {
        // Calcular fecha_inicio y fecha_fin
        const fechaInicio = `${turnoForm.fecha} ${turnoForm.hora_inicio}:00`
        const fechaFinDate = new Date(`${turnoForm.fecha}T${turnoForm.hora_inicio}`)
        fechaFinDate.setMinutes(fechaFinDate.getMinutes() + parseInt(turnoForm.duracion))
        const fechaFin = `${turnoForm.fecha} ${fechaFinDate.toTimeString().slice(0, 5)}:00`

        const data = {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            nombre_cliente: turnoForm.nombre_cliente,
            telefono_cliente: turnoForm.telefono_cliente,
            motivo: turnoForm.motivo,
        }

        if (editandoId.value) {
            // Actualizar
            data.estado = turnoForm.estado
            await appointmentsService.update(editandoId.value, data)
            notify.success('Turno actualizado correctamente')
        } else {
            // Crear
            await appointmentsService.create(data)
            notify.success('Turno creado correctamente')
        }

        closeModal()
        fetchTurnos()
        resetForm()

    } catch (error) {
        notify.error(error.response?.data?.message || 'Error al guardar turno')
    } finally {
        saving.value = false
    }
}

// Cambiar estado
const cambiarEstado = async (id, estado) => {
    try {
        await appointmentsService.update(id, { estado })
        const mensaje = estado === 'confirmado' ? 'Turno confirmado' : 'Turno marcado como pendiente'
        notify.success(mensaje)
        fetchTurnos()
    } catch (error) {
        notify.error('Error al cambiar estado')
    }
}

// Cancelar turno
const cancelarTurno = async (id) => {
    const confirmed = await notify.confirmCancel('este turno')
    if (!confirmed) return

    try {
        await appointmentsService.cancel(id)
        notify.success('Turno cancelado')
        fetchTurnos()
    } catch (error) {
        notify.error('Error al cancelar turno')
    }
}

onMounted(() => {
    fetchTurnos()
})
</script>

<style scoped>
.speeddial-container {
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

:deep(.p-speeddial) {
    position: relative;
}

:deep(.p-speeddial-button) {
    width: 2.5rem;
    height: 2.5rem;
    background-color: var(--color-primary);
    border: none;
}

:deep(.p-speeddial-button:hover) {
    background-color: var(--color-primary-hover);
}

:deep(.p-speeddial-action) {
    width: 2rem;
    height: 2rem;
    background-color: var(--color-secondary);
    color: white;
}

:deep(.p-speeddial-action:hover) {
    background-color: var(--color-secondary-hover);
}
</style>
