<template>
    <div class="reservar-page">
        <!-- Header -->
        <header class="reservar-header">
            <div class="container">
                <h1 class="negocio-nombre">{{ negocio.nombre_negocio || 'Cargando...' }}</h1>
                <p v-if="negocio.rubro" class="negocio-rubro">{{ negocio.rubro }}</p>
            </div>
        </header>

        <!-- Contenido principal -->
        <main class="reservar-content">
            <div class="container">
                <!-- Loading inicial -->
                <div v-if="loading" class="text-center p-5">
                    <div class="spinner spinner-lg"></div>
                    <p class="text-muted mt-3">Cargando información...</p>
                </div>

                <!-- Error si no existe el negocio -->
                <div v-else-if="error" class="card text-center p-5">
                    <div class="text-danger mb-3">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <h3>Negocio no encontrado</h3>
                    <p class="text-muted">El enlace que usaste no es válido o el negocio ya no existe.</p>
                </div>

                <!-- Contenido cuando cargó -->
                <template v-else>
                    <!-- Info del negocio -->
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="negocio-info">
                                <div v-if="negocio.direccion" class="info-item">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span>{{ negocio.direccion }}</span>
                                </div>
                                <div class="info-item">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    </svg>
                                    <span>{{ horarioTexto }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Paso 1: Seleccionar fecha -->
                    <div class="card mb-4" :class="{ 'step-completed': paso > 1 }">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="step-number">1</span>
                                Selecciona una fecha
                            </h3>
                            <button v-if="paso > 1" @click="cambiarFecha" class="btn btn-sm btn-outline">
                                Cambiar
                            </button>
                        </div>
                        <div v-if="paso === 1" class="card-body">
                            <input
                                type="date"
                                v-model="fechaSeleccionada"
                                :min="fechaMinima"
                                class="form-input fecha-input"
                                @change="validarYBuscarSlots"
                            />
                            <p v-if="diasAtiende.length > 0" class="text-sm text-muted mt-2">
                                Días de atención: {{ diasAtiendeLista }}
                            </p>
                        </div>
                        <div v-else class="card-body">
                            <p class="fecha-seleccionada">{{ fechaFormateada }}</p>
                        </div>
                    </div>

                    <!-- Paso 2: Seleccionar horario -->
                    <div v-if="paso >= 2" class="card mb-4" :class="{ 'step-completed': paso > 2 }">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="step-number">2</span>
                                Selecciona un horario
                            </h3>
                            <button v-if="paso > 2" @click="cambiarHorario" class="btn btn-sm btn-outline">
                                Cambiar
                            </button>
                        </div>
                        <div v-if="paso === 2" class="card-body">
                            <div v-if="loadingSlots" class="text-center p-3">
                                <div class="spinner"></div>
                            </div>
                            <div v-else-if="slots.length === 0" class="text-center text-muted p-3">
                                <p>No hay horarios disponibles para esta fecha.</p>
                                <button @click="cambiarFecha" class="btn btn-outline mt-2">
                                    Elegir otra fecha
                                </button>
                            </div>
                            <div v-else class="slots-grid">
                                <button
                                    v-for="slot in slotsDisponibles"
                                    :key="slot.hora_inicio"
                                    @click="seleccionarSlot(slot)"
                                    class="slot-btn"
                                    :class="{ 'slot-selected': slotSeleccionado?.hora_inicio === slot.hora_inicio }"
                                >
                                    {{ slot.hora_inicio }}
                                </button>
                            </div>
                        </div>
                        <div v-else class="card-body">
                            <p class="horario-seleccionado">{{ slotSeleccionado?.hora_inicio }}</p>
                        </div>
                    </div>

                    <!-- Paso 3: Datos del cliente -->
                    <div v-if="paso >= 3" class="card mb-4">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="step-number">3</span>
                                Tus datos
                            </h3>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="confirmarTurno">
                                <div class="form-group">
                                    <label class="form-label">Nombre completo *</label>
                                    <input
                                        v-model="cliente.nombre"
                                        type="text"
                                        class="form-input"
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Teléfono *</label>
                                    <input
                                        v-model="cliente.telefono"
                                        type="tel"
                                        class="form-input"
                                        placeholder="Ej: 1122334455"
                                        required
                                    />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email (opcional)</label>
                                    <input
                                        v-model="cliente.email"
                                        type="email"
                                        class="form-input"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                <div v-if="services.length > 0" class="form-group">
                                    <label class="form-label">¿Qué servicio necesitas?</label>
                                    <select v-model="cliente.service_id" class="form-select">
                                        <option value="">-- Seleccionar servicio --</option>
                                        <option v-for="service in services" :key="service.id" :value="service.id">
                                            {{ service.nombre }}
                                            <template v-if="service.precio"> - ${{ service.precio }}</template>
                                            ({{ service.duracion }} min)
                                        </option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Notas adicionales (opcional)</label>
                                    <input
                                        v-model="cliente.motivo"
                                        type="text"
                                        class="form-input"
                                        placeholder="Algún detalle que quieras agregar"
                                    />
                                </div>
                                <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="saving">
                                    <span v-if="saving" class="spinner"></span>
                                    <span v-else>Confirmar turno</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Confirmación exitosa -->
                    <div v-if="turnoConfirmado" class="card confirmacion">
                        <div class="card-body text-center">
                            <div class="confirmacion-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                            <h2 class="confirmacion-titulo">¡Turno solicitado!</h2>
                            <p class="confirmacion-texto">
                                Tu turno para el <strong>{{ fechaFormateada }}</strong> a las <strong>{{ slotSeleccionado?.hora_inicio }}</strong>
                                ha sido registrado.
                            </p>
                            <p class="confirmacion-nota">
                                Recibirás confirmación por parte de {{ negocio.nombre_negocio }}.
                            </p>
                            <button @click="nuevoTurno" class="btn btn-outline mt-4">
                                Reservar otro turno
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </main>

        <!-- Footer -->
        <footer class="reservar-footer">
            <div class="container">
                <p>Reservas online con <strong>MiTurno</strong></p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { businessService, appointmentsService, servicesService } from '../services/api'
import { useNotify } from '../composables/useNotify'

const route = useRoute()
const slug = route.params.slug
const notify = useNotify()

// Estados
const loading = ref(true)
const loadingSlots = ref(false)
const saving = ref(false)
const error = ref(false)
const paso = ref(1)
const turnoConfirmado = ref(false)

// Datos
const negocio = ref({})
const fechaSeleccionada = ref('')
const slots = ref([])
const slotSeleccionado = ref(null)
const services = ref([])
const cliente = reactive({
    nombre: '',
    telefono: '',
    email: '',
    service_id: '',
    motivo: '',
})

// Fecha mínima (hoy)
const fechaMinima = computed(() => {
    return new Date().toISOString().split('T')[0]
})

// Fecha formateada para mostrar
const fechaFormateada = computed(() => {
    if (!fechaSeleccionada.value) return ''
    const fecha = new Date(fechaSeleccionada.value + 'T12:00:00')
    return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
})

// Texto de horarios de atención
const horarioTexto = computed(() => {
    if (!negocio.value.horarios || negocio.value.horarios.length === 0) {
        return 'Horarios no configurados'
    }
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const diasAtiende = negocio.value.horarios.map(h => dias[h.dia_semana]).join(', ')
    return `Atención: ${diasAtiende}`
})

// Filtrar solo slots disponibles
const slotsDisponibles = computed(() => {
    return slots.value.filter(s => s.disponible)
})

// Días que atiende el negocio (array de números: 0=Dom, 1=Lun, etc.)
const diasAtiende = computed(() => {
    if (!negocio.value.horarios) return []
    return negocio.value.horarios.map(h => h.dia_semana)
})

// Lista de días para mostrar al usuario
const diasAtiendeLista = computed(() => {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return diasAtiende.value.map(d => nombres[d]).join(', ')
})

// Cargar datos del negocio
const fetchNegocio = async () => {
    try {
        const response = await businessService.getBySlug(slug)
        negocio.value = response.data
    } catch (err) {
        error.value = true
    } finally {
        loading.value = false
    }
}

// Cargar servicios del negocio
const fetchServices = async () => {
    try {
        const response = await servicesService.getBySlug(slug)
        // El backend ya devuelve solo servicios activos
        services.value = response.data
    } catch (err) {
        console.error('Error cargando servicios:', err)
    }
}

// Validar día y buscar slots
const validarYBuscarSlots = async () => {
    if (!fechaSeleccionada.value) return

    // Obtener día de la semana de la fecha seleccionada
    const fecha = new Date(fechaSeleccionada.value + 'T12:00:00')
    const diaSemana = fecha.getDay() // 0=Dom, 1=Lun, etc.

    // Verificar si el negocio atiende ese día
    if (diasAtiende.value.length > 0 && !diasAtiende.value.includes(diaSemana)) {
        const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
        notify.warn(`El negocio no atiende los ${nombres[diaSemana]}. Por favor selecciona otro día.`)
        fechaSeleccionada.value = ''
        return
    }

    // Buscar slots disponibles
    loadingSlots.value = true
    paso.value = 2

    try {
        const response = await appointmentsService.getAvailableSlots(slug, fechaSeleccionada.value)
        slots.value = response.data.slots || []
    } catch (err) {
        console.error('Error obteniendo slots:', err)
        slots.value = []
    } finally {
        loadingSlots.value = false
    }
}

// Seleccionar un slot
const seleccionarSlot = (slot) => {
    slotSeleccionado.value = slot
    paso.value = 3
}

// Cambiar fecha (volver al paso 1)
const cambiarFecha = () => {
    paso.value = 1
    slots.value = []
    slotSeleccionado.value = null
}

// Cambiar horario (volver al paso 2)
const cambiarHorario = () => {
    paso.value = 2
    slotSeleccionado.value = null
}

// Confirmar turno
const confirmarTurno = async () => {
    saving.value = true

    try {
        // Construir fecha_inicio y fecha_fin combinando fecha + hora
        const fechaInicio = `${fechaSeleccionada.value} ${slotSeleccionado.value.hora_inicio}:00`
        const fechaFin = `${fechaSeleccionada.value} ${slotSeleccionado.value.hora_fin}:00`

        await appointmentsService.createPublic(slug, {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email || null,
            service_id: cliente.service_id || null,
            motivo: cliente.motivo || null,
        })
        turnoConfirmado.value = true
        paso.value = 4
    } catch (err) {
        const message = err.response?.data?.message || 'Error al reservar el turno'
        notify.error(message)
    } finally {
        saving.value = false
    }
}

// Nuevo turno (resetear todo)
const nuevoTurno = () => {
    paso.value = 1
    turnoConfirmado.value = false
    fechaSeleccionada.value = ''
    slots.value = []
    slotSeleccionado.value = null
    cliente.nombre = ''
    cliente.telefono = ''
    cliente.email = ''
    cliente.service_id = ''
    cliente.motivo = ''
}

onMounted(() => {
    fetchNegocio()
    fetchServices()
})
</script>

<style scoped>
.reservar-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg);
}

.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

/* Header */
.reservar-header {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: var(--color-white);
    padding: var(--spacing-xl) 0;
    text-align: center;
}

.negocio-nombre {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
}

.negocio-rubro {
    margin: var(--spacing-xs) 0 0;
    opacity: 0.9;
}

/* Contenido */
.reservar-content {
    flex: 1;
    padding: var(--spacing-lg) 0;
}

/* Info del negocio */
.negocio-info {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
}

.info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text-muted);
}

.info-item svg {
    color: var(--color-primary);
}

/* Steps */
.step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: var(--color-primary);
    color: var(--color-white);
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 600;
    margin-right: var(--spacing-sm);
}

.step-completed .step-number {
    background-color: var(--color-success);
}

.step-completed .card-body {
    padding: var(--spacing-sm) var(--spacing-md);
}

/* Fecha */
.fecha-input {
    font-size: 1.125rem;
    padding: var(--spacing-md);
}

.fecha-seleccionada,
.horario-seleccionado {
    font-weight: 600;
    color: var(--color-primary);
    margin: 0;
    text-transform: capitalize;
}

/* Slots */
.slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--spacing-sm);
}

.slot-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.slot-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.slot-selected {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-white);
}

/* Formulario */
.form-group {
    margin-bottom: var(--spacing-md);
}

/* Confirmación */
.confirmacion {
    border-color: var(--color-success);
}

.confirmacion-icon {
    color: var(--color-success);
    margin-bottom: var(--spacing-md);
}

.confirmacion-titulo {
    color: var(--color-success);
    margin: 0 0 var(--spacing-md);
}

.confirmacion-texto {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-sm);
}

.confirmacion-nota {
    color: var(--color-text-muted);
    font-size: 0.875rem;
}

/* Footer */
.reservar-footer {
    background-color: var(--color-bg-dark);
    color: var(--color-text-muted);
    padding: var(--spacing-md) 0;
    text-align: center;
    font-size: 0.875rem;
}

.reservar-footer strong {
    color: var(--color-primary);
}

/* Responsive */
@media (max-width: 480px) {
    .negocio-nombre {
        font-size: 1.5rem;
    }

    .slots-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
