<template>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Logo -->
            <div class="auth-logo">
                <h1>MiTurno</h1>
                <p>Creá tu cuenta gratis</p>
            </div>

            <!-- Alerta de error -->
            <div v-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <!-- Formulario -->
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label class="form-label">Tu nombre</label>
                    <input
                        v-model="form.name"
                        type="text"
                        class="form-input"
                        :class="{ 'form-input-error': errors.name }"
                        placeholder="Ej: María García"
                        required
                    />
                    <p v-if="errors.name" class="form-error">{{ errors.name[0] }}</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input
                        v-model="form.email"
                        type="email"
                        class="form-input"
                        :class="{ 'form-input-error': errors.email }"
                        placeholder="tu@email.com"
                        required
                    />
                    <p v-if="errors.email" class="form-error">{{ errors.email[0] }}</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Contraseña</label>
                    <input
                        v-model="form.password"
                        type="password"
                        class="form-input"
                        :class="{ 'form-input-error': errors.password }"
                        placeholder="Mínimo 6 caracteres"
                        required
                    />
                    <p v-if="errors.password" class="form-error">{{ errors.password[0] }}</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Nombre de tu negocio</label>
                    <input
                        v-model="form.nombre_negocio"
                        type="text"
                        class="form-input"
                        :class="{ 'form-input-error': errors.nombre_negocio }"
                        placeholder="Ej: Peluquería María"
                        required
                    />
                    <p v-if="errors.nombre_negocio" class="form-error">{{ errors.nombre_negocio[0] }}</p>
                </div>

                <button
                    type="submit"
                    class="btn btn-primary btn-lg btn-block"
                    :disabled="loading"
                >
                    <span v-if="loading" class="spinner"></span>
                    <span v-else>Crear cuenta</span>
                </button>
            </form>

            <!-- Link a login -->
            <div class="auth-footer">
                <p>
                    ¿Ya tenés cuenta?
                    <router-link to="/login">Iniciá sesión</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado del formulario
const form = reactive({
    name: '',
    email: '',
    password: '',
    nombre_negocio: '',
})

// Estados
const loading = ref(false)
const error = ref(null)
const errors = ref({})

// Enviar formulario
const handleSubmit = async () => {
    loading.value = true
    error.value = null
    errors.value = {}

    const result = await authStore.register(form)

    if (result.success) {
        // Redirigir al dashboard
        router.push('/dashboard')
    } else {
        error.value = result.error
        if (result.errors) {
            errors.value = result.errors
        }
    }

    loading.value = false
}
</script>
