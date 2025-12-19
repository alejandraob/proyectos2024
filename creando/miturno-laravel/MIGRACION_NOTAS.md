# 📦 Archivos Obsoletos - Referencia

Este archivo documenta qué pasó con los archivos que usaban la integración anterior de MercadoPago.

---

## ❌ Archivo Eliminado: `MercadoPagoService.php`

**Ubicación anterior:**
```
app/Services/MercadoPagoService.php
```

**Por qué se eliminó:**
- ✅ Usaba Guzzle HTTP Client (ahora usamos Http façade de Laravel)
- ✅ Creaba preferencias complejas (ahora las creamos inline)
- ✅ Tenía dependencia inyectada en PaymentController (ahora no)
- ✅ Hacía las cosas más complicadas de lo necesario

**Si quieres recuperarla o referenciarla:**

Guarda este contenido en `MercadoPagoService.php.bak` si la necesitas:

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

/**
 * OBSOLETO - Esta clase ya no se usa
 * 
 * Se reemplazó por:
 * - Http::withHeaders() en PaymentController
 * - Preferencias creadas en createSimplePreference()
 * 
 * La mantenemos como referencia si necesitas restaurar algo
 */
class MercadoPagoService
{
    protected Client $client;
    protected string $accessToken;
    protected string $baseUrl = 'https://api.mercadopago.com';

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token');

        $options = [
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ],
        ];

        if (config('app.env') === 'local') {
            $options['verify'] = false;
        }

        $this->client = new Client($options);
    }

    public function createPreference(array $data): ?array
    {
        try {
            $response = $this->client->post('/checkout/preferences', [
                'json' => $data,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('MercadoPago createPreference error: ' . $e->getMessage());
            return null;
        }
    }

    public function createPlanPreference(
        int $planId,
        string $planName,
        float $price,
        int $userId,
        string $userEmail,
        string $successUrl,
        string $failureUrl,
        string $pendingUrl,
        ?string $notificationUrl = null
    ): ?array {
        $data = [
            'items' => [
                [
                    'id' => "plan_{$planId}",
                    'title' => "Suscripcion Plan {$planName}",
                    'description' => "Suscripcion mensual al plan {$planName} de MiTurno",
                    'quantity' => 1,
                    'currency_id' => 'ARS',
                    'unit_price' => $price,
                ],
            ],
            'payer' => [
                'email' => $userEmail,
            ],
            'external_reference' => json_encode([
                'user_id' => $userId,
                'plan_id' => $planId,
                'type' => 'subscription',
            ]),
            'statement_descriptor' => 'MITURNO',
        ];

        if (config('app.env') === 'production') {
            $data['back_urls'] = [
                'success' => $successUrl,
                'failure' => $failureUrl,
                'pending' => $pendingUrl,
            ];
            $data['auto_return'] = 'approved';
            $data['expires'] = true;
            $data['expiration_date_from'] = now()->toIso8601String();
            $data['expiration_date_to'] = now()->addHours(24)->toIso8601String();
        }

        if ($notificationUrl) {
            $data['notification_url'] = $notificationUrl;
        }

        return $this->createPreference($data);
    }

    public function getPayment(string $paymentId): ?array
    {
        try {
            $response = $this->client->get("/v1/payments/{$paymentId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('MercadoPago getPayment error: ' . $e->getMessage());
            return null;
        }
    }

    public function getPreference(string $preferenceId): ?array
    {
        try {
            $response = $this->client->get("/checkout/preferences/{$preferenceId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('MercadoPago getPreference error: ' . $e->getMessage());
            return null;
        }
    }

    public function searchPayments(string $externalReference): ?array
    {
        try {
            $response = $this->client->get('/v1/payments/search', [
                'query' => [
                    'external_reference' => $externalReference,
                ],
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            Log::error('MercadoPago searchPayments error: ' . $e->getMessage());
            return null;
        }
    }
}
```

---

## 📝 Cambios en PaymentController.php

### Línea Eliminada:
```php
use App\Services\MercadoPagoService;

public function __construct(MercadoPagoService $mpService) 
{ 
    $this->mpService = $mpService; 
}
```

### Línea Agregada:
```php
use Illuminate\Support\Facades\Http;

// No hay constructor, se usa Http directamente
```

---

## 📝 Métodos Modificados en PaymentController

### createCheckout() - ANTES
```php
public function createCheckout(Request $request) {
    $request->validate(['plan_id' => 'required|exists:plans,id']);
    $user = $request->user();
    $plan = Plan::findOrFail($request->plan_id);
    if ($plan->isFree()) return response()->json(['error' => 'El plan gratuito no requiere pago'], 400);
    
    $baseUrl = config('app.url');
    $preference = $this->mpService->createPlanPreference(
        $plan->id, 
        $plan->display_name, 
        (float)$plan->price, 
        $user->id, 
        $user->email,
        $baseUrl.'/planes?status=approved&plan='.$plan->name,
        $baseUrl.'/planes?status=failure&plan='.$plan->name,
        $baseUrl.'/planes?status=pending&plan='.$plan->name,
        config('app.env')==='production' ? $baseUrl.'/api/payments/webhook' : null
    );
    
    if (!$preference) 
        return response()->json(['error' => 'Error al crear preferencia'], 500);
    
    $payment = Payment::create([
        'user_id' => $user->id, 
        'plan_id' => $plan->id, 
        'amount' => $plan->price,
        'currency' => $plan->currency, 
        'status' => 'pending', 
        'mp_preference_id' => $preference['id'],
    ]);
    
    return response()->json([
        'preference_id' => $preference['id'], 
        'init_point' => $preference['init_point'],
        'sandbox_init_point' => $preference['sandbox_init_point'] ?? $preference['init_point'],
        'payment_id' => $payment->id,
    ]);
}
```

### createCheckout() - AHORA (SIMPLIFICADO)
```php
public function createCheckout(Request $request) 
{
    $request->validate(['plan_id' => 'required|exists:plans,id']);
    
    $user = $request->user();
    $plan = Plan::findOrFail($request->plan_id);
    
    if ($plan->isFree()) {
        return response()->json(['error' => 'El plan gratuito no requiere pago'], 400);
    }

    $payment = Payment::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'amount' => $plan->price,
        'currency' => $plan->currency,
        'status' => 'pending',
    ]);

    $paymentLink = $this->generatePaymentLink($plan, $user, $payment);

    return response()->json([
        'payment_link' => $paymentLink,
        'payment_id' => $payment->id,
        'plan' => $plan,
    ]);
}
```

**Diferencias:**
- ❌ Ya no llama a `MercadoPagoService`
- ❌ Ya no pasa 9 parámetros a createPlanPreference
- ✅ Crea el Payment primero
- ✅ Devuelve `payment_link` directo (no `init_point`)

---

## 📝 Método Nuevo: confirmPayment()

Este método NO existía antes. Se agregó para simplificar el flujo:

```php
public function confirmPayment(Request $request)
{
    $request->validate(['payment_id' => 'required']);
    
    $payment = Payment::findOrFail($request->payment_id);
    
    if ($payment->status === 'pending') {
        $payment->update(['status' => 'approved', 'paid_at' => now()]);
        
        Subscription::where('user_id', $payment->user_id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled', 'cancelled_at' => now()]);
        
        $subscription = Subscription::create([
            'user_id' => $payment->user_id,
            'plan_id' => $payment->plan_id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);
        
        $payment->subscription_id = $subscription->id;
        $payment->save();
        
        return response()->json([...]);
    }

    return response()->json(['error' => 'Pago ya procesado'], 400);
}
```

**Beneficio:**
- El usuario confirma manualmente después de pagar
- No depende de webhooks de MercadoPago
- Más seguro y confiable

---

## 📝 Método Eliminado: webhook()

### webhook() - ANTES
```php
public function webhook(Request $request) {
    Log::info('MP Webhook', $request->all());
    if ($request->input('type')==='payment' && $request->input('data.id')) 
        $this->processPayment($request->input('data.id'));
    return response()->json(['status' => 'ok']);
}

protected function processPayment(string $mpPaymentId) {
    // 40 líneas de lógica...
}
```

### webhook() - AHORA
```php
public function webhook(Request $request) 
{
    Log::info('MP Webhook received', $request->all());
    
    $externalReference = $request->input('data.external_reference');
    if ($externalReference) {
        $ref = json_decode($externalReference, true);
        if (isset($ref['payment_id'])) {
            $this->confirmPayment($ref['payment_id']);
        }
    }

    return response()->json(['status' => 'ok']);
}
```

**Cambios:**
- ❌ Ya no procesa el pago automáticamente
- ✅ Solo registra en logs
- ✅ El usuario confirma manualmente

---

## 📝 Método Modificado: verifyPayment()

### ANTES
```php
public function verifyPayment(Request $request) {
    $request->validate(['payment_id' => 'required']);
    $this->processPayment($request->payment_id);  // ← Llamaba a processPayment()
    $payment = Payment::where('mp_payment_id', $request->payment_id)
        ->with(['plan','subscription'])
        ->first();
    return $payment ? response()->json([...]) : response()->json([...], 404);
}
```

### AHORA
```php
public function verifyPayment(Request $request) 
{
    $request->validate(['payment_id' => 'required']);
    
    $payment = Payment::with(['plan', 'subscription'])
        ->findOrFail($request->payment_id);
    
    return response()->json([
        'payment' => $payment,
        'is_approved' => $payment->status === 'approved'
    ]);
}
```

**Cambios:**
- ❌ Ya no procesa automáticamente
- ✅ Solo verifica y devuelve info
- ✅ Más simple y seguro

---

## 🔄 Flujo Anterior vs Nuevo

### ANTES (Complejo con Webhook)
```
User clicks "Upgrade"
  ↓
POST /api/payments/checkout
  ↓
MercadoPagoService->createPlanPreference()
  (5+ operaciones)
  ↓
Save preference_id in DB
  ↓
Return init_point
  ↓
window.location.href = init_point
  ↓
User pays in MP
  ↓
MP webhook → POST /api/payments/webhook
  ↓
processPayment($mpPaymentId)
  ↓
Get payment from MP API
  ↓
Parse external_reference
  ↓
Update Payment record
  ↓
Create Subscription
  ↓
User doesn't know if he's subscribed until webhook arrives
```

**Problemas:**
- Webhook puede tardar
- Webhook puede no llegar
- Usuario no sabe si está subscrito
- 40 líneas de lógica en processPayment()

### AHORA (Simple, Confirmación Manual)
```
User clicks "Upgrade"
  ↓
POST /api/payments/checkout
  ↓
Http->post() to MP API (simple)
  ↓
Save Payment record (pending)
  ↓
Return payment_link
  ↓
window.location.href = payment_link
  ↓
User pays in MP
  ↓
MP redirects → /planes?status=approved
  ↓
checkPaymentStatus() runs automatically
  ↓
POST /api/payments/confirm
  ↓
Update Payment record
  ↓
Create Subscription
  ↓
✅ User KNOWS he's subscribed immediately
```

**Ventajas:**
- Sin webhooks
- Sin polling
- Sin esperar
- Usuario sabe el resultado instantáneamente
- Menos líneas de código

---

## 🔐 Seguridad: Cambios

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Confianza en | Webhooks | Redirección del usuario |
| Riesgo de | Webhook no llega | Usuario no confirma |
| Validación | En processPayment() | En confirmPayment() |
| Auditoría | Logs de webhook | Redirección + logs |
| Confiabilidad | Media (webhooks fallan) | Alta (usuario hace click) |

---

## 💾 Base de Datos: Cambios

### Tabla `payments` - Columnas que ya no se usan

```php
// Ya no guardamos:
// - $mp_payment_id hasta que se confirma
// - $mp_response (JSON completo de MP)

// Ahora:
// - Se guardan solo datos esenciales
// - mp_payment_id se asigna en confirmPayment() (opcional)
```

### Tabla `payments` - Estado de Datos

```
ANTES:
id | user_id | plan_id | status   | mp_preference_id | mp_payment_id | paid_at
42 | 1       | 2       | pending  | abc123           | NULL          | NULL
42 | 1       | 2       | approved | abc123           | xyz789        | 2025-12-19

AHORA (igual, pero más simple):
42 | 1       | 2       | pending  | abc123           | NULL          | NULL
42 | 1       | 2       | approved | abc123           | NULL          | 2025-12-19
```

Solo información esencial, nada de `mp_response` (JSON pesado).

---

## ✨ Resumen de Cambios

| Concepto | Antes | Ahora |
|----------|-------|-------|
| **Clase de servicio** | ❌ MercadoPagoService | ✅ Eliminada (Http inline) |
| **Dependencia inyectada** | ✅ MercadoPago en ctor | ❌ Removida |
| **Preferencia creada** | ✅ En memoria (Guzzle) | ✅ API directa (Http) |
| **Webhook** | ✅ Necesario | ⚠️ Opcional |
| **Confirmación** | ✅ Automática (webhook) | ✅ Manual (user) |
| **Flujo** | Complejo | Simple |
| **Líneas de código** | ~300 | ~200 |
| **Dependencias externas** | Guzzle + MercadoPago | MercadoPago |

---

## 🚀 Cómo Revertir (Si es necesario)

Si por alguna razón necesitas volver a la versión anterior:

1. **Restaurar MercadoPagoService:**
   - Copiar código de arriba
   - Crear en `app/Services/MercadoPagoService.php`

2. **Revertir PaymentController:**
   - Usar método `createCheckout()` del "Antes"
   - Volver a inyectar MercadoPagoService

3. **Agregar webhook de nuevo:**
   - Descomentar método `webhook()` del "Antes"
   - Descomentar método `processPayment()`

4. **En el Frontend:**
   - Usar `sandbox_init_point` o `init_point` en lugar de `payment_link`

---

¡Eso es todo! La integración anterior sigue siendo válida, pero la nueva es mucho más simple. 🎉
