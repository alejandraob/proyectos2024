<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

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

        // En desarrollo local (Windows), deshabilitar verificacion SSL si hay problemas
        if (config('app.env') === 'local') {
            $options['verify'] = false;
        }

        $this->client = new Client($options);
    }

    /**
     * Crear una preferencia de pago (Checkout Pro)
     */
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

    /**
     * Crear preferencia para suscripcion a un plan
     */
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

        // Solo agregar back_urls y auto_return en produccion (MP no acepta localhost)
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

    /**
     * Obtener informacion de un pago
     */
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

    /**
     * Obtener informacion de una preferencia
     */
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

    /**
     * Buscar pagos por referencia externa
     */
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
