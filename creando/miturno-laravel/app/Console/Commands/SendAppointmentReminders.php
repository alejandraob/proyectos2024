<?php

namespace App\Console\Commands;

use App\Mail\RecordatorioTurnoMail;
use App\Models\Appointment;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Comando para enviar recordatorios de turnos (24h antes)
 *
 * Uso:
 *   php artisan turnos:enviar-recordatorios
 *
 * Para programar, agregar al Scheduler (app/Console/Kernel.php):
 *   $schedule->command('turnos:enviar-recordatorios')->dailyAt('09:00');
 */
class SendAppointmentReminders extends Command
{
    protected $signature = 'turnos:enviar-recordatorios';

    protected $description = 'Envía recordatorios por email y WhatsApp a clientes con turnos para mañana';

    public function handle()
    {
        $this->info('Iniciando envío de recordatorios...');

        // Buscar turnos para mañana (entre las 00:00 y 23:59 de mañana)
        $mananaInicio = Carbon::tomorrow()->startOfDay();
        $mananaFin = Carbon::tomorrow()->endOfDay();

        // Turnos para recordatorios por email
        $appointmentsEmail = Appointment::with(['client', 'business.setting', 'service'])
            ->whereBetween('fecha_inicio', [$mananaInicio, $mananaFin])
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->whereHas('client', function ($query) {
                $query->whereNotNull('email');
            })
            ->whereHas('business.setting', function ($query) {
                $query->where('notificaciones_email', true);
            })
            ->get();

        // Turnos para recordatorios por WhatsApp
        $appointmentsWhatsApp = Appointment::with(['client', 'business.setting', 'service'])
            ->whereBetween('fecha_inicio', [$mananaInicio, $mananaFin])
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->whereHas('client', function ($query) {
                $query->whereNotNull('telefono');
            })
            ->whereHas('business.setting', function ($query) {
                $query->where('notificaciones_whatsapp', true);
            })
            ->get();

        $emailEnviados = 0;
        $whatsappEnviados = 0;
        $errores = 0;

        // Enviar emails
        $this->info('Enviando emails...');
        foreach ($appointmentsEmail as $appointment) {
            try {
                $clientEmail = $appointment->client->email;

                if (!$clientEmail) {
                    continue;
                }

                Mail::to($clientEmail)->send(new RecordatorioTurnoMail($appointment));

                $emailEnviados++;
                $this->line("  ✓ Email enviado a {$clientEmail}");

            } catch (\Exception $e) {
                $errores++;
                Log::error('Error enviando recordatorio email', [
                    'appointment_id' => $appointment->id,
                    'client_email' => $appointment->client->email ?? 'N/A',
                    'error' => $e->getMessage(),
                ]);
                $this->error("  ✗ Error email a {$appointment->client->email}: {$e->getMessage()}");
            }
        }

        // Enviar WhatsApp
        $this->newLine();
        $this->info('Enviando WhatsApp...');
        $whatsapp = new WhatsAppService();

        foreach ($appointmentsWhatsApp as $appointment) {
            try {
                $clientPhone = $appointment->client->telefono;

                if (!$clientPhone) {
                    continue;
                }

                $sent = $whatsapp->sendReminder($appointment);

                if ($sent) {
                    $whatsappEnviados++;
                    $this->line("  ✓ WhatsApp enviado a {$clientPhone}");
                }

            } catch (\Exception $e) {
                $errores++;
                Log::error('Error enviando recordatorio WhatsApp', [
                    'appointment_id' => $appointment->id,
                    'client_phone' => $appointment->client->telefono ?? 'N/A',
                    'error' => $e->getMessage(),
                ]);
                $this->error("  ✗ Error WhatsApp a {$appointment->client->telefono}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("Proceso completado:");
        $this->info("  - Emails enviados: {$emailEnviados}");
        $this->info("  - WhatsApp enviados: {$whatsappEnviados}");
        if ($errores > 0) {
            $this->warn("  - Errores: {$errores}");
        }

        return Command::SUCCESS;
    }
}
