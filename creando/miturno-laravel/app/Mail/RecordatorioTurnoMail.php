<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email de recordatorio enviado al cliente 24h antes del turno
 */
class RecordatorioTurnoMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function envelope(): Envelope
    {
        $negocio = $this->appointment->business->nombre_negocio;
        return new Envelope(
            subject: "Recordatorio: Tu turno en {$negocio} es mañana",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.recordatorio-turno',
            with: [
                'appointment' => $this->appointment,
                'cliente' => $this->appointment->client,
                'negocio' => $this->appointment->business,
                'servicio' => $this->appointment->service,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
