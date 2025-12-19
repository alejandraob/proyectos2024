# 🧪 Guía de Pruebas - MercadoPago Simplificado

## Ambiente de Pruebas

### Requisitos Previos
- ✅ Backend Laravel corriendo en `http://localhost:8000`
- ✅ Frontend Vue corriendo en `http://localhost:3000`  
- ✅ `.env` con credenciales de MercadoPago (modo SANDBOX)
- ✅ BD con migraciones ejecutadas
- ✅ PlanSeeder ejecutado

---

## 🚀 Test 1: Obtener Planes

### Endpoint
```bash
GET /api/plans
```

### cURL
```bash
curl -X GET http://localhost:8000/api/plans
```

### Postman
```
Method: GET
URL: http://localhost:8000/api/plans
```

### Respuesta Esperada (200 OK)
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
    "advanced_reports": false,
    "is_active": true,
    "sort_order": 1,
    "created_at": "2025-12-19T...",
    "updated_at": "2025-12-19T..."
  },
  {
    "id": 2,
    "name": "pro",
    "display_name": "PRO",
    "price": "3500.00",
    ...
  },
  {
    "id": 3,
    "name": "premium",
    "display_name": "PREMIUM",
    "price": "7000.00",
    ...
  }
]
```

✅ **PASS** si ves 3 planes  
❌ **FAIL** si ves error 500

---

## 🚀 Test 2: Obtener Plan Actual del Usuario

### Requisito
- Usuario autenticado (tienes token)

### Endpoint
```bash
GET /api/payments/current-plan
```

### cURL
```bash
curl -X GET http://localhost:8000/api/payments/current-plan \
  -H "Authorization: Bearer {TU_TOKEN}"
```

### Respuesta Esperada (200 OK)
```json
{
  "plan": {
    "id": 1,
    "name": "free",
    "display_name": "FREE",
    "price": "0.00",
    ...
  },
  "subscription": null
}
```

✅ **PASS** si ves `plan.name: "free"` y `subscription: null`  
❌ **FAIL** si ves error 401 (token inválido) o 500

---

## 🚀 Test 3: Crear Checkout (Lo Más Importante)

### Requisito
- Usuario autenticado
- Plan PRO existe (id: 2)

### Endpoint
```bash
POST /api/payments/checkout
```

### cURL
```bash
curl -X POST http://localhost:8000/api/payments/checkout \
  -H "Authorization: Bearer {TU_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 2
  }'
```

### Postman
```
Method: POST
URL: http://localhost:8000/api/payments/checkout
Headers:
  - Authorization: Bearer {TU_TOKEN}
  - Content-Type: application/json
Body (raw JSON):
{
  "plan_id": 2
}
```

### Respuesta Esperada (200 OK)
```json
{
  "payment_link": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890",
  "payment_id": 42,
  "plan": {
    "id": 2,
    "name": "pro",
    "display_name": "PRO",
    "price": "3500.00",
    "currency": "ARS",
    ...
  }
}
```

### Verificaciones
- ✅ `payment_link` empieza con `https://www.mercadopago.com.ar/`
- ✅ `payment_id` es un número > 0
- ✅ `plan.name` es "pro"
- ✅ `plan.price` es "3500.00"

### En la BD
```sql
SELECT * FROM payments WHERE id = 42;
-- Debe mostrar:
-- id: 42
-- user_id: {tu_user_id}
-- plan_id: 2
-- amount: 3500.00
-- currency: ARS
-- status: pending
-- mp_preference_id: 1234567890 (el que vino de MP)
-- paid_at: NULL (aún no se pagó)
```

✅ **PASS** si todo es como se describe  
❌ **FAIL** si ves error 400 (plan inválido) o 500

---

## 🚀 Test 4: Ir al Link de Pago

### Procedimiento Manual (CLI no suficiente)

1. Obtén el `payment_link` del Test 3
2. Abre en navegador: 
   ```
   https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890
   ```
3. Deberías ver la página de MercadoPago checkout

### Señales de Éxito
- ✅ Ves logo de MercadoPago
- ✅ Ves el plan "PRO"
- ✅ Ves el precio "$3.500"
- ✅ Ves opciones de pago (tarjeta, efectivo, etc.)

### Señales de Error
- ❌ "Error 500" en la página
- ❌ "Preferencia no encontrada"
- ❌ "No tienes permiso"

---

## 🚀 Test 5: Pagar con Tarjeta de Prueba

### Tarjeta de Prueba Válida
```
Número:       4111 1111 1111 1111
Vencimiento:  11/25 (mes/año)
CVV:          123
Titular:      TEST
```

### Procedimiento
1. En el checkout de MP, selecciona "Tarjeta de crédito"
2. Ingresa los datos de la tarjeta
3. Haz clic en "Pagar"

### Respuesta Esperada
- ✅ "Tu pago está siendo procesado"
- ✅ Se redirige a: `http://localhost:3000/planes?status=approved`

### En la BD (después de esto)
```sql
SELECT * FROM payments WHERE id = 42;
-- Debe mostrar:
-- status: approved ✨
-- paid_at: 2025-12-19 14:35:00 ✨
-- mp_payment_id: 1234567890 (del webhook o confirmación)
```

✅ **PASS** si ves `status: approved`  
❌ **FAIL** si se queda en `status: pending`

---

## 🚀 Test 6: Confirmar Pago (Automático en UI)

### ¿Qué sucede automáticamente?

Cuando el usuario vuelve a `/planes?status=approved`:

```javascript
// En Planes.vue, checkPaymentStatus() ejecuta:
if (status === 'approved' && paymentId) {
  await paymentsService.confirmPayment(paymentId)
  // POST /api/payments/confirm
}
```

### O Manualmente con cURL
```bash
curl -X POST http://localhost:8000/api/payments/confirm \
  -H "Authorization: Bearer {TU_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": 42
  }'
```

### Respuesta Esperada (200 OK)
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
    "created_at": "2025-12-19T14:30:00.000000Z",
    "updated_at": "2025-12-19T14:30:00.000000Z"
  }
}
```

### En la BD
```sql
-- Payment debe tener status: approved
SELECT * FROM payments WHERE id = 42;

-- Debe existir una nueva Subscription activa
SELECT * FROM subscriptions WHERE user_id = 1 AND status = 'active';
-- id: 15
-- plan_id: 2
-- status: active
-- ends_at: 2026-01-19

-- La suscripción anterior (si existía) debe estar cancelled
SELECT * FROM subscriptions WHERE user_id = 1 AND status = 'cancelled';
-- status: cancelled
-- cancelled_at: 2025-12-19
```

✅ **PASS** si ves `subscription.status: "active"`  
❌ **FAIL** si sigue siendo `pending`

---

## 🚀 Test 7: Verificar que el Plan Cambió

### Endpoint
```bash
GET /api/payments/current-plan
```

### cURL
```bash
curl -X GET http://localhost:8000/api/payments/current-plan \
  -H "Authorization: Bearer {TU_TOKEN}"
```

### Respuesta Esperada (ANTES del pago)
```json
{
  "plan": {
    "id": 1,
    "name": "free",
    ...
  },
  "subscription": null
}
```

### Respuesta Esperada (DESPUÉS del pago)
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
    "starts_at": "2025-12-19T14:30:00Z",
    "ends_at": "2026-01-19T14:30:00Z",
    ...
  }
}
```

✅ **PASS** si `plan.name` cambió a "pro"  
❌ **FAIL** si sigue siendo "free"

---

## 🚀 Test 8: Ver Historial de Pagos

### Endpoint
```bash
GET /api/payments/history
```

### cURL
```bash
curl -X GET http://localhost:8000/api/payments/history \
  -H "Authorization: Bearer {TU_TOKEN}"
```

### Respuesta Esperada
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
    "mp_payment_id": "1234567890",
    "mp_preference_id": "1234567890",
    "paid_at": "2025-12-19T14:35:00.000000Z",
    "created_at": "2025-12-19T14:30:00.000000Z",
    "updated_at": "2025-12-19T14:35:00.000000Z",
    "plan": {
      "id": 2,
      "name": "pro",
      "display_name": "PRO",
      "price": "3500.00",
      ...
    }
  }
]
```

✅ **PASS** si ves el pago con `status: "approved"`  
❌ **FAIL** si el array está vacío o el status es "pending"

---

## 🚀 Test 9: Cancelar Suscripción (Downgrade)

### Endpoint
```bash
POST /api/payments/downgrade
```

### cURL
```bash
curl -X POST http://localhost:8000/api/payments/downgrade \
  -H "Authorization: Bearer {TU_TOKEN}"
```

### Respuesta Esperada (200 OK)
```json
{
  "message": "Suscripción cancelada."
}
```

### En la BD
```sql
-- La suscripción debe estar cancelled
SELECT * FROM subscriptions WHERE user_id = 1 AND status = 'cancelled';
-- status: cancelled
-- cancelled_at: 2025-12-19 14:45:00
```

### Verificar que volvió a FREE
```bash
curl -X GET http://localhost:8000/api/payments/current-plan \
  -H "Authorization: Bearer {TU_TOKEN}"

# Debe devolver:
# {
#   "plan": { "id": 1, "name": "free", ... },
#   "subscription": null
# }
```

✅ **PASS** si `plan.name` es "free" nuevamente  
❌ **FAIL** si sigue siendo "pro"

---

## 🎯 Resumen de Tests

```
Test 1: Obtener planes                     ✅
Test 2: Plan actual (FREE)                 ✅
Test 3: Crear checkout                     ✅
Test 4: Ir al link de pago                 ✅
Test 5: Pagar con tarjeta                  ✅
Test 6: Confirmar pago                     ✅
Test 7: Verificar plan cambió (PRO)        ✅
Test 8: Ver historial                      ✅
Test 9: Cancelar suscripción               ✅

TODOS VERDE = LISTO PARA PRODUCCIÓN 🚀
```

---

## 🐛 Troubleshooting Rápido

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token inválido o expirado | Loguearse de nuevo |
| 404 Plan not found | plan_id no existe | Verificar ids en DB |
| 500 Server Error | Error en backend | Revisar logs: `php artisan logs` |
| "Error al crear link" | Access token inválido | Verificar .env |
| Usuario no redirige a MP | payment_link es null | Verificar respuesta de API MP |
| Pago NO se confirma | sessionStorage no guardó ID | Ver console del navegador |
| Suscripción no se crea | confirmPayment() falló | Verificar logs del backend |

---

## 📊 Checklist de Tests

Antes de subir a producción:

- [ ] Test 1: Planes obtenidos correctamente
- [ ] Test 2: Plan actual muestra FREE
- [ ] Test 3: Checkout devuelve link válido
- [ ] Test 4: Link abre checkout de MP
- [ ] Test 5: Tarjeta de prueba procesa el pago
- [ ] Test 6: confirmPayment() responde OK
- [ ] Test 7: Plan cambió a PRO
- [ ] Test 8: Historial muestra el pago
- [ ] Test 9: Downgrade vuelve a FREE
- [ ] Probado en navegador completo (UI)
- [ ] Probado en móvil (responsive)
- [ ] Verificado en base de datos
- [ ] Sin errores en console
- [ ] Sin errores en logs Laravel

---

¡Que disfrutes testeando! 🎉
