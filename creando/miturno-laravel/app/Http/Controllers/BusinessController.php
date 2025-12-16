<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\BusinessHour;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BusinessController extends Controller
{
    /**
     * Obtener datos del negocio del usuario autenticado
     *
     * Retorna: Negocio con horarios y configuración
     */
    public function show(Request $request)
    {
        $business = $request->user()->business()->with(['businessHours', 'setting'])->first();

        return response()->json($business);
    }

    /**
     * Actualizar datos del negocio
     *
     * Recibe: nombre_negocio, rubro, direccion
     */
    public function update(Request $request)
    {
        $request->validate([
            'nombre_negocio' => 'sometimes|string|max:255',
            'rubro' => 'sometimes|string|max:255',
            'direccion' => 'sometimes|string|max:255',
        ]);

        $business = $request->user()->business;
        $business->update($request->only(['nombre_negocio', 'rubro', 'direccion']));

        return response()->json([
            'message' => 'Negocio actualizado correctamente',
            'business' => $business,
        ]);
    }

    /**
     * Guardar horarios de atención del negocio
     *
     * Recibe: Array de horarios
     * Ejemplo: [
     *   { dia_semana: 1, hora_inicio: "09:00", hora_fin: "18:00" },
     *   { dia_semana: 2, hora_inicio: "09:00", hora_fin: "18:00" },
     * ]
     * dia_semana: 0=Domingo, 1=Lunes, ... 6=Sábado
     */
    public function updateHours(Request $request)
    {
        $request->validate([
            'horarios' => 'required|array',
            'horarios.*.dia_semana' => 'required|integer|between:0,6',
            'horarios.*.hora_inicio' => 'required|date_format:H:i',
            'horarios.*.hora_fin' => 'required|date_format:H:i|after:horarios.*.hora_inicio',
        ]);

        $business = $request->user()->business;

        // Eliminar horarios anteriores y crear los nuevos
        $business->businessHours()->delete();

        foreach ($request->horarios as $horario) {
            BusinessHour::create([
                'business_id' => $business->id,
                'dia_semana' => $horario['dia_semana'],
                'hora_inicio' => $horario['hora_inicio'],
                'hora_fin' => $horario['hora_fin'],
            ]);
        }

        return response()->json([
            'message' => 'Horarios actualizados correctamente',
            'horarios' => $business->businessHours,
        ]);
    }

    /**
     * Actualizar configuración del negocio
     *
     * Recibe: notificaciones_email, notificaciones_whatsapp, intervalo_turnos, color_theme
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'notificaciones_email' => 'sometimes|boolean',
            'notificaciones_whatsapp' => 'sometimes|boolean',
            'intervalo_turnos' => 'sometimes|integer|in:15,30,45,60',
            'color_theme' => 'sometimes|string|in:default,esmeralda,oceano,atardecer,neon',
        ]);

        $setting = $request->user()->business->setting;
        $setting->update($request->only([
            'notificaciones_email',
            'notificaciones_whatsapp',
            'intervalo_turnos',
            'color_theme',
        ]));

        return response()->json([
            'message' => 'Configuración actualizada correctamente',
            'setting' => $setting,
        ]);
    }

    /**
     * Obtener estadísticas del negocio
     *
     * Retorna: turnos_hoy, turnos_pendientes, total_clientes, turnos_mes
     */
    public function stats(Request $request)
    {
        $business = $request->user()->business;
        $hoy = Carbon::today();
        $inicioMes = Carbon::now()->startOfMonth();
        $finMes = Carbon::now()->endOfMonth();

        // Turnos de hoy (confirmados y pendientes)
        $turnosHoy = $business->appointments()
            ->whereDate('fecha_inicio', $hoy)
            ->whereIn('estado', ['pendiente', 'confirmado'])
            ->count();

        // Turnos pendientes (estado pendiente, fecha futura o hoy)
        $turnosPendientes = $business->appointments()
            ->where('estado', 'pendiente')
            ->whereDate('fecha_inicio', '>=', $hoy)
            ->count();

        // Total de clientes
        $totalClientes = $business->clients()->count();

        // Turnos este mes (todos los estados)
        $turnosMes = $business->appointments()
            ->whereDate('fecha_inicio', '>=', $inicioMes)
            ->whereDate('fecha_inicio', '<=', $finMes)
            ->count();

        // Turnos completados este mes
        $turnosCompletadosMes = $business->appointments()
            ->where('estado', 'confirmado')
            ->whereDate('fecha_inicio', '>=', $inicioMes)
            ->whereDate('fecha_inicio', '<', $hoy)
            ->count();

        // Turnos cancelados este mes
        $turnosCanceladosMes = $business->appointments()
            ->where('estado', 'cancelado')
            ->whereDate('fecha_inicio', '>=', $inicioMes)
            ->whereDate('fecha_inicio', '<=', $finMes)
            ->count();

        return response()->json([
            'turnos_hoy' => $turnosHoy,
            'turnos_pendientes' => $turnosPendientes,
            'total_clientes' => $totalClientes,
            'turnos_mes' => $turnosMes,
            'turnos_completados_mes' => $turnosCompletadosMes,
            'turnos_cancelados_mes' => $turnosCanceladosMes,
        ]);
    }

    /**
     * Obtener negocio por slug (público, para clientes)
     *
     * Usado cuando un cliente entra a: /mi-pelu
     * Retorna: Datos públicos del negocio y horarios disponibles
     */
    public function getBySlug($slug)
    {
        $business = Business::with('businessHours')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'nombre_negocio' => $business->nombre_negocio,
            'rubro' => $business->rubro,
            'direccion' => $business->direccion,
            'horarios' => $business->businessHours,
        ]);
    }
}
