<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class WhatsAppService
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.auth_token');
        $this->from = 'whatsapp:' . config('services.twilio.whatsapp_from');

        if ($sid && $token) {
            // En desarrollo (Windows), desactivar verificación SSL
            $httpClient = null;
            if (app()->environment('local')) {
                $httpClient = new \Twilio\Http\CurlClient([
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => false,
                ]);
            }
            $this->client = new Client($sid, $token, null, null, $httpClient);
        }
    }

    /**
     * Enviar mensaje de WhatsApp
     */
    public function sendMessage(string $to, string $message): bool
    {
        if (!$this->client) {
            Log::warning('WhatsApp: Cliente Twilio no configurado');
            return false;
        }

        try {
            // Formatear número (debe incluir código de país)
            $toFormatted = $this->formatPhoneNumber($to);

            $this->client->messages->create(
                'whatsapp:' . $toFormatted,
                [
                    'from' => $this->from,
                    'body' => $message,
                ]
            );

            Log::info('WhatsApp enviado', ['to' => $toFormatted]);
            return true;

        } catch (\Exception $e) {
            Log::error('Error enviando WhatsApp', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Notificar nuevo turno al profesional
     */
    public function notifyNewAppointment(Appointment $appointment, string $phoneNumber): bool
    {
        $cliente = $appointment->client;
        $servicio = $appointment->service;
        $fecha = Carbon::parse($appointment->fecha_inicio);

        $mensaje = "📅 *Nuevo turno reservado*\n\n"
            . "👤 Cliente: {$cliente->nombre}\n"
            . "📱 Tel: {$cliente->telefono}\n"
            . "📆 Fecha: {$fecha->format('d/m/Y')}\n"
            . "🕐 Hora: {$fecha->format('H:i')}\n";

        if ($servicio) {
            $mensaje .= "💇 Servicio: {$servicio->nombre}\n";
        }

        if ($appointment->motivo) {
            $mensaje .= "📝 Motivo: {$appointment->motivo}\n";
        }

        return $this->sendMessage($phoneNumber, $mensaje);
    }

    /**
     * Notificar confirmación de turno al cliente
     */
    public function notifyAppointmentConfirmed(Appointment $appointment): bool
    {
        $cliente = $appointment->client;
        $negocio = $appointment->business;
        $servicio = $appointment->service;
        $fecha = Carbon::parse($appointment->fecha_inicio);

        if (!$cliente->telefono) {
            return false;
        }

        $mensaje = "✅ *Tu turno fue confirmado*\n\n"
            . "📍 {$negocio->nombre_negocio}\n"
            . "📆 Fecha: {$fecha->format('d/m/Y')}\n"
            . "🕐 Hora: {$fecha->format('H:i')}\n";

        if ($servicio) {
            $mensaje .= "💇 Servicio: {$servicio->nombre}\n";
        }

        if ($negocio->direccion) {
            $mensaje .= "📌 Dirección: {$negocio->direccion}\n";
        }

        $mensaje .= "\n¡Te esperamos!";

        return $this->sendMessage($cliente->telefono, $mensaje);
    }

    /**
     * Notificar cancelación de turno al cliente
     */
    public function notifyAppointmentCancelled(Appointment $appointment): bool
    {
        $cliente = $appointment->client;
        $negocio = $appointment->business;
        $fecha = Carbon::parse($appointment->fecha_inicio);

        if (!$cliente->telefono) {
            return false;
        }

        $mensaje = "❌ *Turno cancelado*\n\n"
            . "Tu turno en {$negocio->nombre_negocio} para el "
            . "{$fecha->format('d/m/Y')} a las {$fecha->format('H:i')} "
            . "ha sido cancelado.\n\n"
            . "Si necesitás reprogramar, ingresá a nuestro sitio de reservas.";

        return $this->sendMessage($cliente->telefono, $mensaje);
    }

    /**
     * Enviar recordatorio de turno (24h antes)
     */
    public function sendReminder(Appointment $appointment): bool
    {
        $cliente = $appointment->client;
        $negocio = $appointment->business;
        $servicio = $appointment->service;
        $fecha = Carbon::parse($appointment->fecha_inicio);

        if (!$cliente->telefono) {
            return false;
        }

        $mensaje = "🔔 *Recordatorio de turno*\n\n"
            . "Hola {$cliente->nombre}!\n\n"
            . "Te recordamos que *mañana* tenés turno en "
            . "*{$negocio->nombre_negocio}*\n\n"
            . "📆 Fecha: {$fecha->format('d/m/Y')}\n"
            . "🕐 Hora: {$fecha->format('H:i')}\n";

        if ($servicio) {
            $mensaje .= "💇 Servicio: {$servicio->nombre}\n";
        }

        if ($negocio->direccion) {
            $mensaje .= "📌 Dirección: {$negocio->direccion}\n";
        }

        $mensaje .= "\n¡Te esperamos!";

        return $this->sendMessage($cliente->telefono, $mensaje);
    }

    /**
     * Formatear número de teléfono para Argentina
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Eliminar espacios y caracteres no numéricos excepto +
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Si ya tiene código de país, retornar
        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        // Si empieza con 54, agregar +
        if (str_starts_with($phone, '54')) {
            return '+' . $phone;
        }

        // Si es número argentino sin código de país
        // Asumir que es Argentina (+54) y agregar 9 para móvil
        if (str_starts_with($phone, '11') || str_starts_with($phone, '15')) {
            // Remover el 15 si existe y agregar formato correcto
            $phone = preg_replace('/^15/', '', $phone);
            return '+549' . $phone;
        }

        // Por defecto, agregar +549 (Argentina móvil)
        return '+549' . $phone;
    }
}
