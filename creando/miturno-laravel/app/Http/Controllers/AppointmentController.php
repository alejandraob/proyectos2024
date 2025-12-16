<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Business;
use App\Models\Client;
use App\Mail\NuevoTurnoMail;
use App\Mail\TurnoConfirmadoMail;
use App\Mail\TurnoCanceladoMail;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AppointmentController extends Controller
{
    /**
     * Listar turnos del negocio
     *
     * Query params opcionales:
     * - fecha: Filtrar por fecha específica (Y-m-d)
     * - desde: Fecha inicio del rango
     * - hasta: Fecha fin del rango
     * - estado: pendiente, confirmado, cancelado
     * - client_id: Filtrar por cliente específico
     */
    public function index(Request $request)
    {
        $query = $request->user()->business->appointments()->with(['client', 'service']);

        // Filtrar por fecha específica
        if ($request->has('fecha')) {
            $fecha = Carbon::parse($request->fecha);
            $query->whereDate('fecha_inicio', $fecha);
        }

        // Filtrar por rango de fechas
        if ($request->has('desde')) {
            $query->whereDate('fecha_inicio', '>=', $request->desde);
        }
        if ($request->has('hasta')) {
            $query->whereDate('fecha_inicio', '<=', $request->hasta);
        }

        // Filtrar por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtrar por cliente
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $appointments = $query->orderBy('fecha_inicio')->get();

        return response()->json($appointments);
    }

    /**
     * Crear un nuevo turno (desde el panel del profesional)
     *
     * Recibe: fecha_inicio, fecha_fin, motivo, client_id (opcional), nombre_cliente (opcional)
     * Si no existe el cliente, lo crea automáticamente
     */
    public function store(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'motivo' => 'nullable|string|max:255',
            'service_id' => 'nullable|integer|exists:services,id',
            'client_id' => 'nullable|integer',
            'nombre_cliente' => 'nullable|string|max:255',
            'telefono_cliente' => 'nullable|string|max:50',
        ]);

        $business = $request->user()->business;

        // Validar que el cliente pertenezca al negocio del usuario
        if ($request->client_id) {
            $clienteValido = $business->clients()->where('id', $request->client_id)->exists();
            if (!$clienteValido) {
                return response()->json([
                    'message' => 'El cliente no pertenece a tu negocio',
                ], 403);
            }
        }

        // Verificar que no haya conflicto de horarios
        $conflicto = $this->verificarConflicto(
            $business->id,
            $request->fecha_inicio,
            $request->fecha_fin
        );

        if ($conflicto) {
            return response()->json([
                'message' => 'Ya existe un turno en ese horario',
            ], 422);
        }

        // Si no viene client_id pero sí nombre_cliente, crear el cliente
        $clientId = $request->client_id;
        if (!$clientId && $request->nombre_cliente) {
            $client = Client::create([
                'business_id' => $business->id,
                'nombre' => $request->nombre_cliente,
                'telefono' => $request->telefono_cliente,
            ]);
            $clientId = $client->id;
        }

        // Crear el turno
        $appointment = Appointment::create([
            'business_id' => $business->id,
            'client_id' => $clientId,
            'service_id' => $request->service_id,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'motivo' => $request->motivo,
            'origen' => 'manual',
            'estado' => 'confirmado',
        ]);

        return response()->json([
            'message' => 'Turno creado correctamente',
            'appointment' => $appointment->load(['client', 'service']),
        ], 201);
    }

    /**
     * Crear turno desde la web pública (cliente final)
     *
     * Recibe: slug del negocio, fecha_inicio, fecha_fin, nombre, telefono, email, motivo
     * No requiere autenticación
     */
    public function storePublic(Request $request, $slug)
    {
        $request->validate([
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'motivo' => 'nullable|string|max:255',
            'service_id' => 'nullable|integer|exists:services,id',
        ]);

        // Buscar el negocio por slug
        $business = Business::where('slug', $slug)->firstOrFail();

        // Verificar conflicto de horarios
        $conflicto = $this->verificarConflicto(
            $business->id,
            $request->fecha_inicio,
            $request->fecha_fin
        );

        if ($conflicto) {
            return response()->json([
                'message' => 'Ese horario ya no está disponible',
            ], 422);
        }

        // Buscar o crear cliente
        $client = Client::firstOrCreate(
            [
                'business_id' => $business->id,
                'telefono' => $request->telefono,
            ],
            [
                'nombre' => $request->nombre,
                'email' => $request->email,
            ]
        );

        // Crear el turno
        $appointment = Appointment::create([
            'business_id' => $business->id,
            'client_id' => $client->id,
            'service_id' => $request->service_id,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'motivo' => $request->motivo,
            'origen' => 'web',
            'estado' => 'pendiente',
        ]);

        // Enviar notificaciones al profesional
        $this->enviarEmailNuevoTurno($appointment);
        $this->enviarWhatsAppNuevoTurno($appointment);

        return response()->json([
            'message' => 'Turno solicitado correctamente. Te confirmaremos pronto.',
            'appointment' => $appointment->load('service'),
        ], 201);
    }

    /**
     * Mostrar un turno específico
     */
    public function show(Request $request, $id)
    {
        $appointment = $request->user()->business->appointments()
            ->with(['client', 'service'])
            ->findOrFail($id);

        return response()->json($appointment);
    }

    /**
     * Actualizar un turno
     *
     * Recibe: fecha_inicio, fecha_fin, motivo, estado, nombre_cliente, telefono_cliente
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_inicio',
            'motivo' => 'nullable|string|max:255',
            'service_id' => 'nullable|integer|exists:services,id',
            'estado' => 'sometimes|in:pendiente,confirmado,cancelado',
            'nombre_cliente' => 'nullable|string|max:255',
            'telefono_cliente' => 'nullable|string|max:50',
        ]);

        $appointment = $request->user()->business->appointments()->findOrFail($id);

        // Si cambia la fecha, verificar conflictos
        if ($request->has('fecha_inicio') || $request->has('fecha_fin')) {
            $fechaInicio = $request->fecha_inicio ?? $appointment->fecha_inicio;
            $fechaFin = $request->fecha_fin ?? $appointment->fecha_fin;

            $conflicto = $this->verificarConflicto(
                $appointment->business_id,
                $fechaInicio,
                $fechaFin,
                $appointment->id // Excluir el turno actual
            );

            if ($conflicto) {
                return response()->json([
                    'message' => 'Ya existe un turno en ese horario',
                ], 422);
            }
        }

        $estadoAnterior = $appointment->estado;

        // Actualizar datos del turno
        $appointment->update($request->only([
            'fecha_inicio',
            'fecha_fin',
            'motivo',
            'service_id',
            'estado',
        ]));

        // Actualizar datos del cliente si se enviaron
        if ($appointment->client && ($request->filled('nombre_cliente') || $request->filled('telefono_cliente'))) {
            $clientData = [];
            if ($request->filled('nombre_cliente')) {
                $clientData['nombre'] = $request->nombre_cliente;
            }
            if ($request->filled('telefono_cliente')) {
                $clientData['telefono'] = $request->telefono_cliente;
            }
            $appointment->client->update($clientData);
        }

        // Refrescar para obtener datos actualizados
        $appointment->refresh();

        // Si el estado cambió a confirmado, enviar notificaciones al cliente
        if ($request->estado === 'confirmado' && $estadoAnterior !== 'confirmado') {
            $this->enviarEmailTurnoConfirmado($appointment);
            $this->enviarWhatsAppTurnoConfirmado($appointment);
        }

        return response()->json([
            'message' => 'Turno actualizado correctamente',
            'appointment' => $appointment->load(['client', 'service']),
        ]);
    }

    /**
     * Cancelar un turno
     *
     * Cambia el estado a "cancelado" y aplica soft delete
     */
    public function cancel(Request $request, $id)
    {
        $appointment = $request->user()->business->appointments()->findOrFail($id);

        // Enviar notificaciones al cliente antes de cancelar
        $this->enviarEmailTurnoCancelado($appointment);
        $this->enviarWhatsAppTurnoCancelado($appointment);

        $appointment->update(['estado' => 'cancelado']);
        $appointment->delete(); // Soft delete - queda en BD con deleted_at

        return response()->json([
            'message' => 'Turno cancelado correctamente',
            'appointment' => $appointment->load(['client', 'service']),
        ]);
    }

    /**
     * Obtener horarios disponibles para un día (público)
     *
     * Usado por clientes para ver qué horarios están libres
     */
    public function availableSlots($slug, Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
        ]);

        $business = Business::with(['businessHours', 'setting'])
            ->where('slug', $slug)
            ->firstOrFail();

        $fecha = Carbon::parse($request->fecha);
        $diaSemana = $fecha->dayOfWeek; // 0=Domingo, 6=Sábado

        // Obtener horario del día
        $horarioDia = $business->businessHours
            ->where('dia_semana', $diaSemana)
            ->first();

        if (!$horarioDia) {
            return response()->json([
                'message' => 'El negocio no atiende este día',
                'slots' => [],
            ]);
        }

        // Obtener turnos del día
        $turnosDelDia = $business->appointments()
            ->whereDate('fecha_inicio', $fecha)
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->get();

        // Generar slots disponibles
        $intervalo = $business->setting->intervalo_turnos ?? 30;
        $slots = $this->generarSlots(
            $fecha,
            $horarioDia->hora_inicio,
            $horarioDia->hora_fin,
            $intervalo,
            $turnosDelDia
        );

        return response()->json([
            'fecha' => $fecha->toDateString(),
            'slots' => $slots,
        ]);
    }

    /**
     * Verificar si hay conflicto de horarios
     *
     * @param int $businessId
     * @param string $fechaInicio
     * @param string $fechaFin
     * @param int|null $excludeId - ID del turno a excluir (para updates)
     * @return bool
     */
    private function verificarConflicto($businessId, $fechaInicio, $fechaFin, $excludeId = null)
    {
        $query = Appointment::where('business_id', $businessId)
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->where(function ($q) use ($fechaInicio, $fechaFin) {
                // El nuevo turno se superpone con uno existente si:
                // - Empieza durante otro turno
                // - Termina durante otro turno
                // - Contiene completamente otro turno
                $q->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                    ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                    ->orWhere(function ($q2) use ($fechaInicio, $fechaFin) {
                        $q2->where('fecha_inicio', '<=', $fechaInicio)
                            ->where('fecha_fin', '>=', $fechaFin);
                    });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Generar slots de tiempo disponibles
     *
     * @param Carbon $fecha
     * @param string $horaInicio
     * @param string $horaFin
     * @param int $intervalo - Minutos entre slots
     * @param Collection $turnosOcupados
     * @return array
     */
    private function generarSlots($fecha, $horaInicio, $horaFin, $intervalo, $turnosOcupados)
    {
        $slots = [];
        $inicio = Carbon::parse($fecha->toDateString() . ' ' . $horaInicio);
        $fin = Carbon::parse($fecha->toDateString() . ' ' . $horaFin);

        while ($inicio->copy()->addMinutes($intervalo) <= $fin) {
            $slotFin = $inicio->copy()->addMinutes($intervalo);

            // Verificar si el slot está ocupado
            $ocupado = $turnosOcupados->contains(function ($turno) use ($inicio, $slotFin) {
                return $inicio < $turno->fecha_fin && $slotFin > $turno->fecha_inicio;
            });

            $slots[] = [
                'hora_inicio' => $inicio->format('H:i'),
                'hora_fin' => $slotFin->format('H:i'),
                'disponible' => !$ocupado,
            ];

            $inicio->addMinutes($intervalo);
        }

        return $slots;
    }

    /**
     * Enviar email al profesional cuando un cliente solicita un turno
     */
    private function enviarEmailNuevoTurno(Appointment $appointment)
    {
        $appointment->load(['client', 'business.setting', 'business.user']);

        // Verificar si tiene notificaciones por email activadas
        if (!$appointment->business->setting?->notificaciones_email) {
            return;
        }

        $emailProfesional = $appointment->business->user->email;

        try {
            Mail::to($emailProfesional)->send(new NuevoTurnoMail($appointment));
        } catch (\Exception $e) {
            // Log del error pero no interrumpir el flujo
            \Log::error('Error enviando email de nuevo turno: ' . $e->getMessage());
        }
    }

    /**
     * Enviar email al cliente cuando su turno es confirmado
     */
    private function enviarEmailTurnoConfirmado(Appointment $appointment)
    {
        $appointment->load(['client', 'business.setting']);

        // Verificar si el cliente tiene email
        if (!$appointment->client?->email) {
            return;
        }

        try {
            Mail::to($appointment->client->email)->send(new TurnoConfirmadoMail($appointment));
        } catch (\Exception $e) {
            \Log::error('Error enviando email de turno confirmado: ' . $e->getMessage());
        }
    }

    /**
     * Enviar email al cliente cuando su turno es cancelado
     */
    private function enviarEmailTurnoCancelado(Appointment $appointment)
    {
        $appointment->load(['client', 'business']);

        // Verificar si el cliente tiene email
        if (!$appointment->client?->email) {
            return;
        }

        try {
            Mail::to($appointment->client->email)->send(new TurnoCanceladoMail($appointment));
        } catch (\Exception $e) {
            \Log::error('Error enviando email de turno cancelado: ' . $e->getMessage());
        }
    }

    /**
     * Enviar WhatsApp al profesional cuando un cliente solicita un turno
     */
    private function enviarWhatsAppNuevoTurno(Appointment $appointment)
    {
        $appointment->load(['client', 'business.setting', 'business.user', 'service']);

        // Verificar si tiene notificaciones por WhatsApp activadas
        if (!$appointment->business->setting?->notificaciones_whatsapp) {
            return;
        }

        // Obtener teléfono del profesional
        $telefonoProfesional = $appointment->business->user->telefono;
        if (!$telefonoProfesional) {
            return;
        }

        try {
            $whatsapp = new WhatsAppService();
            $whatsapp->notifyNewAppointment($appointment, $telefonoProfesional);
        } catch (\Exception $e) {
            \Log::error('Error enviando WhatsApp de nuevo turno: ' . $e->getMessage());
        }
    }

    /**
     * Enviar WhatsApp al cliente cuando su turno es confirmado
     */
    private function enviarWhatsAppTurnoConfirmado(Appointment $appointment)
    {
        $appointment->load(['client', 'business.setting', 'service']);

        // Verificar si tiene notificaciones por WhatsApp activadas
        if (!$appointment->business->setting?->notificaciones_whatsapp) {
            return;
        }

        // Verificar si el cliente tiene teléfono
        if (!$appointment->client?->telefono) {
            return;
        }

        try {
            $whatsapp = new WhatsAppService();
            $whatsapp->notifyAppointmentConfirmed($appointment);
        } catch (\Exception $e) {
            \Log::error('Error enviando WhatsApp de turno confirmado: ' . $e->getMessage());
        }
    }

    /**
     * Enviar WhatsApp al cliente cuando su turno es cancelado
     */
    private function enviarWhatsAppTurnoCancelado(Appointment $appointment)
    {
        $appointment->load(['client', 'business.setting']);

        // Verificar si tiene notificaciones por WhatsApp activadas
        if (!$appointment->business->setting?->notificaciones_whatsapp) {
            return;
        }

        // Verificar si el cliente tiene teléfono
        if (!$appointment->client?->telefono) {
            return;
        }

        try {
            $whatsapp = new WhatsAppService();
            $whatsapp->notifyAppointmentCancelled($appointment);
        } catch (\Exception $e) {
            \Log::error('Error enviando WhatsApp de turno cancelado: ' . $e->getMessage());
        }
    }
}
