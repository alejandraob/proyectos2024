<template>
    <div class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'dark-mode': isDarkMode }">
        <!-- Overlay para móvil -->
        <div
            v-if="sidebarOpen && isMobile"
            class="sidebar-overlay"
            @click="closeSidebar"
        ></div>

        <!-- Menú de usuario (PrimeVue) -->
        <Menu ref="userMenu" :model="userMenuItems" :popup="true" class="user-popup-menu" />

        <!-- Sidebar -->
        <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen, 'sidebar-hidden': isMobile && !sidebarOpen }">
            <!-- Logo -->
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                    <span class="sidebar-text">MiTurno</span>
                </div>
                <!-- Botón cerrar en móvil -->
                <button v-if="isMobile" @click="closeSidebar" class="sidebar-close">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>

            <!-- Navegación -->
            <nav class="sidebar-nav">
                <div class="sidebar-section">
                    <span class="sidebar-text">{{ $t('nav.main') }}</span>
                </div>

                <router-link to="/dashboard" class="sidebar-link" active-class="active" @click="closeSidebarOnMobile">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                    <span class="sidebar-text">{{ $t('nav.dashboard') }}</span>
                </router-link>

                <router-link to="/agenda" class="sidebar-link" active-class="active" @click="closeSidebarOnMobile">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                    <span class="sidebar-text">{{ $t('nav.agenda') }}</span>
                </router-link>

                <router-link to="/clientes" class="sidebar-link" active-class="active" @click="closeSidebarOnMobile">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    <span class="sidebar-text">{{ $t('nav.clients') }}</span>
                </router-link>

                <div class="sidebar-section">
                    <span class="sidebar-text">{{ $t('nav.settings') }}</span>
                </div>

                <router-link to="/configuracion" class="sidebar-link" active-class="active" @click="closeSidebarOnMobile">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                    <span class="sidebar-text">{{ $t('nav.settings') }}</span>
                </router-link>
            </nav>

            <!-- Footer del Sidebar -->
            <div class="sidebar-footer">
                <button @click="toggleUserMenu" class="sidebar-user-btn" aria-haspopup="true">
                    <div class="sidebar-avatar">
                        {{ userInitials }}
                    </div>
                    <div class="sidebar-user-info">
                        <div class="text-sm font-medium">{{ userName }}</div>
                        <div class="text-xs text-muted">{{ businessName }}</div>
                    </div>
                    <svg class="sidebar-chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                </button>
            </div>
        </aside>

        <!-- Contenido Principal -->
        <main class="main-content">
            <!-- Header -->
            <header class="main-header">
                <div class="header-left">
                    <!-- Botón hamburguesa -->
                    <button @click.stop.prevent="toggleSidebar" class="btn-hamburger" type="button">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                    </button>
                    <h1 class="page-title">{{ pageTitle }}</h1>
                </div>
                <div class="header-actions">
                    <!-- Toggle Dark Mode -->
                    <button @click.stop.prevent="toggleDarkMode" class="btn-icon" :title="isDarkMode ? $t('nav.lightMode') : $t('nav.darkMode')" type="button">
                        <!-- Sol (modo claro) -->
                        <svg v-if="isDarkMode" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                        </svg>
                        <!-- Luna (modo oscuro) -->
                        <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                        </svg>
                    </button>
                    <slot name="header-actions"></slot>
                </div>
            </header>

            <!-- Body -->
            <div class="main-body">
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
import { setLocale, getLocale } from '../../i18n'
import Menu from 'primevue/menu'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

// Estados del sidebar
const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const isMobile = ref(window.innerWidth < 768)

// Estado del dark mode
const isDarkMode = ref(false)

// Menú de usuario
const userMenu = ref()
const userMenuItems = ref([])

// Construir menú de usuario con traducciones
const buildUserMenu = () => {
    const currentLang = getLocale()
    userMenuItems.value = [
        {
            label: t('nav.language'),
            icon: 'pi pi-globe',
            items: [
                { label: 'Español', icon: currentLang === 'es' ? 'pi pi-check' : null, command: () => changeLanguage('es') },
                { label: 'English', icon: currentLang === 'en' ? 'pi pi-check' : null, command: () => changeLanguage('en') },
                { label: 'Português', icon: currentLang === 'pt' ? 'pi pi-check' : null, command: () => changeLanguage('pt') }
            ]
        },
        { separator: true },
        {
            label: t('nav.upgradePlan'),
            icon: 'pi pi-star',
            command: () => router.push('/planes')
        },
        {
            label: t('nav.billing'),
            icon: 'pi pi-credit-card',
            command: () => router.push('/facturacion')
        },
        {
            label: t('nav.myIncome'),
            icon: 'pi pi-wallet',
            command: () => router.push('/ingresos')
        },
        { separator: true },
        {
            label: t('nav.logout'),
            icon: 'pi pi-sign-out',
            command: () => handleLogout()
        }
    ]
}

const toggleUserMenu = (event) => {
    userMenu.value.toggle(event)
}

const changeLanguage = (lang) => {
    setLocale(lang)
    buildUserMenu()
}

// Datos del usuario
const userName = computed(() => authStore.userName)
const userInitials = computed(() => authStore.userInitials)
const businessName = computed(() => authStore.businessName)

// Título de la página según la ruta
const pageTitle = computed(() => {
    const titles = {
        '/dashboard': 'Dashboard',
        '/agenda': 'Agenda',
        '/clientes': 'Clientes',
        '/configuracion': 'Configuración',
    }
    return titles[route.path] || 'MiTurno'
})

// Detectar si es móvil
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    if (!isMobile.value) {
        sidebarOpen.value = false
    }
}

// Toggle sidebar
const toggleSidebar = () => {
    if (isMobile.value) {
        sidebarOpen.value = !sidebarOpen.value
    } else {
        sidebarCollapsed.value = !sidebarCollapsed.value
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value)
    }
}

// Cerrar sidebar
const closeSidebar = () => {
    sidebarOpen.value = false
}

// Cerrar sidebar en móvil al navegar
const closeSidebarOnMobile = () => {
    if (isMobile.value) {
        sidebarOpen.value = false
    }
}

// Toggle dark mode
const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value)
    updateDarkMode()
}

// Aplicar dark mode al documento
const updateDarkMode = () => {
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
    } else {
        document.documentElement.classList.remove('dark-mode')
    }
}

// Cerrar sesión
const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
}

onMounted(() => {
    // Cargar estado guardado del sidebar
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed !== null) {
        sidebarCollapsed.value = savedCollapsed === 'true'
    }

    // Cargar estado guardado del dark mode
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
        isDarkMode.value = savedDarkMode === 'true'
    }
    updateDarkMode()

    // Inicializar menú de usuario con traducciones
    buildUserMenu()

    // Detectar tamaño de pantalla
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-shrink: 0;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
}

.btn-hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text);
    transition: background-color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    position: relative;
    z-index: 10;
}

.btn-hamburger:hover {
    background-color: var(--color-bg-light);
}

.btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text);
    transition: background-color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    position: relative;
    z-index: 10;
}

.btn-icon:hover {
    background-color: var(--color-bg-light);
}

.sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-white);
    transition: background-color var(--transition-fast);
}

.sidebar-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Sidebar header con espacio para el botón cerrar */
.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Overlay para móvil */
.sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
}

/* Botón de usuario en sidebar */
.sidebar-user-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-white);
    transition: background-color var(--transition-fast);
    text-align: left;
}

.sidebar-user-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.sidebar-chevron {
    margin-left: auto;
    opacity: 0.7;
    transition: transform var(--transition-fast);
}

.sidebar-user-btn:hover .sidebar-chevron {
    opacity: 1;
}

/* Ocultar elementos en sidebar colapsado */
.sidebar-collapsed .sidebar-user-info,
.sidebar-collapsed .sidebar-chevron {
    display: none;
}

.sidebar-collapsed .sidebar-user-btn {
    justify-content: center;
    padding: var(--spacing-sm);
}
</style>
