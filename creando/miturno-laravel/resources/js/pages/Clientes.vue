<template>
    <MainLayout>
        <template #header-actions>
            <button @click="openModal()" class="btn btn-primary">
                + Nuevo cliente
            </button>
        </template>

        <!-- Buscador -->
        <div class="card mb-4">
            <div class="card-body">
                <input
                    v-model="busqueda"
                    type="text"
                    class="form-input"
                    placeholder="Buscar por nombre o teléfono..."
                    @input="filtrarClientes"
                />
            </div>
        </div>

        <!-- Lista de clientes -->
        <div class="card">
            <div v-if="loading" class="card-body text-center p-5">
                <div class="spinner spinner-lg"></div>
            </div>

            <div v-else-if="clientesFiltrados.length === 0" class="card-body text-center p-5 text-muted">
                <p>No hay clientes</p>
            </div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Turnos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
                        <td class="font-semibold">{{ cliente.nombre }}</td>
                        <td>{{ cliente.telefono || '-' }}</td>
                        <td>{{ cliente.email || '-' }}</td>
                        <td>
                            <span class="badge badge-primary">{{ cliente.appointments_count }}</span>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <Button
                                    @click="verHistorial(cliente)"
                                    icon="pi pi-history"
                                    severity="secondary"
                                    size="small"
                                    rounded
                                    outlined
                                    v-tooltip.top="'Ver historial'"
                                />
                                <Button
                                    @click="openModal(cliente)"
                                    icon="pi pi-pencil"
                                    severity="info"
                                    size="small"
                                    rounded
                                    outlined
                                    v-tooltip.top="'Editar'"
                                />
                                <Button
                                    @click="eliminarCliente(cliente)"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    size="small"
                                    rounded
                                    outlined
                                    v-tooltip.top="'Eliminar'"
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal cliente -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">{{ editando ? 'Editar' : 'Nuevo' }} cliente</h3>
                    <button @click="closeModal" class="modal-close">&times;</button>
                </div>
                <form @submit.prevent="guardarCliente">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Nombre *</label>
                            <input
                                v-model="clienteForm.nombre"
                                type="text"
                                class="form-input"
                                placeholder="Nombre completo"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teléfono</label>
                            <input
                                v-model="clienteForm.telefono"
                                type="text"
                                class="form-input"
                                placeholder="Ej: 1122334455"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input
                                v-model="clienteForm.email"
                                type="email"
                                class="form-input"
                                placeholder="cliente@email.com"
                            />
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

        <!-- Modal historial de turnos -->
        <div v-if="showHistorialModal" class="modal-overlay" @click.self="showHistorialModal = false">
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3 class="modal-title">Historial de turnos - {{ clienteHistorial?.nombre }}</h3>
                    <button @click="showHistorialModal = false" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div v-if="loadingHistorial" class="text-center p-4">
                        <div class="spinner"></div>
                    </div>

                    <div v-else-if="!clienteHistorial?.appointments?.length" class="text-center p-4 text-muted">
                        <i class="pi pi-calendar-times" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        Este cliente no tiene turnos registrados
                    </div>

                    <div v-else>
                        <div class="historial-stats mb-4">
                            <div class="stat-item">
                                <span class="stat-value">{{ clienteHistorial.appointments.length }}</span>
                                <span class="stat-label">Total turnos</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{ turnosConfirmados }}</span>
                                <span class="stat-label">Confirmados</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{ turnosCancelados }}</span>
                                <span class="stat-label">Cancelados</span>
                            </div>
                        </div>

                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Servicio</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="turno in clienteHistorial.appointments" :key="turno.id">
                                    <td>{{ formatFecha(turno.fecha_inicio) }}</td>
                                    <td>{{ formatHora(turno.fecha_inicio) }}</td>
                                    <td>{{ turno.service?.nombre || turno.motivo || '-' }}</td>
                                    <td>
                                        <span :class="'badge badge-' + turno.estado">
                                            {{ turno.estado }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" @click="showHistorialModal = false" class="btn btn-outline">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Button from 'primevue/button'
import { clientsService } from '../services/api'
import { useNotify } from '../composables/useNotify'

// Notificaciones
const notify = useNotify()

// Estados
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editando = ref(null)
const clientes = ref([])
const busqueda = ref('')

// Estados para historial
const showHistorialModal = ref(false)
const loadingHistorial = ref(false)
const clienteHistorial = ref(null)

// Formulario
const clienteForm = reactive({
    nombre: '',
    telefono: '',
    email: '',
})

// Clientes filtrados
const clientesFiltrados = computed(() => {
    if (!busqueda.value) return clientes.value

    const term = busqueda.value.toLowerCase()
    return clientes.value.filter(c =>
        c.nombre.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.includes(term))
    )
})

// Estadísticas del historial
const turnosConfirmados = computed(() => {
    if (!clienteHistorial.value?.appointments) return 0
    return clienteHistorial.value.appointments.filter(t => t.estado === 'confirmado').length
})

const turnosCancelados = computed(() => {
    if (!clienteHistorial.value?.appointments) return 0
    return clienteHistorial.value.appointments.filter(t => t.estado === 'cancelado').length
})

// Cargar clientes
const fetchClientes = async () => {
    loading.value = true
    try {
        const response = await clientsService.getAll()
        clientes.value = response.data
    } catch (error) {
        console.error('Error cargando clientes:', error)
        notify.error('No se pudieron cargar los clientes')
    } finally {
        loading.value = false
    }
}

// Ver historial de turnos
const verHistorial = async (cliente) => {
    showHistorialModal.value = true
    loadingHistorial.value = true
    clienteHistorial.value = null

    try {
        const response = await clientsService.getOne(cliente.id)
        clienteHistorial.value = response.data
    } catch (error) {
        console.error('Error cargando historial:', error)
        notify.error('No se pudo cargar el historial')
        showHistorialModal.value = false
    } finally {
        loadingHistorial.value = false
    }
}

// Formatear fecha
const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

// Formatear hora
const formatHora = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Abrir modal
const openModal = (cliente = null) => {
    if (cliente) {
        editando.value = cliente.id
        clienteForm.nombre = cliente.nombre
        clienteForm.telefono = cliente.telefono || ''
        clienteForm.email = cliente.email || ''
    } else {
        editando.value = null
        clienteForm.nombre = ''
        clienteForm.telefono = ''
        clienteForm.email = ''
    }
    showModal.value = true
}

// Cerrar modal
const closeModal = () => {
    showModal.value = false
    editando.value = null
}

// Guardar cliente
const guardarCliente = async () => {
    saving.value = true

    try {
        if (editando.value) {
            await clientsService.update(editando.value, clienteForm)
            notify.success('Cliente actualizado correctamente')
        } else {
            await clientsService.create(clienteForm)
            notify.success('Cliente creado correctamente')
        }

        closeModal()
        fetchClientes()
    } catch (error) {
        notify.error(error.response?.data?.message || 'Error al guardar cliente')
    } finally {
        saving.value = false
    }
}

// Eliminar cliente
const eliminarCliente = async (cliente) => {
    const confirmed = await notify.confirmDelete(`a ${cliente.nombre}`)
    if (!confirmed) return

    try {
        await clientsService.delete(cliente.id)
        notify.success('Cliente eliminado')
        fetchClientes()
    } catch (error) {
        notify.error('Error al eliminar cliente')
    }
}

onMounted(() => {
    fetchClientes()
})
</script>

<style scoped>
.modal-lg {
    max-width: 700px;
    width: 95%;
}

.historial-stats {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: var(--color-bg-dark);
    border-radius: var(--radius-md);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
}

.table-sm {
    font-size: 0.875rem;
}

.table-sm th,
.table-sm td {
    padding: 0.5rem 0.75rem;
}
</style>
