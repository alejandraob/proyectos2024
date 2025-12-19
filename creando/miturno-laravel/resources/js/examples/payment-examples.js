/**
 * ============================================
 * EJEMPLO: Cómo usar la integración de MercadoPago
 * ============================================
 *
 * Este archivo muestra ejemplos prácticos de cómo
 * integrar el flujo de pagos en tu aplicación.
 */

// ============================================
// 1. OBTENER PLANES DISPONIBLES
// ============================================

import { paymentsService } from '@/services/api'

async function loadPlans() {
  try {
    const response = await paymentsService.getPlans()
    console.log('Planes disponibles:', response.data)

    // response.data es un array de planes
    // [
    //   { id: 1, name: 'free', price: '0', ... },
    //   { id: 2, name: 'pro', price: '3500', ... },
    //   { id: 3, name: 'premium', price: '7000', ... }
    // ]
  } catch (error) {
    console.error('Error cargando planes:', error)
  }
}


// ============================================
// 2. OBTENER PLAN ACTUAL DEL USUARIO
// ============================================

async function checkCurrentPlan() {
  try {
    const response = await paymentsService.getCurrentPlan()

    const { plan, subscription } = response.data

    console.log('Plan actual:', plan.name)
    console.log('Estado suscripción:', subscription?.status)

    // Ejemplo de respuesta:
    // {
    //   "plan": {
    //     "id": 2,
    //     "name": "pro",
    //     "display_name": "PRO",
    //     "price": "3500.00",
    //     ...
    //   },
    //   "subscription": {
    //     "id": 15,
    //     "status": "active",
    //     "starts_at": "2025-12-19T14:30:00Z",
    //     "ends_at": "2026-01-19T14:30:00Z"
    //   }
    // }
  } catch (error) {
    console.error('Error verificando plan:', error)
  }
}


// ============================================
// 3. COMPRAR/ACTUALIZAR A UN PLAN PREMIUM
// ============================================

async function upgradeToPlan(planId) {
  try {
    // Paso 1: Crear checkout en el backend
    const response = await paymentsService.createCheckout(planId)

    const { payment_link, payment_id, plan } = response.data

    console.log('✅ Checkout creado')
    console.log('Payment ID:', payment_id)
    console.log('Plan:', plan.display_name)

    // Paso 2: Guardar el payment_id (necesario después de pagar)
    sessionStorage.setItem('payment_id', payment_id)

    // Paso 3: Redirigir al usuario a MercadoPago
    if (payment_link) {
      console.log('Redirigiendo a:', payment_link)
      window.location.href = payment_link

      // El usuario verá:
      // 1. La página de checkout de MercadoPago
      // 2. Opciones de pago (tarjeta, efectivo, transferencia, etc)
      // 3. Detalles del plan a comprar
      // 4. Precio total

      // Después de pagar, MercadoPago lo redirige a:
      // /planes?status=approved  (si el pago fue exitoso)
      // /planes?status=failure   (si fue rechazado)
      // /planes?status=pending   (si está en proceso)
    }
  } catch (error) {
    console.error('Error al crear pago:', error)
    // Mostrar mensaje de error al usuario
  }
}


// ============================================
// 4. CONFIRMAR PAGO (después de volver de MP)
// ============================================

async function confirmPayment() {
  // Este método se ejecuta automáticamente en el componente Planes.vue
  // cuando el usuario vuelve de MercadoPago con status=approved

  const paymentId = sessionStorage.getItem('payment_id')

  if (!paymentId) {
    console.error('No hay payment_id en sessionStorage')
    return
  }

  try {
    const response = await paymentsService.confirmPayment(paymentId)

    console.log('✅ Pago confirmado')
    console.log('Nueva suscripción:', response.data.subscription)

    // response.data.subscription contiene:
    // {
    //   "id": 15,
    //   "user_id": 1,
    //   "plan_id": 2,
    //   "status": "active",
    //   "starts_at": "2025-12-19T14:30:00Z",
    //   "ends_at": "2026-01-19T14:30:00Z",
    //   "plan": { "id": 2, "name": "pro", ... }
    // }

    // Limpiar sessionStorage
    sessionStorage.removeItem('payment_id')

    // Aquí puedes:
    // - Mostrar mensaje de éxito
    // - Redirigir a panel de usuario
    // - Actualizar la UI

  } catch (error) {
    console.error('Error confirmando pago:', error)
  }
}


// ============================================
// 5. VERIFICAR ESTADO DE UN PAGO
// ============================================

async function checkPaymentStatus(paymentId) {
  try {
    const response = await paymentsService.verifyPayment(paymentId)

    const { payment, is_approved } = response.data

    if (is_approved) {
      console.log('✅ Pago aprobado')
      console.log('Status:', payment.status)
      console.log('Plan:', payment.plan.name)
    } else {
      console.log('❌ Pago aún no aprobado')
      console.log('Status actual:', payment.status)
    }

  } catch (error) {
    console.error('Error verificando pago:', error)
  }
}


// ============================================
// 6. VER HISTORIAL DE PAGOS
// ============================================

async function loadPaymentHistory() {
  try {
    const response = await paymentsService.getHistory()

    console.log('Historial de pagos:', response.data)

    // response.data es un array como:
    // [
    //   {
    //     "id": 42,
    //     "user_id": 1,
    //     "plan_id": 2,
    //     "amount": "3500.00",
    //     "currency": "ARS",
    //     "status": "approved",
    //     "payment_method": "credit_card",
    //     "paid_at": "2025-12-19T14:35:00Z",
    //     "created_at": "2025-12-19T14:30:00Z",
    //     "plan": { ... }
    //   }
    // ]

    // Puedes mostrar esto en una tabla:
    response.data.forEach(payment => {
      console.log(`${payment.created_at}: ${payment.plan.name} - $${payment.amount} - ${payment.status}`)
    })

  } catch (error) {
    console.error('Error cargando historial:', error)
  }
}


// ============================================
// 7. CANCELAR SUSCRIPCIÓN (volver a FREE)
// ============================================

async function downgradeToFree() {
  try {
    // Pedir confirmación al usuario
    const confirmed = confirm('¿Estás seguro de que deseas cancelar tu suscripción?')

    if (!confirmed) {
      return
    }

    const response = await paymentsService.downgradeToFree()

    console.log('✅ Suscripción cancelada')
    console.log('Mensaje:', response.data.message)

    // Tu plan ahora es FREE
    // - Perderás acceso a features premium
    // - El cambio es inmediato

  } catch (error) {
    console.error('Error cancelando suscripción:', error)
  }
}


// ============================================
// 8. FLUJO COMPLETO EN UN COMPONENTE VUE
// ============================================

// En tu componente Planes.vue, puedes hacer:

/*

<template>
  <div>
    <h1>Mis Planes</h1>

    <!-- Plan actual -->
    <div v-if="currentPlan">
      <h2>Plan actual: {{ currentPlan.display_name }}</h2>
      <p>Válido hasta: {{ subscription?.ends_at }}</p>
    </div>

    <!-- Lista de planes -->
    <div v-for="plan in plans" :key="plan.id">
      <h3>{{ plan.display_name }}</h3>
      <p>${{ plan.price }}/mes</p>

      <button
        v-if="currentPlan?.id !== plan.id"
        @click="upgradePlan(plan.id)"
        :disabled="loading"
      >
        {{ loading ? 'Procesando...' : 'Seleccionar' }}
      </button>

      <button v-else disabled>
        Plan actual
      </button>
    </div>

    <!-- Botón para cancelar suscripción -->
    <button
      v-if="currentPlan?.name !== 'free'"
      @click="downgradeToFree"
      class="btn-danger"
    >
      Cancelar suscripción
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { paymentsService } from '@/services/api'
import { useNotify } from '@/composables/useNotify'

const route = useRoute()
const { success, error } = useNotify()

const plans = ref([])
const currentPlan = ref(null)
const subscription = ref(null)
const loading = ref(false)

// Cargar plan actual
const loadCurrentPlan = async () => {
  const response = await paymentsService.getCurrentPlan()
  currentPlan.value = response.data.plan
  subscription.value = response.data.subscription
}

// Cargar planes
const loadPlans = async () => {
  const response = await paymentsService.getPlans()
  plans.value = response.data
}

// Actualizar a plan premium
const upgradePlan = async (planId) => {
  loading.value = true
  try {
    const response = await paymentsService.createCheckout(planId)
    sessionStorage.setItem('payment_id', response.data.payment_id)
    success('Redirigiendo a MercadoPago...')
    window.location.href = response.data.payment_link
  } catch (err) {
    error('Error al crear pago')
  } finally {
    loading.value = false
  }
}

// Cancelar suscripción
const downgradeToFree = async () => {
  if (confirm('¿Cancelar suscripción?')) {
    await paymentsService.downgradeToFree()
    success('Suscripción cancelada')
    await loadCurrentPlan()
  }
}

// Confirmar pago al volver de MP
const checkPaymentStatus = async () => {
  const status = route.query.status
  const paymentId = sessionStorage.getItem('payment_id')

  if (status === 'approved' && paymentId) {
    await paymentsService.confirmPayment(paymentId)
    success('¡Pago confirmado!')
    sessionStorage.removeItem('payment_id')
    await loadCurrentPlan()
  }
}

onMounted(async () => {
  await Promise.all([loadCurrentPlan(), loadPlans()])
  await checkPaymentStatus()
})
</script>

*/


// ============================================
// 9. CASOS DE USO COMUNES
// ============================================

// CASO 1: Usuario quiere cambiar de PRO a PREMIUM
async function changePlan() {
  // 1. Obtener el nuevo plan (PREMIUM)
  const plans = (await paymentsService.getPlans()).data
  const premiumPlan = plans.find(p => p.name === 'premium')

  // 2. Crear checkout
  const response = await paymentsService.createCheckout(premiumPlan.id)

  // 3. Redirigir a MercadoPago
  window.location.href = response.data.payment_link

  // 4. Cuando vuelva, se cancela la suscripción PRO anterior
  //    y se crea una nueva PREMIUM
}

// CASO 2: Usuario libre quiere probar PRO
async function startFreeTrialPro() {
  // Lo mismo que cambiar de plan, solo que desde FREE a PRO
  const proId = 2 // el ID de PRO
  const response = await paymentsService.createCheckout(proId)
  window.location.href = response.data.payment_link
}

// CASO 3: Usuario quiere ver sus pagos previos
async function showInvoices() {
  const payments = (await paymentsService.getHistory()).data

  // Mostrar en una tabla
  // Fecha | Plan | Monto | Estado
  // -----+------+-------+-------
  // 19/12 | PRO  | $3500 | Aprobado
  // 19/11 | PRO  | $3500 | Aprobado
}

// CASO 4: Usuario quiere cancelar y volver a FREE
async function cancelAndDowngrade() {
  const confirmed = confirm(
    'Se cancelará tu suscripción y perderás acceso a features premium. ¿Continuar?'
  )

  if (confirmed) {
    await paymentsService.downgradeToFree()
    // Actualizar UI para mostrar que es plan FREE
  }
}
