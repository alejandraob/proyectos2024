/**
 * Income Service - Servicio para gestión de ingresos
 */
import api from './api'

// --- Income Service (Ingresos por servicios) ---
export const incomeService = {
    getAll(filters = {}) {
        return api.get('/income', { params: filters })
    },

    getOne(id) {
        return api.get(`/income/${id}`)
    },

    create(data) {
        return api.post('/income', data)
    },

    update(id, data) {
        return api.put(`/income/${id}`, data)
    },

    delete(id) {
        return api.delete(`/income/${id}`)
    },

    getSummary() {
        return api.get('/income/summary')
    },
}

// --- Reports Service (Reportes y estadísticas) ---
export const reportsService = {
    getDashboard(filters = {}) {
        return api.get('/reports/dashboard', { params: filters })
    },

    getAppointments(filters = {}) {
        return api.get('/reports/appointments', { params: filters })
    },

    getIncome(filters = {}) {
        return api.get('/reports/income', { params: filters })
    },

    getTopClients(filters = {}) {
        return api.get('/reports/top-clients', { params: filters })
    },

    getHourlyStats(filters = {}) {
        return api.get('/reports/hourly', { params: filters })
    },

    getWeekdayStats(filters = {}) {
        return api.get('/reports/weekday', { params: filters })
    },
}
