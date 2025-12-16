<x-mail::message>
# Nuevo turno solicitado

Hola! Tenés un nuevo turno pendiente de confirmar.

**Cliente:** {{ $cliente->nombre }}
@if($cliente->telefono)
**Teléfono:** {{ $cliente->telefono }}
@endif
@if($cliente->email)
**Email:** {{ $cliente->email }}
@endif

**Fecha:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('d/m/Y') }}
**Hora:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->fecha_fin)->format('H:i') }}
@if($appointment->motivo)
**Motivo:** {{ $appointment->motivo }}
@endif

<x-mail::button :url="config('app.url') . ':8000/agenda'">
Ver en la Agenda
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>
