# Integración Simplificada de MercadoPago

## 📋 Descripción General

Se ha simplificado la integración de MercadoPago **eliminando preferencias complejas y SDK pesados**. Ahora usamos:

✅ Links de pago directos  
✅ API mínima de MercadoPago  
✅ Confirmación manual del pago  
✅ Sin webhooks complejos  

---

## 🔄 Flujo de Pago

```
Usuario hace clic en "Upgrade" 
    ↓
createCheckout() crea registro de pago en BD
    ↓
Se genera preferencia en MercadoPago API
    ↓
Se obtiene el link de checkout
    ↓
Usuario es redirigido a checkout.mercadopago.com
    ↓
Usuario paga
    ↓
MercadoPago lo redirige a ?status=approved
    ↓
Frontend llama a confirmPayment()
    ↓
Backend actualiza el pago y crea suscripción
    ↓
✅ Pago confirmado
```

---

## 🎯 Endpoints Principales

### 1. Obtener planes disponibles
```bash
GET /api/plans
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "free",
    "display_name": "FREE",
    "price": "0.00",
    "currency": "ARS",
    "appointments_limit": 30,
    "professionals_limit": 1,
    "email_reminders": false,
    "whatsapp_enabled": false,
    "public_page": true,
    "priority_support": false,
    "advanced_reports": false
  },
  ...
]
```

---

### 2. Crear checkout (generar link de pago)
```bash
POST /api/payments/checkout
Content-Type: application/json
Authorization: Bearer {token}

{
  "plan_id": 2
}
```

**Respuesta exitosa:**
```json
{
  "payment_link": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890",
  "payment_id": 42,
  "plan": {
    "id": 2,
    "name": "pro",
    "display_name": "PRO",
    "price": "3500.00",
    ...
  }
}
```

**Lo que sucede internamente:**
1. Se valida que el plan exista y no sea gratuito
2. Se crea un registro en la tabla `payments` con estado `pending`
3. Se envía el plan a la API de MercadoPago para crear una preferencia
4. Se devuelve el link directo al checkout

---

### 3. Confirmar pago (después de pagar)
```bash
POST /api/payments/confirm
Content-Type: application/json
Authorization: Bearer {token}

{
  "payment_id": 42
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Pago confirmado!",
  "subscription": {
    "id": 15,
    "user_id": 1,
    "plan_id": 2,
    "status": "active",
    "starts_at": "2025-12-19T14:30:00.000000Z",
    "ends_at": "2026-01-19T14:30:00.000000Z",
    ...
  }
}
```

**Lo que sucede internamente:**
1. Se busca el pago pendiente
2. Se marca como `approved` y se asigna `paid_at`
3. Se cancela cualquier suscripción activa anterior
4. Se crea una nueva suscripción activa (válida por 30 días)
5. Se vincula la suscripción al pago

---

### 4. Obtener plan actual del usuario
```bash
GET /api/payments/current-plan
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "plan": {
    "id": 2,
    "name": "pro",
    "display_name": "PRO",
    "price": "3500.00",
    ...
  },
  "subscription": {
    "id": 15,
    "user_id": 1,
    "plan_id": 2,
    "status": "active",
    "starts_at": "2025-12-19T14:30:00.000000Z",
    "ends_at": "2026-01-19T14:30:00.000000Z",
    ...
  }
}
```

---

### 5. Historial de pagos
```bash
GET /api/payments/history
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "id": 42,
    "user_id": 1,
    "plan_id": 2,
    "amount": "3500.00",
    "currency": "ARS",
    "status": "approved",
    "payment_method": "credit_card",
    "paid_at": "2025-12-19T14:35:00.000000Z",
    "created_at": "2025-12-19T14:30:00.000000Z"
  }
]
```

---

### 6. Cancelar suscripción (downgrade a FREE)
```bash
POST /api/payments/downgrade
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "message": "Suscripción cancelada."
}
```

---

## 🖥️ Frontend (Vue)

### Flujo en el componente `Planes.vue`:

```javascript
// 1. Usuario hace clic en "Upgrade PRO"
selectPlan('pro')

  // 2. Se llama al backend para crear checkout
  → POST /api/payments/checkout { plan_id: 2 }
  
  // 3. Se guarda el payment_id en sessionStorage
  sessionStorage.setItem('payment_id', 42)
  
  // 4. Se redirige a MercadoPago
  window.location.href = 'https://www.mercadopago.com.ar/checkout/...'

// 5. Usuario paga en MercadoPago

// 6. MercadoPago redirige a ?status=approved
checkPaymentStatus()
  
  // 7. Se confirma el pago en el backend
  → POST /api/payments/confirm { payment_id: 42 }
  
  // 8. Se actualiza el plan actual
  → GET /api/payments/current-plan
  
  // ✅ El usuario ahora tiene el plan PRO activo
```

---

## 🔐 Variables de Entorno (.env)

```env
MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxx
MERCADOPAGO_ENV=test  # o 'production'
```

**Obtener credenciales:**
1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Copia tu Access Token (para requests a la API)
3. Copia tu Public Key (para el frontend, si la necesitas)

---

## 🧪 Pruebas

### En Modo Sandbox (TEST):

**Tarjetas de prueba:**
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Vencimiento: 11/25 (cualquier fecha futura)
CVV: 123
Titular: TEST
```

### En Producción:

Se usan tarjetas reales.

---

## ⚠️ Notas Importantes

1. **Sin webhooks**: No configuramos webhooks de MercadoPago. La confirmación es manual (usuario hace clic después de pagar).

2. **Desarrollo local**: En `local`, el SSl verification se desactiva automáticamente en las llamadas HTTP.

3. **Base de datos**: Asegúrate de haber ejecutado las migraciones:
   ```bash
   php artisan migrate
   php artisan db:seed --class=PlanSeeder
   ```

4. **URLs de retorno**: Se configuran en tiempo de ejecución:
   ```
   SUCCESS: /planes?status=approved
   FAILURE: /planes?status=failure
   PENDING: /planes?status=pending
   ```

5. **El pago NO se procesa automáticamente**. El usuario debe:
   - Hacer clic en "Upgrade"
   - Pagar en MercadoPago
   - Ser redirigido a `/planes?status=approved`
   - El frontend llama a `confirmPayment()` automáticamente

---

## 🚀 Flujo de Desarrollo

### Paso 1: Configurar credenciales
```bash
# En .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR_...
MERCADOPAGO_PUBLIC_KEY=APP_USR_...
MERCADOPAGO_ENV=test
```

### Paso 2: Crear planes en la BD
```bash
php artisan db:seed --class=PlanSeeder
```

### Paso 3: Probar el flujo
1. Ir a `/planes`
2. Hacer clic en "Upgrade PRO"
3. Usar tarjeta de prueba `4111 1111 1111 1111`
4. Completar el pago
5. Ser redirigido a `/planes?status=approved`
6. ✅ Verificar que el plan cambió a PRO

---

## 🐛 Solución de Problemas

### Error: "Error al crear el link de pago"
```
Probable causa: El access token no es válido
Solución: Verificar en .env que el token sea correcto
```

### Usuario no vuelve después de pagar
```
Probable causa: Las back_urls no están configuradas correctamente
Solución: Verificar que config('app.url') sea correcto
```

### El pago se procesa pero la suscripción no se crea
```
Probable causa: El frontend no llama a confirmPayment()
Solución: Verificar que el sessionStorage.getItem('payment_id') funcione
```

### Error 422 al crear checkout
```
Probable causa: Validación fallida (plan_id no existe)
Solución: Verificar que el plan_id sea válido
```

---

## 📊 Estados del Pago

| Estado | Significado | Acción |
|--------|------------|--------|
| `pending` | Creado pero no procesado | Esperar confirmación |
| `approved` | Pago aceptado | Crear suscripción activa |
| `rejected` | Pago rechazado | Mostrar error al usuario |
| `cancelled` | Usuario canceló | Mantener plan anterior |

---

## 💾 Tablas de Base de Datos

### Plans
```
id, name, display_name, price, currency, 
appointments_limit, professionals_limit, 
email_reminders, whatsapp_enabled, public_page, 
priority_support, advanced_reports, is_active, sort_order
```

### Payments
```
id, user_id, subscription_id, plan_id, 
amount, currency, status, mp_payment_id, mp_preference_id,
payment_method, mp_response, paid_at, created_at, updated_at
```

### Subscriptions
```
id, user_id, plan_id, status, starts_at, ends_at, 
cancelled_at, mp_subscription_id, created_at, updated_at
```

---

¡Listo! Tu integración de MercadoPago es ahora **simple, rápida y sin dependencias complejas**. 🎉
