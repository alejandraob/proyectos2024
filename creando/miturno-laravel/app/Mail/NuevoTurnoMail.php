<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email enviado al profesional cuando un cliente solicita un turno
 */
class NuevoTurnoMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nuevo turno solicitado - ' . $this->appointment->client->nombre,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.nuevo-turno',
            with: [
                'appointment' => $this->appointment,
                'cliente' => $this->appointment->client,
                'negocio' => $this->appointment->business,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
