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
                                <button @click="openModal(cliente)" class="btn btn-sm btn-outline">
                                    Editar
                                </button>
                                <button @click="eliminarCliente(cliente)" class="btn btn-sm btn-danger">
                                    Eliminar
                                </button>
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
    </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
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
