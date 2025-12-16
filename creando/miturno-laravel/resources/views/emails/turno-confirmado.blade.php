<x-mail::message>
# Tu turno fue confirmado

Hola {{ $cliente->nombre }}!

Tu turno en **{{ $negocio->nombre_negocio }}** ha sido confirmado.

## Detalles del turno

**Fecha:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('d/m/Y') }}
**Hora:** {{ \Carbon\Carbon::parse($appointment->fecha_inicio)->format('H:i') }} - {{ \Carbon\Carbon::parse($appointment->fecha_fin)->format('H:i') }}
@if($appointment->motivo)
**Motivo:** {{ $appointment->motivo }}
@endif

@if($negocio->direccion)
## Dirección
{{ $negocio->direccion }}
@endif

---

Si necesitás cancelar o reprogramar tu turno, por favor contactate directamente con {{ $negocio->nombre_negocio }}.

Gracias,<br>
{{ $negocio->nombre_negocio }}
</x-mail::message>
