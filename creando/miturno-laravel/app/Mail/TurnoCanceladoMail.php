<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email enviado al cliente cuando su turno es cancelado
 */
class TurnoCanceladoMail extends Mailable
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
            subject: "Tu turno en {$negocio} fue cancelado",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.turno-cancelado',
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
