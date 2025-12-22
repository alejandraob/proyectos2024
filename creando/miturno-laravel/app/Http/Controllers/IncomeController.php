<?php

namespace App\Http\Controllers;

use App\Models\ServicePayment;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    /**
     * Listar ingresos del negocio
     *
     * Query params opcionales:
     * - fecha_inicio: Fecha de inicio del rango
     * - fecha_fin: Fecha de fin del rango
     * - metodo_pago: Filtrar por método de pago
     * - estado: Filtrar por estado
     */
    public function index(Request $request)
    {
        $business = $request->user()->business;

        $query = ServicePayment::where('business_id', $business->id)
            ->with(['client', 'service', 'appointment']);

        // Filtro por rango de fechas
        if ($request->has('fecha_inicio') && $request->fecha_inicio) {
            $query->where('fecha_pago', '>=', $request->fecha_inicio);
        }

        if ($request->has('fecha_fin') && $request->fecha_fin) {
            $query->where('fecha_pago', '<=', $request->fecha_fin);
        }

        // Filtro por método de pago
        if ($request->has('metodo_pago') && $request->metodo_pago) {
            $query->where('metodo_pago', $request->metodo_pago);
        }

        // Filtro por estado
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }

        $pagos = $query->orderBy('fecha_pago', 'desc')
                       ->orderBy('created_at', 'desc')
                       ->get();

        return response()->json($pagos);
    }

    /**
     * Registrar un nuevo ingreso
     */
    public function store(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,mercadopago,otro',
            'fecha_pago' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'service_id' => 'nullable|exists:services,id',
            'descripcion' => 'nullable|string|max:255',
            'referencia' => 'nullable|string|max:100',
            'estado' => 'nullable|in:pendiente,pagado,cancelado,reembolsado',
        ]);

        $business = $request->user()->business;

        // Validar que el cliente pertenezca al negocio
        if ($request->client_id) {
            $clienteBelongs = $business->clients()->where('id', $request->client_id)->exists();
            if (!$clienteBelongs) {
                return response()->json(['message' => 'El cliente no pertenece a este negocio'], 403);
            }
        }

        $pago = ServicePayment::create([
            'business_id' => $business->id,
            'client_id' => $request->client_id,
            'appointment_id' => $request->appointment_id,
            'service_id' => $request->service_id,
            'monto' => $request->monto,
            'metodo_pago' => $request->metodo_pago,
            'estado' => $request->estado ?? 'pagado',
            'descripcion' => $request->descripcion,
            'referencia' => $request->referencia,
            'fecha_pago' => $request->fecha_pago,
        ]);

        $pago->load(['client', 'service', 'appointment']);

        return response()->json([
            'message' => 'Ingreso registrado correctamente',
            'pago' => $pago,
        ], 201);
    }

    /**
     * Mostrar un ingreso específico
     */
    public function show(Request $request, $id)
    {
        $pago = ServicePayment::where('business_id', $request->user()->business->id)
            ->with(['client', 'service', 'appointment'])
            ->findOrFail($id);

        return response()->json($pago);
    }

    /**
     * Actualizar un ingreso
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'monto' => 'sometimes|numeric|min:0',
            'metodo_pago' => 'sometimes|in:efectivo,tarjeta,transferencia,mercadopago,otro',
            'fecha_pago' => 'sometimes|date',
            'client_id' => 'nullable|exists:clients,id',
            'service_id' => 'nullable|exists:services,id',
            'descripcion' => 'nullable|string|max:255',
            'referencia' => 'nullable|string|max:100',
            'estado' => 'sometimes|in:pendiente,pagado,cancelado,reembolsado',
        ]);

        $business = $request->user()->business;
        $pago = ServicePayment::where('business_id', $business->id)->findOrFail($id);

        $pago->update($request->only([
            'monto',
            'metodo_pago',
            'fecha_pago',
            'client_id',
            'service_id',
            'descripcion',
            'referencia',
            'estado',
        ]));

        $pago->load(['client', 'service', 'appointment']);

        return response()->json([
            'message' => 'Ingreso actualizado correctamente',
            'pago' => $pago,
        ]);
    }

    /**
     * Eliminar un ingreso
     */
    public function destroy(Request $request, $id)
    {
        $pago = ServicePayment::where('business_id', $request->user()->business->id)->findOrFail($id);
        $pago->delete();

        return response()->json([
            'message' => 'Ingreso eliminado correctamente',
        ]);
    }

    /**
     * Resumen de ingresos (para el dashboard)
     */
    public function summary(Request $request)
    {
        $business = $request->user()->business;

        // Mes actual
        $inicioMes = now()->startOfMonth()->toDateString();
        $finMes = now()->endOfMonth()->toDateString();

        // Mes anterior
        $inicioMesAnterior = now()->subMonth()->startOfMonth()->toDateString();
        $finMesAnterior = now()->subMonth()->endOfMonth()->toDateString();

        // Ingresos del mes actual
        $ingresosMesActual = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$inicioMes, $finMes])
            ->sum('monto');

        // Ingresos del mes anterior
        $ingresosMesAnterior = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$inicioMesAnterior, $finMesAnterior])
            ->sum('monto');

        // Calcular porcentaje de cambio
        $porcentajeCambio = 0;
        if ($ingresosMesAnterior > 0) {
            $porcentajeCambio = round((($ingresosMesActual - $ingresosMesAnterior) / $ingresosMesAnterior) * 100, 1);
        }

        // Ingresos por método de pago (mes actual)
        $porMetodoPago = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->whereBetween('fecha_pago', [$inicioMes, $finMes])
            ->selectRaw('metodo_pago, SUM(monto) as total, COUNT(*) as cantidad')
            ->groupBy('metodo_pago')
            ->get();

        // Ingresos por día (últimos 30 días)
        $ingresosPorDia = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pagado')
            ->where('fecha_pago', '>=', now()->subDays(30)->toDateString())
            ->selectRaw('fecha_pago, SUM(monto) as total')
            ->groupBy('fecha_pago')
            ->orderBy('fecha_pago')
            ->get();

        // Total pendiente
        $totalPendiente = ServicePayment::where('business_id', $business->id)
            ->where('estado', 'pendiente')
            ->sum('monto');

        return response()->json([
            'mes_actual' => [
                'total' => $ingresosMesActual,
                'porcentaje_cambio' => $porcentajeCambio,
            ],
            'mes_anterior' => [
                'total' => $ingresosMesAnterior,
            ],
            'por_metodo_pago' => $porMetodoPago,
            'por_dia' => $ingresosPorDia,
            'pendiente' => $totalPendiente,
        ]);
    }
}
