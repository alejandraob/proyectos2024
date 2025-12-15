<template>
    <MainLayout>
        <div class="grid grid-cols-2 gap-4">
            <!-- Datos del negocio -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Datos del negocio</h3>
                </div>
                <form @submit.prevent="guardarNegocio">
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Nombre del negocio</label>
                            <input
                                v-model="negocioForm.nombre_negocio"
                                type="text"
                                class="form-input"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Rubro</label>
                            <input
                                v-model="negocioForm.rubro"
                                type="text"
                                class="form-input"
                                placeholder="Ej: Peluquería, Barbería, Spa..."
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dirección</label>
                            <input
                                v-model="negocioForm.direccion"
                                type="text"
                                class="form-input"
                                placeholder="Ej: Av. Corrientes 1234, CABA"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL pública</label>
                            <div class="flex items-center gap-2">
                                <span class="text-muted text-sm">{{ baseUrl }}/reservar/</span>
                                <code class="text-primary">{{ business?.slug }}</code>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary" :disabled="savingNegocio">
                            <span v-if="savingNegocio" class="spinner"></span>
                            <span v-else>Guardar cambios</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Configuración -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Configuración de turnos</h3>
                </div>
                <form @submit.prevent="guardarSettings">
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Duración de turnos</label>
                            <select v-model="settingsForm.intervalo_turnos" class="form-select">
                                <option :value="15">15 minutos</option>
                                <option :value="30">30 minutos</option>
                                <option :value="45">45 minutos</option>
                                <option :value="60">1 hora</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-check">
                                <input
                                    v-model="settingsForm.notificaciones_email"
                                    type="checkbox"
                                    class="form-check-input"
                                />
                                <span>Recibir notificaciones por email</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-check">
                                <input
                                    v-model="settingsForm.notificaciones_whatsapp"
                                    type="checkbox"
                                    class="form-check-input"
                                />
                                <span>Recibir notificaciones por WhatsApp</span>
                            </label>
                            <p class="text-xs text-muted mt-1">(Próximamente)</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary" :disabled="savingSettings">
                            <span v-if="savingSettings" class="spinner"></span>
                            <span v-else>Guardar configuración</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Horarios -->
            <div class="card" style="grid-column: span 2;">
                <div class="card-header">
                    <h3 class="card-title">Horarios de atención</h3>
                </div>
                <form @submit.prevent="guardarHorarios">
                    <div class="card-body">
                        <div class="horarios-grid">
                            <div v-for="dia in dias" :key="dia.valor" class="horario-row">
                                <label class="form-check horario-dia">
                                    <input
                                        v-model="dia.activo"
                                        type="checkbox"
                                        class="form-check-input"
                                    />
                                    <span>{{ dia.nombre }}</span>
                                </label>
                                <div class="horario-horas">
                                    <input
                                        v-model="dia.hora_inicio"
                                        type="time"
                                        class="form-input"
                                        :disabled="!dia.activo"
                                    />
                                    <span class="text-muted">a</span>
                                    <input
                                        v-model="dia.hora_fin"
                                        type="time"
                                        class="form-input"
                                        :disabled="!dia.activo"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary" :disabled="savingHorarios">
                            <span v-if="savingHorarios" class="spinner"></span>
                            <span v-else>Guardar horarios</span>
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
import { businessService } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useNotify } from '../composables/useNotify'

const authStore = useAuthStore()
const notify = useNotify()

// Estados
const savingNegocio = ref(false)
const savingSettings = ref(false)
const savingHorarios = ref(false)
const business = ref(null)

// URL base
const baseUrl = window.location.origin

// Formulario negocio
const negocioForm = reactive({
    nombre_negocio: '',
    rubro: '',
    direccion: '',
})

// Formulario settings
const settingsForm = reactive({
    intervalo_turnos: 30,
    notificaciones_email: true,
    notificaciones_whatsapp: false,
})

// Días de la semana
const dias = reactive([
    { valor: 0, nombre: 'Domingo', activo: false, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 1, nombre: 'Lunes', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 2, nombre: 'Martes', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 3, nombre: 'Miércoles', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 4, nombre: 'Jueves', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 5, nombre: 'Viernes', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 6, nombre: 'Sábado', activo: false, hora_inicio: '09:00', hora_fin: '13:00' },
])

// Cargar datos
const fetchBusiness = async () => {
    try {
        const response = await businessService.get()
        business.value = response.data

        // Llenar formulario negocio
        negocioForm.nombre_negocio = response.data.nombre_negocio || ''
        negocioForm.rubro = response.data.rubro || ''
        negocioForm.direccion = response.data.direccion || ''

        // Llenar formulario settings
        if (response.data.setting) {
            settingsForm.intervalo_turnos = response.data.setting.intervalo_turnos
            settingsForm.notificaciones_email = response.data.setting.notificaciones_email
            settingsForm.notificaciones_whatsapp = response.data.setting.notificaciones_whatsapp
        }

        // Llenar horarios
        if (response.data.business_hours) {
            // Resetear todos a inactivo
            dias.forEach(d => d.activo = false)

            // Activar los que tienen horario
            response.data.business_hours.forEach(h => {
                const dia = dias.find(d => d.valor === h.dia_semana)
                if (dia) {
                    dia.activo = true
                    dia.hora_inicio = h.hora_inicio.slice(0, 5)
                    dia.hora_fin = h.hora_fin.slice(0, 5)
                }
            })
        }
    } catch (error) {
        console.error('Error cargando negocio:', error)
        notify.error('No se pudo cargar la configuración')
    }
}

// Guardar negocio
const guardarNegocio = async () => {
    savingNegocio.value = true
    try {
        const response = await businessService.update(negocioForm)
        authStore.updateBusiness(response.data.business)
        notify.success('Datos del negocio guardados')
    } catch (error) {
        notify.error('Error al guardar datos del negocio')
    } finally {
        savingNegocio.value = false
    }
}

// Guardar settings
const guardarSettings = async () => {
    savingSettings.value = true
    try {
        await businessService.updateSettings(settingsForm)
        notify.success('Configuración guardada')
    } catch (error) {
        notify.error('Error al guardar configuración')
    } finally {
        savingSettings.value = false
    }
}

// Guardar horarios
const guardarHorarios = async () => {
    savingHorarios.value = true
    try {
        const horarios = dias
            .filter(d => d.activo)
            .map(d => ({
                dia_semana: d.valor,
                hora_inicio: d.hora_inicio,
                hora_fin: d.hora_fin,
            }))

        await businessService.updateHours(horarios)
        notify.success('Horarios guardados')
    } catch (error) {
        notify.error('Error al guardar horarios')
    } finally {
        savingHorarios.value = false
    }
}

onMounted(() => {
    fetchBusiness()
})
</script>
