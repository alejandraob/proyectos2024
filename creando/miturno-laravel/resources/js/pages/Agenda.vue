<template>
    <MainLayout>
        <template #header-actions>
            <div class="header-actions-group">
                <div class="export-buttons">
                    <Button
                        @click="exportarExcel"
                        icon="pi pi-file-excel"
                        severity="success"
                        size="small"
                        outlined
                        v-tooltip.bottom="'Exportar a Excel'"
                    />
                    <Button
                        @click="exportarPDF"
                        icon="pi pi-file-pdf"
                        severity="danger"
                        size="small"
                        outlined
                        v-tooltip.bottom="'Exportar a PDF'"
                    />
                </div>
                <button @click="toggleView" class="btn btn-outline btn-sm">
                    <i :class="vistaCalendario ? 'pi pi-list' : 'pi pi-calendar'"></i>
                    {{ vistaCalendario ? 'Ver lista' : 'Ver calendario' }}
                </button>
                <button @click="openModal()" class="btn btn-primary">
                    + Nuevo turno
                </button>
            </div>
        </template>

        <!-- Vista Calendario -->
        <div v-if="vistaCalendario" class="card">
            <div class="card-body calendar-container">
                <FullCalendar
                    ref="calendarRef"
                    :options="calendarOptions"
                />
            </div>
        </div>

        <!-- Vista Lista (original) -->
        <template v-else>
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
                            <th>Servicio</th>
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
                            <td>{{ turno.service?.nombre || turno.motivo || '-' }}</td>
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
        </template>

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
                            <label class="form-label">Servicio</label>
                            <select v-model="turnoForm.service_id" class="form-select" @change="onServiceChange">
                                <option value="">-- Seleccionar servicio --</option>
                                <option v-for="service in services" :key="service.id" :value="service.id">
                                    {{ service.nombre }} ({{ service.duracion }} min)
                                    <template v-if="service.precio"> - ${{ service.precio }}</template>
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Duración</label>
                            <select v-model="turnoForm.duracion" class="form-select">
                                <option value="15">15 minutos</option>
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">1 hora</option>
                                <option value="90">1h 30min</option>
                                <option value="120">2 horas</option>
                            </select>
                            <p v-if="turnoForm.service_id" class="text-xs text-muted mt-1">
                                La duración se ajusta automáticamente al seleccionar un servicio
                            </p>
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
                            <label class="form-label">Notas adicionales</label>
                            <input v-model="turnoForm.motivo" type="text" class="form-input" placeholder="Opcional" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import SpeedDial from 'primevue/speeddial'
import Button from 'primevue/button'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { appointmentsService, businessService, servicesService } from '../services/api'
import { useNotify } from '../composables/useNotify'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Notificaciones
const notify = useNotify()

// Estados
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editandoId = ref(null)
const turnos = ref([])
const todosLosTurnos = ref([])
const vistaCalendario = ref(true) // Por defecto mostrar calendario
const calendarRef = ref(null)
const businessHours = ref([])
const horarioMin = ref('07:00:00')
const horarioMax = ref('21:00:00')
const services = ref([])

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
    service_id: '',
    motivo: '',
    estado: 'pendiente',
})

// Convertir turnos a eventos de FullCalendar
const calendarEvents = computed(() => {
    return todosLosTurnos.value.map(turno => {
        // Construir título: Cliente + Servicio
        let title = turno.client?.nombre || 'Sin cliente'
        if (turno.service?.nombre) {
            title += ` - ${turno.service.nombre}`
        } else if (turno.motivo) {
            title += ` - ${turno.motivo}`
        }

        return {
            id: turno.id.toString(),
            title: title,
            start: turno.fecha_inicio,
            end: turno.fecha_fin,
            backgroundColor: getEventColor(turno.estado),
            borderColor: getEventColor(turno.estado),
            textColor: '#ffffff',
            extendedProps: {
                turno: turno
            }
        }
    })
})

// Colores según estado
const getEventColor = (estado) => {
    switch (estado) {
        case 'confirmado':
            return '#08a05c' // success
        case 'pendiente':
            return '#e1ca08' // warning
        case 'cancelado':
            return '#ef1903' // danger
        default:
            return '#4364a9' // secondary
    }
}

// Opciones del calendario
const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    locale: 'es',
    firstDay: 1, // Lunes
    slotMinTime: horarioMin.value,
    slotMaxTime: horarioMax.value,
    slotDuration: '00:30:00',
    businessHours: businessHours.value,
    allDaySlot: false,
    nowIndicator: true,
    editable: true, // Permite drag & drop
    selectable: true, // Permite seleccionar para crear
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: calendarEvents.value,
    eventClick: handleEventClick,
    select: handleDateSelect,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
    datesSet: handleDatesSet,
    buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
    },
    height: 'auto',
    contentHeight: 600,
}))

// Manejar click en evento
const handleEventClick = (info) => {
    const turno = info.event.extendedProps.turno
    openModal(turno)
}

// Manejar selección de fecha/hora para crear turno
const handleDateSelect = (info) => {
    const fecha = info.startStr.split('T')[0]
    const hora = info.startStr.includes('T')
        ? info.startStr.split('T')[1].substring(0, 5)
        : '09:00'

    // Calcular duración
    const start = new Date(info.start)
    const end = new Date(info.end)
    const duracionMs = end - start
    const duracionMin = Math.round(duracionMs / 60000)

    resetForm()
    turnoForm.fecha = fecha
    turnoForm.hora_inicio = hora
    turnoForm.duracion = duracionMin > 0 ? duracionMin.toString() : '30'

    showModal.value = true
}

// Manejar drag & drop de evento
const handleEventDrop = async (info) => {
    const turnoId = info.event.id
    const newStart = info.event.start
    const newEnd = info.event.end

    // DEBUG: Log para ver qué datos se envían
    console.log('=== EVENT DROP DEBUG ===')
    console.log('Turno ID:', turnoId)
    console.log('Event start (raw):', newStart)
    console.log('Event end (raw):', newEnd)
    console.log('Event start ISO:', newStart?.toISOString())
    console.log('Timezone offset:', newStart?.getTimezoneOffset())

    try {
        const fechaInicio = formatDateTime(newStart)
        const fechaFin = formatDateTime(newEnd)

        console.log('Fecha inicio formateada:', fechaInicio)
        console.log('Fecha fin formateada:', fechaFin)

        await appointmentsService.update(turnoId, {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        })

        notify.success('Turno movido correctamente')
        fetchAllTurnos()
    } catch (error) {
        console.error('Error en update:', error.response?.data || error)
        info.revert()
        notify.error('Error al mover el turno')
    }
}

// Manejar resize de evento
const handleEventResize = async (info) => {
    const turnoId = info.event.id
    const newStart = info.event.start
    const newEnd = info.event.end

    // DEBUG: Log para ver qué datos se envían
    console.log('=== EVENT RESIZE DEBUG ===')
    console.log('Turno ID:', turnoId)
    console.log('Event start (raw):', newStart)
    console.log('Event end (raw):', newEnd)

    try {
        const fechaInicio = formatDateTime(newStart)
        const fechaFin = formatDateTime(newEnd)

        console.log('Fecha inicio formateada:', fechaInicio)
        console.log('Fecha fin formateada:', fechaFin)

        await appointmentsService.update(turnoId, {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        })

        notify.success('Duración actualizada')
        fetchAllTurnos()
    } catch (error) {
        console.error('Error en resize:', error.response?.data || error)
        info.revert()
        notify.error('Error al cambiar duración')
    }
}

// Manejar cambio de rango de fechas visible
const handleDatesSet = (info) => {
    fetchAllTurnos(info.startStr.split('T')[0], info.endStr.split('T')[0])
}

// Formatear Date a string para API
const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:00`
}

// Alternar vista
const toggleView = () => {
    vistaCalendario.value = !vistaCalendario.value
    if (!vistaCalendario.value) {
        fetchTurnos()
    }
}

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
    turnoForm.service_id = ''
    turnoForm.motivo = ''
    turnoForm.estado = 'pendiente'
}

// Cargar servicios del negocio
const fetchServices = async () => {
    try {
        const response = await servicesService.getAll()
        // Solo mostrar servicios activos
        services.value = response.data.filter(s => s.activo)
    } catch (error) {
        console.error('Error cargando servicios:', error)
    }
}

// Cuando se selecciona un servicio, actualizar duración
const onServiceChange = () => {
    if (turnoForm.service_id) {
        const service = services.value.find(s => s.id == turnoForm.service_id)
        if (service) {
            turnoForm.duracion = service.duracion.toString()
        }
    }
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

// Cargar todos los turnos (para calendario)
const fetchAllTurnos = async (desde = null, hasta = null) => {
    try {
        const params = {}
        if (desde) params.desde = desde
        if (hasta) params.hasta = hasta

        const response = await appointmentsService.getAll(params)
        todosLosTurnos.value = response.data
    } catch (error) {
        console.error('Error cargando turnos:', error)
    }
}

// Cargar turnos (para vista lista)
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
        turnoForm.service_id = turno.service_id || ''
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
            service_id: turnoForm.service_id || null,
            motivo: turnoForm.motivo,
        }

        // DEBUG: Log para ver qué datos se envían desde el modal
        console.log('=== GUARDAR TURNO DEBUG ===')
        console.log('Editando ID:', editandoId.value)
        console.log('Form data:', turnoForm)
        console.log('Data a enviar:', data)

        if (editandoId.value) {
            // Actualizar
            data.estado = turnoForm.estado
            console.log('Llamando update con:', editandoId.value, data)
            const response = await appointmentsService.update(editandoId.value, data)
            console.log('Response update:', response)
            notify.success('Turno actualizado correctamente')
        } else {
            // Crear
            const response = await appointmentsService.create(data)
            console.log('Response create:', response)
            notify.success('Turno creado correctamente')
        }

        closeModal()
        fetchTurnos()
        fetchAllTurnos()
        resetForm()

    } catch (error) {
        console.error('=== ERROR GUARDAR TURNO ===')
        console.error('Error completo:', error)
        console.error('Response data:', error.response?.data)
        console.error('Status:', error.response?.status)
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
        fetchAllTurnos()
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
        fetchAllTurnos()
    } catch (error) {
        notify.error('Error al cancelar turno')
    }
}

// Cargar horarios del negocio
const fetchBusinessHours = async () => {
    try {
        const response = await businessService.get()
        const hours = response.data.business_hours || []

        if (hours.length > 0) {
            // Encontrar horario más temprano y más tarde entre todos los días
            let minHora = '23:59'
            let maxHora = '00:00'

            // Mapeo de día de semana: 0=Domingo, 1=Lunes, etc.
            const diasSemana = {
                0: 0, // Domingo
                1: 1, // Lunes
                2: 2, // Martes
                3: 3, // Miércoles
                4: 4, // Jueves
                5: 5, // Viernes
                6: 6, // Sábado
            }

            const fcBusinessHours = []

            hours.forEach(h => {
                // Actualizar horario mínimo y máximo
                if (h.hora_inicio < minHora) minHora = h.hora_inicio
                if (h.hora_fin > maxHora) maxHora = h.hora_fin

                // Agregar a businessHours de FullCalendar
                fcBusinessHours.push({
                    daysOfWeek: [diasSemana[h.dia_semana]],
                    startTime: h.hora_inicio,
                    endTime: h.hora_fin
                })
            })

            // Asignar valores
            horarioMin.value = minHora + ':00'
            horarioMax.value = maxHora + ':00'
            businessHours.value = fcBusinessHours
        }
    } catch (error) {
        console.error('Error cargando horarios:', error)
    }
}

// ========== EXPORTACIÓN ==========

// Preparar datos para exportar
const prepararDatosExport = () => {
    const datos = todosLosTurnos.value.map(turno => ({
        Fecha: formatFechaExport(turno.fecha_inicio),
        Hora: formatHora(turno.fecha_inicio),
        'Hora Fin': formatHora(turno.fecha_fin),
        Cliente: turno.client?.nombre || 'Sin cliente',
        Teléfono: turno.client?.telefono || '-',
        Servicio: turno.service?.nombre || turno.motivo || '-',
        Precio: turno.service?.precio ? `$${parseFloat(turno.service.precio).toLocaleString('es-AR')}` : '-',
        Estado: turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1),
    }))
    return datos
}

// Formatear fecha para exportación
const formatFechaExport = (fechaStr) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

// Exportar a Excel
const exportarExcel = () => {
    if (todosLosTurnos.value.length === 0) {
        notify.warn('No hay turnos para exportar')
        return
    }

    try {
        const datos = prepararDatosExport()
        const ws = XLSX.utils.json_to_sheet(datos)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Turnos')

        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 12 }, // Fecha
            { wch: 8 },  // Hora
            { wch: 8 },  // Hora Fin
            { wch: 25 }, // Cliente
            { wch: 15 }, // Teléfono
            { wch: 20 }, // Servicio
            { wch: 12 }, // Precio
            { wch: 12 }, // Estado
        ]
        ws['!cols'] = colWidths

        // Generar nombre de archivo con fecha
        const hoy = new Date().toISOString().split('T')[0]
        XLSX.writeFile(wb, `agenda_turnos_${hoy}.xlsx`)

        notify.success('Excel exportado correctamente')
    } catch (error) {
        console.error('Error exportando Excel:', error)
        notify.error('Error al exportar Excel')
    }
}

// Exportar a PDF
const exportarPDF = () => {
    if (todosLosTurnos.value.length === 0) {
        notify.warn('No hay turnos para exportar')
        return
    }

    try {
        const doc = new jsPDF()

        // Título
        doc.setFontSize(18)
        doc.text('Agenda de Turnos', 14, 22)

        // Fecha de generación
        doc.setFontSize(10)
        doc.setTextColor(100)
        const hoy = new Date().toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        doc.text(`Generado: ${hoy}`, 14, 30)

        // Preparar datos para la tabla
        const datos = prepararDatosExport()
        const headers = ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Precio', 'Estado']
        const rows = datos.map(d => [
            d.Fecha,
            d.Hora,
            d.Cliente,
            d.Teléfono,
            d.Servicio,
            d.Precio,
            d.Estado,
        ])

        // Crear tabla
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 38,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [32, 59, 128],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            columnStyles: {
                0: { cellWidth: 20 }, // Fecha
                1: { cellWidth: 15 }, // Hora
                2: { cellWidth: 35 }, // Cliente
                3: { cellWidth: 25 }, // Teléfono
                4: { cellWidth: 30 }, // Servicio
                5: { cellWidth: 20 }, // Precio
                6: { cellWidth: 20 }, // Estado
            },
        })

        // Guardar archivo
        const fechaArchivo = new Date().toISOString().split('T')[0]
        doc.save(`agenda_turnos_${fechaArchivo}.pdf`)

        notify.success('PDF exportado correctamente')
    } catch (error) {
        console.error('Error exportando PDF:', error)
        notify.error('Error al exportar PDF')
    }
}

onMounted(async () => {
    await fetchBusinessHours()
    fetchServices()
    fetchTurnos()
    fetchAllTurnos()
})
</script>

<style scoped>
.header-actions-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.export-buttons {
    display: flex;
    gap: 0.25rem;
    margin-right: 0.5rem;
    padding-right: 0.75rem;
    border-right: 1px solid var(--color-border);
}

.btn-sm {
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
}

.btn-sm i {
    margin-right: 0.25rem;
}

.calendar-container {
    padding: 1rem;
}

/* Estilos de FullCalendar */
:deep(.fc) {
    font-family: inherit;
}

:deep(.fc-toolbar-title) {
    font-size: 1.25rem !important;
    font-weight: 600;
    color: var(--color-text);
}

:deep(.fc-button) {
    background-color: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
    font-weight: 500;
    padding: 0.4rem 0.75rem;
}

:deep(.fc-button:hover) {
    background-color: var(--color-primary-hover) !important;
    border-color: var(--color-primary-hover) !important;
}

:deep(.fc-button-active) {
    background-color: var(--color-secondary) !important;
    border-color: var(--color-secondary) !important;
}

:deep(.fc-today-button) {
    background-color: var(--color-secondary) !important;
    border-color: var(--color-secondary) !important;
}

:deep(.fc-day-today) {
    background-color: rgba(32, 59, 128, 0.08) !important;
}

:deep(.fc-timegrid-slot) {
    height: 2.5rem;
}

:deep(.fc-event) {
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.8rem;
    padding: 2px 4px;
}

:deep(.fc-event:hover) {
    opacity: 0.9;
}

:deep(.fc-daygrid-event) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.fc-timegrid-event) {
    border-radius: 4px;
}

:deep(.fc-col-header-cell) {
    background-color: var(--color-bg-light);
    padding: 0.5rem;
}

:deep(.fc-col-header-cell-cushion) {
    color: var(--color-text);
    font-weight: 600;
    text-transform: capitalize;
}

:deep(.fc-scrollgrid) {
    border-color: var(--color-border) !important;
}

:deep(.fc-scrollgrid td),
:deep(.fc-scrollgrid th) {
    border-color: var(--color-border) !important;
}

:deep(.fc-timegrid-now-indicator-line) {
    border-color: var(--color-danger);
}

:deep(.fc-timegrid-now-indicator-arrow) {
    border-color: var(--color-danger);
    border-top-color: transparent;
    border-bottom-color: transparent;
}

/* Dark mode */
:root[data-theme="dark"] :deep(.fc-toolbar-title),
:root[data-theme="dark"] :deep(.fc-col-header-cell-cushion),
:root[data-theme="dark"] :deep(.fc-daygrid-day-number),
:root[data-theme="dark"] :deep(.fc-timegrid-axis-cushion) {
    color: #e5e7eb;
}

:root[data-theme="dark"] :deep(.fc-day-today) {
    background-color: rgba(67, 100, 169, 0.15) !important;
}

:root[data-theme="dark"] :deep(.fc-col-header-cell) {
    background-color: #2d2d2d;
}

:root[data-theme="dark"] :deep(.fc-scrollgrid),
:root[data-theme="dark"] :deep(.fc-scrollgrid td),
:root[data-theme="dark"] :deep(.fc-scrollgrid th) {
    border-color: #404040 !important;
}

/* SpeedDial */
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

/* Responsive */
@media (max-width: 768px) {
    .header-actions-group {
        flex-direction: column;
        gap: 0.5rem;
    }

    :deep(.fc-toolbar) {
        flex-direction: column;
        gap: 0.5rem;
    }

    :deep(.fc-toolbar-chunk) {
        display: flex;
        justify-content: center;
    }

    :deep(.fc-button) {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }
}
</style>
