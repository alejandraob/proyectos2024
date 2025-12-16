<x-mail::message>
# Recordatorio de tu turno

Hola {{ $cliente->nombre }}!

Te recordamos que **mañana** tenés un turno en **{{ $negocio->nombre_negocio }}**.

## Detalles del turno

**Fecha:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('d/m/Y') }}
**Hora:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->fecha_fin)->format('H:i') }}
@if($servicio)
**Servicio:** {{ $servicio->nombre }}
@elseif($appointment->motivo)
**Motivo:** {{ $appointment->motivo }}
@endif

@if($negocio->direccion)
## Dirección
{{ $negocio->direccion }}
@endif

---

Si no podés asistir, por favor avisanos con anticipación contactando directamente a {{ $negocio->nombre_negocio }}.

Te esperamos!<br>
{{ $negocio->nombre_negocio }}
</x-mail::message>
