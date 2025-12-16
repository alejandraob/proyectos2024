<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Listar servicios del negocio
     */
    public function index(Request $request)
    {
        $services = $request->user()->business->services()
            ->orderBy('nombre')
            ->get();

        return response()->json($services);
    }

    /**
     * Crear nuevo servicio
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'nullable|numeric|min:0',
            'duracion' => 'required|integer|min:5|max:480',
            'activo' => 'boolean',
        ]);

        $service = $request->user()->business->services()->create([
            'nombre' => $request->nombre,
            'precio' => $request->precio,
            'duracion' => $request->duracion ?? 30,
            'activo' => $request->activo ?? true,
        ]);

        return response()->json([
            'message' => 'Servicio creado correctamente',
            'service' => $service,
        ], 201);
    }

    /**
     * Mostrar un servicio
     */
    public function show(Request $request, $id)
    {
        $service = $request->user()->business->services()->findOrFail($id);

        return response()->json($service);
    }

    /**
     * Actualizar servicio
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'precio' => 'nullable|numeric|min:0',
            'duracion' => 'sometimes|integer|min:5|max:480',
            'activo' => 'boolean',
        ]);

        $service = $request->user()->business->services()->findOrFail($id);

        $service->update($request->only([
            'nombre',
            'precio',
            'duracion',
            'activo',
        ]));

        return response()->json([
            'message' => 'Servicio actualizado correctamente',
            'service' => $service,
        ]);
    }

    /**
     * Eliminar servicio
     */
    public function destroy(Request $request, $id)
    {
        $service = $request->user()->business->services()->findOrFail($id);

        // Verificar si tiene turnos asociados
        $turnosCount = $service->appointments()->count();
        if ($turnosCount > 0) {
            // En lugar de eliminar, desactivar
            $service->update(['activo' => false]);
            return response()->json([
                'message' => 'Servicio desactivado (tiene turnos asociados)',
                'service' => $service,
            ]);
        }

        $service->delete();

        return response()->json([
            'message' => 'Servicio eliminado correctamente',
        ]);
    }

    /**
     * Listar servicios activos de un negocio (público)
     * Usado en la página de reservas
     */
    public function getBySlug($slug)
    {
        $business = \App\Models\Business::where('slug', $slug)->firstOrFail();

        $services = $business->services()
            ->activos()
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'precio', 'duracion']);

        return response()->json($services);
    }
}
