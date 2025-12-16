/**
 * ============================================
 * CONFIGURACIÓN DE RUTAS (Vue Router)
 * ============================================
 *
 * Define todas las rutas de la aplicación.
 * Incluye protección de rutas con navigation guards.
 */

import { createRouter, createWebHistory } from 'vue-router'

// Definición de rutas
const routes = [
    /* ============================================
       RUTAS PÚBLICAS
       ============================================ */
    {
        path: '/',
        name: 'home',
        component: () => import('../pages/Home.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../pages/Login.vue'),
        meta: { guest: true },  // Solo para usuarios no autenticados
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../pages/Register.vue'),
        meta: { guest: true },
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('../pages/ForgotPassword.vue'),
        meta: { guest: true },
    },
    {
        path: '/reservar/:slug',
        name: 'reservar',
        component: () => import('../pages/Reservar.vue'),
        meta: { public: true },  // Página pública para clientes
    },

    /* ============================================
       RUTAS PROTEGIDAS (requieren autenticación)
       ============================================ */
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/agenda',
        name: 'agenda',
        component: () => import('../pages/Agenda.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/clientes',
        name: 'clientes',
        component: () => import('../pages/Clientes.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/configuracion',
        name: 'configuracion',
        component: () => import('../pages/Configuracion.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/planes',
        name: 'planes',
        component: () => import('../pages/Planes.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/facturacion',
        name: 'facturacion',
        component: () => import('../pages/Facturacion.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/ingresos',
        name: 'ingresos',
        component: () => import('../pages/Ingresos.vue'),
        meta: { requiresAuth: true },
    },

    /* ============================================
       RUTA 404
       ============================================ */
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: '/',
    },
]

// Crear router
const router = createRouter({
    history: createWebHistory(),
    routes,
})


/* ============================================
   NAVIGATION GUARDS
   ============================================
   Se ejecuta antes de cada navegación.
   Verifica si el usuario puede acceder a la ruta.
*/
router.beforeEach((to, from, next) => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token')
    const isAuthenticated = !!token

    // Ruta requiere autenticación
    if (to.meta.requiresAuth && !isAuthenticated) {
        // Redirigir a login
        next({ name: 'login' })
        return
    }

    // Ruta es solo para invitados (login/register)
    if (to.meta.guest && isAuthenticated) {
        // Redirigir a dashboard
        next({ name: 'dashboard' })
        return
    }

    // Permitir navegación
    next()
})

export default router
