<?php
namespace App\Http\Controllers;
use App\Models\Plan;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    /**
     * Obtener planes disponibles
     */
    public function plans()
    {
        return response()->json(Plan::active()->orderBy('sort_order')->get());
    }

    /**
     * Obtener plan actual del usuario
     */
    public function currentPlan(Request $request)
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)->active()->with('plan')->first();

        if (!$subscription) {
            return response()->json([
                'plan' => Plan::where('name', 'free')->first(),
                'subscription' => null
            ]);
        }

        return response()->json([
            'plan' => $subscription->plan,
            'subscription' => $subscription
        ]);
    }

    /**
     * Generar link de pago simple de MercadoPago
     * Sin preferencias, solo un link directo
     */
    public function createCheckout(Request $request)
    {
        $request->validate(['plan_id' => 'required|exists:plans,id']);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);

        if ($plan->isFree()) {
            return response()->json(['error' => 'El plan gratuito no requiere pago'], 400);
        }

        // Crear registro de pago pendiente
        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'currency' => $plan->currency,
            'status' => 'pending',
        ]);

        // Generar link de pago simple
        $paymentLink = $this->generatePaymentLink($plan, $user, $payment);

        return response()->json([
            'payment_link' => $paymentLink,
            'payment_id' => $payment->id,
            'plan' => $plan,
        ]);
    }

    /**
     * Generar link de pago directo para MercadoPago
     * Formato: https://mpago.to/{LINK_ID} (simplísimo)
     *
     * O si prefieres más control, usa esta URL:
     * https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id={PREFERENCE_ID}
     */
    private function generatePaymentLink($plan, $user, $payment)
    {
        // Generar una preferencia simple con MercadoPago
        // y devolver el link directo al checkout
        $prefId = $this->createSimplePreference($plan, $user, $payment);

        if (!$prefId) {
            return null;
        }

        return 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=' . $prefId;
    }

    /**
     * Crear una preferencia MÍN básica con Guzzle directo
     */
    private function createSimplePreference($plan, $user, $payment)
    {
        $accessToken = config('services.mercadopago.access_token');

        // DEBUG: Verificar que tenemos el token
        if (!$accessToken) {
            Log::error('MercadoPago Access Token es NULL. Verifica .env');
            return null;
        }

        $data = [
            'items' => [
                [
                    'id' => "plan_{$plan->id}",
                    'title' => "Suscripción {$plan->display_name}",
                    'quantity' => 1,
                    'unit_price' => (float)$plan->price,
                    'currency_id' => 'ARS',
                ]
            ],
            'payer' => [
                'email' => $user->email,
            ],
            'external_reference' => json_encode([
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]),
        ];

        // Solo agregar back_urls y auto_return en producción
        // En desarrollo, MercadoPago sandbox no acepta localhost
        if (config('app.env') === 'production') {
            $data['back_urls'] = [
                'success' => config('app.url') . '/planes?status=approved',
                'failure' => config('app.url') . '/planes?status=failure',
                'pending' => config('app.url') . '/planes?status=pending',
            ];
            $data['auto_return'] = 'approved';
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying() // Desactivar verificación SSL para desarrollo
            ->post('https://api.mercadopago.com/checkout/preferences', $data);

            Log::info('MP API Response Status: ' . $response->status());
            Log::info('MP API Response Body: ' . $response->body());

            if ($response->successful()) {
                $responseData = $response->json();
                if (isset($responseData['id'])) {
                    return $responseData['id'];
                } else {
                    Log::error('MP Response sin ID. Response: ', $responseData);
                    return null;
                }
            } else {
                Log::error('MP API Error. Status: ' . $response->status() . '. Body: ' . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Error creating MP preference: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
        }

        return null;
    }

    /**
     * Webhook de MercadoPago (opcional - solo si quieres confirmación automática)
     */
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

    /**
     * Confirmar pago (manual - usuario hace clic después de pagar)
     */
    public function confirmPayment(Request $request)
    {
        $request->validate(['payment_id' => 'required']);

        $payment = Payment::findOrFail($request->payment_id);

        // Aquí el usuario confirma que pagó
        // En producción, verificarías con MercadoPago
        // Por ahora, confiamos en que el usuario llegó aquí después de pagar

        if ($payment->status === 'pending') {
            $payment->update(['status' => 'approved', 'paid_at' => now()]);

            // Cancelar suscripción anterior si existe
            Subscription::where('user_id', $payment->user_id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            // Crear nueva suscripción
            $subscription = Subscription::create([
                'user_id' => $payment->user_id,
                'plan_id' => $payment->plan_id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
            ]);

            $payment->subscription_id = $subscription->id;
            $payment->save();

            return response()->json([
                'success' => true,
                'message' => 'Pago confirmado!',
                'subscription' => $subscription->load('plan')
            ]);
        }

        return response()->json(['error' => 'Pago ya procesado'], 400);
    }

    /**
     * Verificar estado del pago
     */
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

    /**
     * Historial de pagos del usuario
     */
    public function history(Request $request)
    {
        return response()->json(
            Payment::where('user_id', $request->user()->id)
                ->with('plan')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    /**
     * Cancelar suscripción y volver a plan gratuito
     */
    public function downgradeToFree(Request $request)
    {
        Subscription::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

        return response()->json(['message' => 'Suscripción cancelada.']);
    }

    /**
     * =============================================
     * SIMULACIÓN DE PAGOS (solo desarrollo)
     * =============================================
     * Permite cambiar de plan sin pasar por MercadoPago
     * para probar las restricciones por plan
     */
    public function simulateUpgrade(Request $request)
    {
        // Solo permitir en desarrollo
        if (config('app.env') === 'production') {
            return response()->json(['error' => 'No disponible en producción'], 403);
        }

        $request->validate([
            'plan_name' => 'required|in:free,pro,premium'
        ]);

        $user = $request->user();
        $planName = $request->plan_name;

        // Cancelar suscripción activa actual
        Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

        // Si es FREE, no crear suscripción (el sistema asume FREE por defecto)
        if ($planName === 'free') {
            return response()->json([
                'success' => true,
                'message' => 'Cambiado a plan FREE',
                'plan' => Plan::where('name', 'free')->first()
            ]);
        }

        // Buscar el plan
        $plan = Plan::where('name', $planName)->first();

        if (!$plan) {
            return response()->json(['error' => 'Plan no encontrado'], 404);
        }

        // Crear suscripción simulada
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        // Crear pago simulado
        Payment::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'currency' => 'ARS',
            'status' => 'approved',
            'payment_method' => 'simulated',
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Cambiado a plan {$plan->display_name}",
            'plan' => $plan,
            'subscription' => $subscription
        ]);
    }
}
