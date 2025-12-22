<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\ServicePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Dashboard general con estadísticas
     */
    public function dashboard(Request $request)
    {
        $business = $request->user()->business;
        $businessId = $business->id;

        // Período actual (mes)
        $inicioMes = now()->startOfMonth();
        $finMes = now()->endOfMonth();

        // Estadísticas de turnos
        $turnosMes = Appointment::where('business_id', $businessId)
            ->whereBetween('fecha_inicio', [$inicioMes, $finMes])
            ->count();

        $turnosConfirmados = Appointment::where('business_id', $businessId)
            ->whereBetween('fecha_inicio', [$inicioMes, $finMes])
            ->where('estado', 'confirmado')
            ->count();

        $turnosCancelados = Appointment::where('business_id', $businessId)
            ->whereBetween('fecha_inicio', [$inicioMes, $finMes])
            ->where('estado', 'cancelado')
            ->count();

        // Estadísticas de clientes
        $totalClientes = Client::where('business_id', $businessId)->count();
        $clientesNuevosMes = Client::where('business_id', $businessId)
            ->whereBetween('created_at', [$inicioMes, $finMes])
            ->count();

        // Estadísticas de ingresos
        $ingresosMes = ServicePayment::where('business_id', $businessId)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$inicioMes->toDateString(), $finMes->toDateString()])
            ->sum('monto');

        // Mes anterior para comparación
        $inicioMesAnterior = now()->subMonth()->startOfMonth();
        $finMesAnterior = now()->subMonth()->endOfMonth();

        $turnosMesAnterior = Appointment::where('business_id', $businessId)
            ->whereBetween('fecha_inicio', [$inicioMesAnterior, $finMesAnterior])
            ->count();

        $ingresosMesAnterior = ServicePayment::where('business_id', $businessId)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$inicioMesAnterior->toDateString(), $finMesAnterior->toDateString()])
            ->sum('monto');

        // Servicios más populares (por cantidad de turnos)
        $serviciosPopulares = Appointment::where('business_id', $businessId)
            ->whereBetween('fecha_inicio', [$inicioMes, $finMes])
            ->where('estado', '!=', 'cancelado')
            ->whereNotNull('service_id')
            ->with('service')
            ->selectRaw('service_id, COUNT(*) as total')
            ->groupBy('service_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'nombre' => $item->service?->nombre ?? 'Sin servicio',
                    'cantidad' => $item->total,
                    'precio' => $item->service?->precio ?? 0,
                ];
            });

        return response()->json([
            'turnos' => [
                'total_mes' => $turnosMes,
                'confirmados' => $turnosConfirmados,
                'cancelados' => $turnosCancelados,
                'pendientes' => $turnosMes - $turnosConfirmados - $turnosCancelados,
                'mes_anterior' => $turnosMesAnterior,
                'variacion' => $turnosMesAnterior > 0
                    ? round((($turnosMes - $turnosMesAnterior) / $turnosMesAnterior) * 100, 1)
                    : 0,
            ],
            'clientes' => [
                'total' => $totalClientes,
                'nuevos_mes' => $clientesNuevosMes,
            ],
            'ingresos' => [
                'total_mes' => $ingresosMes,
                'mes_anterior' => $ingresosMesAnterior,
                'variacion' => $ingresosMesAnterior > 0
                    ? round((($ingresosMes - $ingresosMesAnterior) / $ingresosMesAnterior) * 100, 1)
                    : 0,
            ],
            'servicios_populares' => $serviciosPopulares,
        ]);
    }

    /**
     * Reporte de turnos con filtros avanzados
     */
    public function appointments(Request $request)
    {
        $business = $request->user()->business;

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'agrupar_por' => 'nullable|in:dia,semana,mes,servicio,estado',
        ]);

        $fechaInicio = $request->fecha_inicio ?? now()->startOfMonth()->toDateString();
        $fechaFin = $request->fecha_fin ?? now()->endOfMonth()->toDateString();
        $agruparPor = $request->agrupar_por ?? 'dia';

        $query = Appointment::where('business_id', $business->id)
            ->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin . ' 23:59:59']);

        switch ($agruparPor) {
            case 'dia':
                $data = $query->selectRaw('DATE(fecha_inicio) as fecha, COUNT(*) as total,
                    SUM(CASE WHEN estado = "confirmado" THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = "cancelado" THEN 1 ELSE 0 END) as cancelados,
                    SUM(CASE WHEN estado = "pendiente" THEN 1 ELSE 0 END) as pendientes')
                    ->groupBy('fecha')
                    ->orderBy('fecha')
                    ->get();
                break;

            case 'semana':
                $data = $query->selectRaw('YEARWEEK(fecha_inicio, 1) as semana, COUNT(*) as total,
                    MIN(DATE(fecha_inicio)) as inicio_semana,
                    SUM(CASE WHEN estado = "confirmado" THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = "cancelado" THEN 1 ELSE 0 END) as cancelados')
                    ->groupBy('semana')
                    ->orderBy('semana')
                    ->get();
                break;

            case 'mes':
                $data = $query->selectRaw('YEAR(fecha_inicio) as anio, MONTH(fecha_inicio) as mes, COUNT(*) as total,
                    SUM(CASE WHEN estado = "confirmado" THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = "cancelado" THEN 1 ELSE 0 END) as cancelados')
                    ->groupBy('anio', 'mes')
                    ->orderBy('anio')
                    ->orderBy('mes')
                    ->get();
                break;

            case 'servicio':
                $data = $query->with('service')
                    ->selectRaw('service_id, COUNT(*) as total,
                        SUM(CASE WHEN estado = "confirmado" THEN 1 ELSE 0 END) as confirmados,
                        SUM(CASE WHEN estado = "cancelado" THEN 1 ELSE 0 END) as cancelados')
                    ->groupBy('service_id')
                    ->orderByDesc('total')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'servicio' => $item->service?->nombre ?? 'Sin servicio',
                            'total' => $item->total,
                            'confirmados' => $item->confirmados,
                            'cancelados' => $item->cancelados,
                        ];
                    });
                break;

            case 'estado':
                $data = $query->selectRaw('estado, COUNT(*) as total')
                    ->groupBy('estado')
                    ->get();
                break;

            default:
                $data = [];
        }

        return response()->json([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'agrupado_por' => $agruparPor,
            'data' => $data,
        ]);
    }

    /**
     * Reporte de ingresos con análisis
     */
    public function income(Request $request)
    {
        $business = $request->user()->business;

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'agrupar_por' => 'nullable|in:dia,semana,mes,metodo_pago,servicio',
        ]);

        $fechaInicio = $request->fecha_inicio ?? now()->startOfMonth()->toDateString();
        $fechaFin = $request->fecha_fin ?? now()->endOfMonth()->toDateString();
        $agruparPor = $request->agrupar_por ?? 'dia';

        $query = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$fechaInicio, $fechaFin]);

        switch ($agruparPor) {
            case 'dia':
                $data = $query->selectRaw('fecha_pago as fecha, SUM(monto) as total, COUNT(*) as cantidad')
                    ->groupBy('fecha_pago')
                    ->orderBy('fecha_pago')
                    ->get();
                break;

            case 'semana':
                $data = $query->selectRaw('YEARWEEK(fecha_pago, 1) as semana, SUM(monto) as total, COUNT(*) as cantidad,
                    MIN(fecha_pago) as inicio_semana')
                    ->groupBy('semana')
                    ->orderBy('semana')
                    ->get();
                break;

            case 'mes':
                $data = $query->selectRaw('YEAR(fecha_pago) as anio, MONTH(fecha_pago) as mes, SUM(monto) as total, COUNT(*) as cantidad')
                    ->groupBy('anio', 'mes')
                    ->orderBy('anio')
                    ->orderBy('mes')
                    ->get();
                break;

            case 'metodo_pago':
                $data = $query->selectRaw('metodo_pago, SUM(monto) as total, COUNT(*) as cantidad')
                    ->groupBy('metodo_pago')
                    ->orderByDesc('total')
                    ->get();
                break;

            case 'servicio':
                $data = $query->with('service')
                    ->selectRaw('service_id, SUM(monto) as total, COUNT(*) as cantidad')
                    ->groupBy('service_id')
                    ->orderByDesc('total')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'servicio' => $item->service?->nombre ?? 'Sin servicio',
                            'total' => $item->total,
                            'cantidad' => $item->cantidad,
                        ];
                    });
                break;

            default:
                $data = [];
        }

        // Totales del período
        $totales = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
            ->selectRaw('SUM(monto) as total, COUNT(*) as cantidad, AVG(monto) as promedio')
            ->first();

        return response()->json([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'agrupado_por' => $agruparPor,
            'data' => $data,
            'totales' => [
                'total' => $totales->total ?? 0,
                'cantidad' => $totales->cantidad ?? 0,
                'promedio' => round($totales->promedio ?? 0, 2),
            ],
        ]);
    }

    /**
     * Reporte de clientes más frecuentes
     */
    public function topClients(Request $request)
    {
        $business = $request->user()->business;

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'limite' => 'nullable|integer|min:1|max:50',
            'ordenar_por' => 'nullable|in:turnos,ingresos',
        ]);

        $fechaInicio = $request->fecha_inicio ?? now()->startOfYear()->toDateString();
        $fechaFin = $request->fecha_fin ?? now()->endOfYear()->toDateString();
        $limite = $request->limite ?? 10;
        $ordenarPor = $request->ordenar_por ?? 'turnos';

        if ($ordenarPor === 'turnos') {
            // Primero obtenemos los clientes con sus turnos
            $clients = Client::where('business_id', $business->id)
                ->withCount(['appointments' => function ($query) use ($fechaInicio, $fechaFin) {
                    $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin . ' 23:59:59'])
                          ->where('estado', '!=', 'cancelado');
                }])
                ->having('appointments_count', '>', 0)
                ->orderByDesc('appointments_count')
                ->limit($limite)
                ->get();

            // Obtenemos los IDs para buscar los pagos
            $clientIds = $clients->pluck('id');

            // Calculamos el total gastado por cada cliente
            $pagosClientes = ServicePayment::whereIn('client_id', $clientIds)
                ->where('estado', 'pagado')
                ->whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
                ->selectRaw('client_id, SUM(monto) as total_gastado')
                ->groupBy('client_id')
                ->pluck('total_gastado', 'client_id');

            $data = $clients->map(function ($client) use ($pagosClientes) {
                return [
                    'id' => $client->id,
                    'nombre' => $client->nombre,
                    'telefono' => $client->telefono,
                    'email' => $client->email,
                    'total_turnos' => $client->appointments_count,
                    'total_gastado' => $pagosClientes[$client->id] ?? 0,
                ];
            });
        } else {
            $data = Client::where('clients.business_id', $business->id)
                ->leftJoin('service_payments', function ($join) use ($fechaInicio, $fechaFin) {
                    $join->on('clients.id', '=', 'service_payments.client_id')
                         ->where('service_payments.estado', '=', 'pagado')
                         ->whereBetween('service_payments.fecha_pago', [$fechaInicio, $fechaFin]);
                })
                ->select('clients.*',
                    DB::raw('COALESCE(SUM(service_payments.monto), 0) as total_ingresos'),
                    DB::raw('COUNT(service_payments.id) as total_pagos'))
                ->groupBy('clients.id')
                ->having('total_ingresos', '>', 0)
                ->orderByDesc('total_ingresos')
                ->limit($limite)
                ->get()
                ->map(function ($client) {
                    return [
                        'id' => $client->id,
                        'nombre' => $client->nombre,
                        'telefono' => $client->telefono,
                        'email' => $client->email,
                        'total_ingresos' => $client->total_ingresos,
                        'total_pagos' => $client->total_pagos,
                    ];
                });
        }

        return response()->json([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'ordenado_por' => $ordenarPor,
            'data' => $data,
        ]);
    }

    /**
     * Estadísticas por hora del día (para ver horarios más populares)
     */
    public function hourlyStats(Request $request)
    {
        $business = $request->user()->business;

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->fecha_inicio ?? now()->subMonths(3)->toDateString();
        $fechaFin = $request->fecha_fin ?? now()->toDateString();

        $data = Appointment::where('business_id', $business->id)
            ->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin . ' 23:59:59'])
            ->where('estado', '!=', 'cancelado')
            ->selectRaw('HOUR(fecha_inicio) as hora, COUNT(*) as total')
            ->groupBy('hora')
            ->orderBy('hora')
            ->get();

        // Crear array con todas las horas (0-23) con valores por defecto
        $horasCompletas = collect(range(0, 23))->map(function ($hora) use ($data) {
            $found = $data->firstWhere('hora', $hora);
            return [
                'hora' => $hora,
                'total' => $found ? $found->total : 0,
            ];
        });

        return response()->json([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'data' => $horasCompletas,
        ]);
    }

    /**
     * Estadísticas por día de la semana
     */
    public function weekdayStats(Request $request)
    {
        $business = $request->user()->business;

        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $fechaInicio = $request->fecha_inicio ?? now()->subMonths(3)->toDateString();
        $fechaFin = $request->fecha_fin ?? now()->toDateString();

        $data = Appointment::where('business_id', $business->id)
            ->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin . ' 23:59:59'])
            ->where('estado', '!=', 'cancelado')
            ->selectRaw('DAYOFWEEK(fecha_inicio) as dia_semana, COUNT(*) as total')
            ->groupBy('dia_semana')
            ->orderBy('dia_semana')
            ->get();

        $diasNombres = [
            1 => 'Domingo',
            2 => 'Lunes',
            3 => 'Martes',
            4 => 'Miércoles',
            5 => 'Jueves',
            6 => 'Viernes',
            7 => 'Sábado',
        ];

        $dataCompleta = collect(range(1, 7))->map(function ($dia) use ($data, $diasNombres) {
            $found = $data->firstWhere('dia_semana', $dia);
            return [
                'dia' => $dia,
                'nombre' => $diasNombres[$dia],
                'total' => $found ? $found->total : 0,
            ];
        });

        return response()->json([
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'data' => $dataCompleta,
        ]);
    }
}
