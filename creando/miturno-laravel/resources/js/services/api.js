/**
 * ============================================
 * CONFIGURACIÓN DE AXIOS - API Service
 * ============================================
 *
 * Este archivo configura Axios para todas las
 * peticiones HTTP a la API de Laravel.
 *
 * Características:
 * - Base URL configurada
 * - Interceptor para agregar token automáticamente
 * - Interceptor para manejar errores (401, 500, etc.)
 * - Métodos helper para GET, POST, PUT, DELETE
 */

import axios from 'axios'

// Crear instancia de Axios con configuración base
const api = axios.create({
    baseURL: '/api',  // Laravel sirve la API en /api
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})


/* ============================================
   INTERCEPTOR DE REQUEST
   ============================================
   Se ejecuta ANTES de cada petición.
   Agrega el token de autenticación si existe.
*/
api.interceptors.request.use(
    (config) => {
        // Obtener token del localStorage
        const token = localStorage.getItem('token')

        // Si hay token, agregarlo al header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


/* ============================================
   INTERCEPTOR DE RESPONSE
   ============================================
   Se ejecuta DESPUÉS de cada respuesta.
   Maneja errores comunes como 401 (no autenticado).
*/
api.interceptors.response.use(
    // Respuesta exitosa - retornar datos directamente
    (response) => {
        return response
    },

    // Error - manejar según el código
    (error) => {
        const { response } = error

        if (response) {
            switch (response.status) {
                case 401:
                    // No autenticado - limpiar token y redirigir
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')

                    // Solo redirigir si no estamos ya en login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }
                    break

                case 403:
                    // Prohibido - no tiene permisos
                    console.error('No tienes permisos para esta acción')
                    break

                case 404:
                    // No encontrado
                    console.error('Recurso no encontrado')
                    break

                case 422:
                    // Error de validación - se maneja en el componente
                    break

                case 500:
                    // Error del servidor
                    console.error('Error del servidor. Intenta nuevamente.')
                    break

                default:
                    console.error('Error:', response.status)
            }
        } else {
            // Error de red (sin conexión, timeout, etc.)
            console.error('Error de conexión. Verifica tu internet.')
        }

        return Promise.reject(error)
    }
)


/* ============================================
   MÉTODOS HELPER
   ============================================
   Simplifican las llamadas a la API.
*/

export const apiService = {
    /**
     * GET request
     * @param {string} url - Endpoint (ej: '/appointments')
     * @param {object} params - Query params opcionales
     */
    get(url, params = {}) {
        return api.get(url, { params })
    },

    /**
     * POST request
     * @param {string} url - Endpoint
     * @param {object} data - Datos a enviar
     */
    post(url, data = {}) {
        return api.post(url, data)
    },

    /**
     * PUT request
     * @param {string} url - Endpoint
     * @param {object} data - Datos a actualizar
     */
    put(url, data = {}) {
        return api.put(url, data)
    },

    /**
     * DELETE request
     * @param {string} url - Endpoint
     */
    delete(url) {
        return api.delete(url)
    },
}


/* ============================================
   SERVICIOS ESPECÍFICOS
   ============================================
   Agrupan las llamadas por entidad.
*/

// --- Auth Service ---
export const authService = {
    login(credentials) {
        return api.post('/login', credentials)
    },

    register(data) {
        return api.post('/register', data)
    },

    logout() {
        return api.post('/logout')
    },

    me() {
        return api.get('/me')
    },

    forgotPassword(email) {
        return api.post('/forgot-password', { email })
    },
}

// --- Business Service ---
export const businessService = {
    get() {
        return api.get('/business')
    },

    update(data) {
        return api.put('/business', data)
    },

    updateHours(horarios) {
        return api.put('/business/hours', { horarios })
    },

    updateSettings(settings) {
        return api.put('/business/settings', settings)
    },

    getStats() {
        return api.get('/business/stats')
    },

    // Público - para clientes
    getBySlug(slug) {
        return api.get(`/negocio/${slug}`)
    },
}

// --- Clients Service ---
export const clientsService = {
    getAll() {
        return api.get('/clients')
    },

    getOne(id) {
        return api.get(`/clients/${id}`)
    },

    create(data) {
        return api.post('/clients', data)
    },

    update(id, data) {
        return api.put(`/clients/${id}`, data)
    },

    delete(id) {
        return api.delete(`/clients/${id}`)
    },
}

// --- Services Service (Servicios del negocio) ---
export const servicesService = {
    getAll() {
        return api.get('/services')
    },

    getOne(id) {
        return api.get(`/services/${id}`)
    },

    create(data) {
        return api.post('/services', data)
    },

    update(id, data) {
        return api.put(`/services/${id}`, data)
    },

    delete(id) {
        return api.delete(`/services/${id}`)
    },

    // Público - para clientes
    getBySlug(slug) {
        return api.get(`/negocio/${slug}/services`)
    },
}

// --- Appointments Service ---
export const appointmentsService = {
    getAll(filters = {}) {
        return api.get('/appointments', { params: filters })
    },

    getOne(id) {
        return api.get(`/appointments/${id}`)
    },

    create(data) {
        return api.post('/appointments', data)
    },

    update(id, data) {
        return api.put(`/appointments/${id}`, data)
    },

    cancel(id) {
        return api.post(`/appointments/${id}/cancel`)
    },

    // Público - para clientes
    getAvailableSlots(slug, fecha) {
        return api.get(`/negocio/${slug}/slots`, { params: { fecha } })
    },

    createPublic(slug, data) {
        return api.post(`/negocio/${slug}/turno`, data)
    },
}


// Exportar la instancia de axios por si se necesita directamente
export default api

// --- Payments Service (MercadoPago) ---
export const paymentsService = {
    getPlans() {
        return api.get('/plans')
    },

    getCurrentPlan() {
        return api.get('/payments/current-plan')
    },

    createCheckout(planId) {
        return api.post('/payments/checkout', { plan_id: planId })
    },

    confirmPayment(paymentId) {
        return api.post('/payments/confirm', { payment_id: paymentId })
    },

    verifyPayment(paymentId) {
        return api.post('/payments/verify', { payment_id: paymentId })
    },

    getHistory() {
        return api.get('/payments/history')
    },

    downgradeToFree() {
        return api.post('/payments/downgrade')
    },

    /**
     * Simular cambio de plan (solo desarrollo)
     * @param {string} planName - 'free', 'pro', 'premium'
     */
    simulateUpgrade(planName) {
        return api.post('/payments/simulate', { plan_name: planName })
    },
}

// --- Features Service (Plan del usuario) ---
export const featuresService = {
    /**
     * Obtener features del plan actual del usuario
     * Retorna: plan_name, appointments_limit, email_reminders, whatsapp_enabled, etc.
     */
    get() {
        return api.get('/me/features')
    },
}
