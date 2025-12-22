<template>
    <MainLayout>
        <div class="grid grid-cols-2 gap-4">
            <!-- Datos del negocio -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ $t('settings.businessData') }}</h3>
                </div>
                <form @submit.prevent="guardarNegocio">
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">{{ $t('settings.businessName') }}</label>
                            <input
                                v-model="negocioForm.nombre_negocio"
                                type="text"
                                class="form-input"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ $t('settings.category') }}</label>
                            <input
                                v-model="negocioForm.rubro"
                                type="text"
                                class="form-input"
                                :placeholder="$t('settings.categoryPlaceholder')"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ $t('settings.address') }}</label>
                            <input
                                v-model="negocioForm.direccion"
                                type="text"
                                class="form-input"
                                :placeholder="$t('settings.addressPlaceholder')"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">{{ $t('settings.publicLink') }}</label>
                            <p class="text-xs text-muted mb-2">{{ $t('settings.publicLinkDescription') }}</p>
                            <div class="url-publica">
                                <input
                                    type="text"
                                    :value="urlReservas"
                                    class="form-input"
                                    readonly
                                    @click="$event.target.select()"
                                />
                                <button type="button" @click="copiarUrl" class="btn btn-outline">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                    </svg>
                                </button>
                                <a :href="urlReservas" target="_blank" class="btn btn-primary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                    </svg>
                                    {{ $t('settings.view') }}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary" :disabled="savingNegocio">
                            <span v-if="savingNegocio" class="spinner"></span>
                            <span v-else>{{ $t('settings.saveChanges') }}</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Configuración -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ $t('settings.appointmentSettings') }}</h3>
                </div>
                <form @submit.prevent="guardarSettings">
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">{{ $t('settings.appointmentDuration') }}</label>
                            <select v-model="settingsForm.intervalo_turnos" class="form-select">
                                <option :value="15">15 {{ $t('settings.minutes') }}</option>
                                <option :value="30">30 {{ $t('settings.minutes') }}</option>
                                <option :value="45">45 {{ $t('settings.minutes') }}</option>
                                <option :value="60">1 {{ $t('settings.hour') }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <div class="feature-row">
                                <label class="form-check" :class="{ 'feature-disabled': !hasEmailReminders }">
                                    <input
                                        v-model="settingsForm.notificaciones_email"
                                        type="checkbox"
                                        class="form-check-input"
                                        :disabled="!hasEmailReminders"
                                    />
                                    <span>{{ $t('settings.emailNotifications') }}</span>
                                </label>
                                <span v-if="!hasEmailReminders" class="badge-plan badge-pro" @click="goToPlans">
                                    PRO
                                </span>
                            </div>
                            <p v-if="!hasEmailReminders" class="text-xs text-muted mt-1">
                                Mejora a PRO para enviar recordatorios por email
                            </p>
                        </div>
                        <div class="form-group">
                            <div class="feature-row">
                                <label class="form-check" :class="{ 'feature-disabled': !hasWhatsApp }">
                                    <input
                                        v-model="settingsForm.notificaciones_whatsapp"
                                        type="checkbox"
                                        class="form-check-input"
                                        :disabled="!hasWhatsApp"
                                    />
                                    <span>{{ $t('settings.whatsappNotifications') }}</span>
                                </label>
                                <span v-if="!hasWhatsApp" class="badge-plan badge-premium" @click="goToPlans">
                                    PREMIUM
                                </span>
                            </div>
                            <p v-if="hasWhatsApp" class="text-xs text-muted mt-1">{{ $t('settings.notificationsDescription') }}</p>
                            <p v-else class="text-xs text-muted mt-1">
                                Mejora a PREMIUM para enviar recordatorios por WhatsApp
                            </p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary" :disabled="savingSettings">
                            <span v-if="savingSettings" class="spinner"></span>
                            <span v-else>{{ $t('settings.saveSettings') }}</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Servicios -->
            <div class="card" style="grid-column: span 2;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="card-title">{{ $t('settings.services') }}</h3>
                    <button type="button" class="btn btn-primary btn-sm" @click="nuevoServicio">
                        <i class="pi pi-plus" style="margin-right: 0.5rem;"></i>
                        {{ $t('settings.newService') }}
                    </button>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-4">{{ $t('settings.servicesDescription') }}</p>

                    <div v-if="loadingServices" class="text-center py-4">
                        <span class="spinner"></span>
                    </div>

                    <div v-else-if="services.length === 0" class="text-center py-4 text-muted">
                        <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        {{ $t('settings.noServices') }}
                    </div>

                    <table v-else class="table">
                        <thead>
                            <tr>
                                <th>{{ $t('clients.name') }}</th>
                                <th>{{ $t('agenda.duration') }}</th>
                                <th>{{ $t('settings.servicePrice') }}</th>
                                <th>{{ $t('agenda.status') }}</th>
                                <th style="width: 100px;">{{ $t('app.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="service in services" :key="service.id">
                                <td>{{ service.nombre }}</td>
                                <td>{{ service.duracion }} min</td>
                                <td>{{ formatPrecio(service.precio) }}</td>
                                <td>
                                    <span :class="['badge', service.activo ? 'badge-success' : 'badge-secondary']">
                                        {{ service.activo ? $t('settings.active') : $t('settings.inactive') }}
                                    </span>
                                </td>
                                <td>
                                    <div class="flex gap-2">
                                        <Button
                                            @click="editarServicio(service)"
                                            icon="pi pi-pencil"
                                            severity="info"
                                            size="small"
                                            rounded
                                            outlined
                                            v-tooltip.top="$t('app.edit')"
                                        />
                                        <Button
                                            @click="eliminarServicio(service)"
                                            icon="pi pi-trash"
                                            severity="danger"
                                            size="small"
                                            rounded
                                            outlined
                                            v-tooltip.top="$t('app.delete')"
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Servicio -->
            <div v-if="showServiceModal" class="modal-overlay" @click.self="showServiceModal = false">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">{{ editingService ? $t('settings.editService') : $t('settings.newService') }}</h3>
                        <button type="button" class="modal-close" @click="showServiceModal = false">&times;</button>
                    </div>
                    <form @submit.prevent="guardarServicio">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">{{ $t('settings.serviceName') }} *</label>
                                <input
                                    v-model="serviceForm.nombre"
                                    type="text"
                                    class="form-input"
                                    :placeholder="$t('settings.serviceNamePlaceholder')"
                                    required
                                />
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">{{ $t('settings.serviceDuration') }}</label>
                                    <select v-model="serviceForm.duracion" class="form-select">
                                        <option :value="15">15 min</option>
                                        <option :value="30">30 min</option>
                                        <option :value="45">45 min</option>
                                        <option :value="60">1 {{ $t('settings.hour') }}</option>
                                        <option :value="90">1h 30min</option>
                                        <option :value="120">2 {{ $t('settings.hours') }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">{{ $t('settings.servicePrice') }} ({{ $t('settings.optional') }})</label>
                                    <input
                                        v-model="serviceForm.precio"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        class="form-input"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-check">
                                    <input
                                        v-model="serviceForm.activo"
                                        type="checkbox"
                                        class="form-check-input"
                                    />
                                    <span>{{ $t('settings.serviceActive') }}</span>
                                </label>
                                <p class="text-xs text-muted mt-1">{{ $t('settings.serviceActiveDescription') }}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" @click="showServiceModal = false">
                                {{ $t('app.cancel') }}
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="savingService">
                                <span v-if="savingService" class="spinner"></span>
                                <span v-else>{{ editingService ? $t('settings.saveChanges') : $t('settings.createService') }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Tema de colores -->
            <div class="card" style="grid-column: span 2;">
                <div class="card-header">
                    <h3 class="card-title">{{ $t('settings.colorTheme') }}</h3>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-4">{{ $t('settings.colorThemeDescription') }}</p>
                    <div class="temas-grid">
                        <div
                            v-for="tema in temas"
                            :key="tema.id"
                            class="tema-card"
                            :class="{ 'tema-activo': temaActual === tema.id }"
                            @click="cambiarTema(tema.id)"
                        >
                            <div class="tema-preview">
                                <div class="tema-sidebar" :style="{ backgroundColor: tema.colors.dark }">
                                    <div class="tema-sidebar-item" :style="{ backgroundColor: tema.colors.primary }"></div>
                                    <div class="tema-sidebar-item" :style="{ backgroundColor: tema.colors.secondary }"></div>
                                </div>
                                <div class="tema-content" :style="{ backgroundColor: tema.colors.light }">
                                    <div class="tema-header" :style="{ backgroundColor: tema.colors.light, borderColor: tema.colors.accent3 }"></div>
                                    <div class="tema-cards">
                                        <div class="tema-minicard" :style="{ borderColor: tema.colors.accent3 }">
                                            <div class="tema-btn" :style="{ backgroundColor: tema.colors.primary }"></div>
                                        </div>
                                        <div class="tema-minicard" :style="{ borderColor: tema.colors.accent3 }">
                                            <div class="tema-btn" :style="{ backgroundColor: tema.colors.success }"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="tema-info">
                                <span class="tema-nombre">{{ tema.nombre }}</span>
                                <div class="tema-colores">
                                    <span class="tema-color" :style="{ backgroundColor: tema.colors.primary }"></span>
                                    <span class="tema-color" :style="{ backgroundColor: tema.colors.secondary }"></span>
                                    <span class="tema-color" :style="{ backgroundColor: tema.colors.info }"></span>
                                    <span class="tema-color" :style="{ backgroundColor: tema.colors.success }"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Horarios -->
            <div class="card" style="grid-column: span 2;">
                <div class="card-header">
                    <h3 class="card-title">{{ $t('settings.schedule') }}</h3>
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
                                    <span>{{ $t('days.' + dia.key) }}</span>
                                </label>
                                <div class="horario-horas">
                                    <input
                                        v-model="dia.hora_inicio"
                                        type="time"
                                        class="form-input"
                                        :disabled="!dia.activo"
                                    />
                                    <span class="text-muted">{{ $t('settings.to') }}</span>
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
                            <span v-else>{{ $t('settings.saveSchedule') }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import Button from 'primevue/button'
import { businessService, servicesService } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useNotify } from '../composables/useNotify'
import { usePlanFeatures } from '../composables/usePlanFeatures'

const router = useRouter()
const authStore = useAuthStore()
const notify = useNotify()

// Plan features
const {
    loadFeatures,
    hasEmailReminders,
    hasWhatsApp,
    isFree,
    planDisplayName,
} = usePlanFeatures()

// Estados
const savingNegocio = ref(false)
const savingSettings = ref(false)
const savingHorarios = ref(false)
const business = ref(null)

// Estados de servicios
const services = ref([])
const loadingServices = ref(false)
const savingService = ref(false)
const showServiceModal = ref(false)
const editingService = ref(null)
const serviceForm = reactive({
    nombre: '',
    precio: '',
    duracion: 30,
    activo: true,
})

// Temas disponibles
const temas = [
    {
        id: 'default',
        nombre: 'Default',
        colors: {
            light: '#ced8e5',
            dark: '#121012',
            primary: '#203b80',
            secondary: '#4364a9',
            info: '#168ce4',
            accent3: '#96abbe',
            success: '#08a05c'
        }
    },
    {
        id: 'esmeralda',
        nombre: 'Esmeralda',
        colors: {
            light: '#e8f5e9',
            dark: '#1b5e20',
            primary: '#2e7d32',
            secondary: '#43a047',
            info: '#00acc1',
            accent3: '#a5d6a7',
            success: '#00c853'
        }
    },
    {
        id: 'oceano',
        nombre: 'Oceano',
        colors: {
            light: '#e3f2fd',
            dark: '#0d47a1',
            primary: '#1565c0',
            secondary: '#1976d2',
            info: '#03a9f4',
            accent3: '#81d4fa',
            success: '#00e676'
        }
    },
    {
        id: 'atardecer',
        nombre: 'Atardecer',
        colors: {
            light: '#fce3d8',
            dark: '#42015d',
            primary: '#58311f',
            secondary: '#e73972',
            info: '#de256b',
            accent3: '#4e445a',
            success: '#559d18'
        }
    },
    {
        id: 'neon',
        nombre: 'Neon',
        colors: {
            light: '#1b1a1a',
            dark: '#9c38ee',
            primary: '#64a7db',
            secondary: '#2c57c1',
            info: '#283cbd',
            accent3: '#53505a',
            success: '#159954'
        }
    }
]

// Tema actual
const temaActual = ref('default')

// Cambiar tema
const cambiarTema = async (temaId) => {
    temaActual.value = temaId
    document.documentElement.setAttribute('data-theme', temaId)
    localStorage.setItem('colorTheme', temaId)

    // Guardar en backend
    try {
        await businessService.updateSettings({ color_theme: temaId })
        notify.success(`Tema "${temas.find(t => t.id === temaId).nombre}" aplicado`)
    } catch (error) {
        notify.error('Error al guardar el tema')
    }
}

// URL de reservas
const urlReservas = computed(() => {
    if (!business.value?.slug) return ''
    return `${window.location.origin}/reservar/${business.value.slug}`
})

// Copiar URL al portapapeles
const copiarUrl = async () => {
    try {
        await navigator.clipboard.writeText(urlReservas.value)
        notify.success('Link copiado al portapapeles')
    } catch (error) {
        notify.error('No se pudo copiar el link')
    }
}

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
    { valor: 0, key: 'sunday', activo: false, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 1, key: 'monday', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 2, key: 'tuesday', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 3, key: 'wednesday', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 4, key: 'thursday', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 5, key: 'friday', activo: true, hora_inicio: '09:00', hora_fin: '18:00' },
    { valor: 6, key: 'saturday', activo: false, hora_inicio: '09:00', hora_fin: '13:00' },
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

            // Cargar tema del usuario
            if (response.data.setting.color_theme) {
                temaActual.value = response.data.setting.color_theme
                document.documentElement.setAttribute('data-theme', response.data.setting.color_theme)
                localStorage.setItem('colorTheme', response.data.setting.color_theme)
            }
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

// ========== SERVICIOS ==========

// Cargar servicios
const fetchServices = async () => {
    loadingServices.value = true
    try {
        const response = await servicesService.getAll()
        services.value = response.data
    } catch (error) {
        console.error('Error cargando servicios:', error)
    } finally {
        loadingServices.value = false
    }
}

// Abrir modal para nuevo servicio
const nuevoServicio = () => {
    editingService.value = null
    serviceForm.nombre = ''
    serviceForm.precio = ''
    serviceForm.duracion = 30
    serviceForm.activo = true
    showServiceModal.value = true
}

// Abrir modal para editar servicio
const editarServicio = (service) => {
    editingService.value = service
    serviceForm.nombre = service.nombre
    serviceForm.precio = service.precio || ''
    serviceForm.duracion = service.duracion
    serviceForm.activo = service.activo
    showServiceModal.value = true
}

// Guardar servicio (crear o actualizar)
const guardarServicio = async () => {
    if (!serviceForm.nombre.trim()) {
        notify.warn('El nombre del servicio es requerido')
        return
    }

    savingService.value = true
    try {
        const data = {
            nombre: serviceForm.nombre,
            precio: serviceForm.precio || null,
            duracion: serviceForm.duracion,
            activo: serviceForm.activo,
        }

        if (editingService.value) {
            await servicesService.update(editingService.value.id, data)
            notify.success('Servicio actualizado')
        } else {
            await servicesService.create(data)
            notify.success('Servicio creado')
        }

        showServiceModal.value = false
        fetchServices()
    } catch (error) {
        notify.error('Error al guardar servicio')
    } finally {
        savingService.value = false
    }
}

// Eliminar servicio
const eliminarServicio = async (service) => {
    const confirmado = await notify.confirmDelete(
        `¿Eliminar el servicio "${service.nombre}"?`,
        'Esta acción no se puede deshacer'
    )

    if (!confirmado) return

    try {
        await servicesService.delete(service.id)
        notify.success('Servicio eliminado')
        fetchServices()
    } catch (error) {
        notify.error('Error al eliminar servicio')
    }
}

// Formatear precio
const formatPrecio = (precio) => {
    if (!precio) return '-'
    return `$${parseFloat(precio).toLocaleString('es-AR')}`
}

// Ir a planes
const goToPlans = () => {
    router.push('/planes')
}

onMounted(async () => {
    await loadFeatures()
    fetchBusiness()
    fetchServices()
})
</script>
