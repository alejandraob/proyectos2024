<x-mail::message>
# Tu turno fue cancelado

Hola {{ $cliente->nombre }},

Lamentamos informarte que tu turno en **{{ $negocio->nombre_negocio }}** ha sido cancelado.

## Detalles del turno cancelado

**Fecha:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('d/m/Y') }}
**Hora:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->fecha_fin)->format('H:i') }}
@if($appointment->motivo)
**Motivo:** {{ $appointment->motivo }}
@endif

---

Si querés reprogramar tu turno, podés hacerlo desde nuestra página de reservas:

<x-mail::button :url="config('app.url') . '/reservar/' . $negocio->slug">
Reservar nuevo turno
</x-mail::button>

Disculpá las molestias,<br>
{{ $negocio->nombre_negocio }}
</x-mail::message>
