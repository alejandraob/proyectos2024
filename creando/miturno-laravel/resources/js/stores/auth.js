/**
 * ============================================
 * STORE DE AUTENTICACIÓN (Pinia)
 * ============================================
 *
 * Maneja el estado global de autenticación:
 * - Usuario actual
 * - Token de acceso
 * - Negocio del usuario
 * - Login, logout, registro
 */

import { defineStore } from 'pinia'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', {
    /* ============================================
       STATE
       ============================================ */
    state: () => ({
        // Usuario autenticado
        user: JSON.parse(localStorage.getItem('user')) || null,

        // Token de acceso
        token: localStorage.getItem('token') || null,

        // Negocio del usuario
        business: JSON.parse(localStorage.getItem('business')) || null,

        // Estado de carga
        loading: false,

        // Errores
        error: null,
    }),


    /* ============================================
       GETTERS
       ============================================ */
    getters: {
        // ¿Está autenticado?
        isAuthenticated: (state) => !!state.token,

        // Nombre del usuario
        userName: (state) => state.user?.name || '',

        // Email del usuario
        userEmail: (state) => state.user?.email || '',

        // Nombre del negocio
        businessName: (state) => state.business?.nombre_negocio || '',

        // Slug del negocio (para URL pública)
        businessSlug: (state) => state.business?.slug || '',

        // Iniciales del usuario (para avatar)
        userInitials: (state) => {
            if (!state.user?.name) return '?'
            return state.user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        },
    },


    /* ============================================
       ACTIONS
       ============================================ */
    actions: {
        /**
         * Iniciar sesión
         * @param {object} credentials - { email, password }
         */
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const response = await authService.login(credentials)
                const { user, token } = response.data

                // Guardar en el store
                this.user = user
                this.token = token
                this.business = user.business

                // Persistir en localStorage
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                localStorage.setItem('business', JSON.stringify(user.business))

                return { success: true, errors: {} }

            } catch (error) {
                const message = error.response?.data?.message || 'Error al iniciar sesión'
                const errors = error.response?.data?.errors || {}
                this.error = message
                return { success: false, error: message, errors }

            } finally {
                this.loading = false
            }
        },


        /**
         * Registrar nuevo usuario
         * @param {object} data - { name, email, password, nombre_negocio }
         */
        async register(data) {
            this.loading = true
            this.error = null

            try {
                const response = await authService.register(data)
                const { user, token, business } = response.data

                // Guardar en el store
                this.user = user
                this.token = token
                this.business = business

                // Persistir en localStorage
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
                localStorage.setItem('business', JSON.stringify(business))

                return { success: true, errors: {} }

            } catch (error) {
                const message = error.response?.data?.message || 'Error al registrarse'
                const errors = error.response?.data?.errors || {}
                this.error = message
                return { success: false, error: message, errors }

            } finally {
                this.loading = false
            }
        },


        /**
         * Cerrar sesión
         */
        async logout() {
            try {
                // Llamar a la API (opcional, para invalidar token en servidor)
                if (this.token) {
                    await authService.logout()
                }
            } catch (error) {
                // Ignorar errores, limpiar de todas formas
                console.log('Error en logout:', error)
            }

            // Limpiar store
            this.user = null
            this.token = null
            this.business = null
            this.error = null

            // Limpiar localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('business')
        },


        /**
         * Obtener datos del usuario actual
         * Útil para verificar si el token sigue válido
         */
        async fetchUser() {
            if (!this.token) return

            this.loading = true

            try {
                const response = await authService.me()
                const user = response.data

                // Actualizar store
                this.user = user
                this.business = user.business

                // Actualizar localStorage
                localStorage.setItem('user', JSON.stringify(user))
                localStorage.setItem('business', JSON.stringify(user.business))

                return { success: true, user }

            } catch (error) {
                // Token inválido - hacer logout
                this.logout()
                return { success: false }

            } finally {
                this.loading = false
            }
        },


        /**
         * Actualizar datos del negocio en el store
         * Se usa después de editar el negocio
         */
        updateBusiness(business) {
            this.business = business
            localStorage.setItem('business', JSON.stringify(business))
        },


        /**
         * Limpiar error
         */
        clearError() {
            this.error = null
        },
    },
})
