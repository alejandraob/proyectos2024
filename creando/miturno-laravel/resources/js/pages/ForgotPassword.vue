<template>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Logo -->
            <div class="auth-logo">
                <h1>MiTurno</h1>
                <p>Recuperar contraseña</p>
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="sent" class="alert alert-success">
                <p><strong>¡Listo!</strong></p>
                <p>Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
                <p class="mt-2">
                    <router-link to="/login" class="alert-link">
                        Volver al inicio de sesión
                    </router-link>
                </p>
            </div>

            <!-- Formulario -->
            <template v-else>
                <p class="text-muted mb-4">
                    Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <!-- Alerta de error -->
                <div v-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input
                            v-model="email"
                            type="email"
                            class="form-input"
                            placeholder="tu@email.com"
                            required
                            autofocus
                        />
                    </div>

                    <button
                        type="submit"
                        class="btn btn-primary btn-lg btn-block"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="spinner"></span>
                        <span v-else>Enviar enlace de recuperación</span>
                    </button>
                </form>
            </template>

            <!-- Link a login -->
            <div class="auth-footer">
                <p>
                    <router-link to="/login">← Volver al inicio de sesión</router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '../services/api'

// Estados
const email = ref('')
const loading = ref(false)
const error = ref(null)
const sent = ref(false)

// Enviar formulario
const handleSubmit = async () => {
    loading.value = true
    error.value = null

    try {
        await authService.forgotPassword(email.value)
        sent.value = true
    } catch (err) {
        // Siempre mostrar éxito por seguridad (no revelar si el email existe)
        // Solo mostrar error si es un problema de servidor
        if (err.response?.status >= 500) {
            error.value = 'Error del servidor. Por favor intentá más tarde.'
        } else {
            // Por seguridad, siempre mostrar éxito
            sent.value = true
        }
    } finally {
        loading.value = false
    }
}
</script>
