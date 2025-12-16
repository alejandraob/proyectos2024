<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Listar todos los clientes del negocio
     *
     * Query params opcionales:
     * - buscar: Buscar por nombre o teléfono
     *
     * Retorna: Lista de clientes con cantidad de turnos
     */
    public function index(Request $request)
    {
        $query = $request->user()->business->clients()
            ->withCount('appointments');

        // Búsqueda por nombre o teléfono
        if ($request->has('buscar') && $request->buscar) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                  ->orWhere('telefono', 'like', "%{$buscar}%");
            });
        }

        $clients = $query->orderBy('nombre')->get();

        return response()->json($clients);
    }

    /**
     * Crear un nuevo cliente
     *
     * Recibe: nombre, telefono, email
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $client = Client::create([
            'business_id' => $request->user()->business->id,
            'nombre' => $request->nombre,
            'telefono' => $request->telefono,
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => 'Cliente creado correctamente',
            'client' => $client,
        ], 201);
    }

    /**
     * Mostrar un cliente específico
     *
     * Retorna: Cliente con historial de turnos (incluyendo servicio)
     */
    public function show(Request $request, $id)
    {
        $client = $request->user()->business->clients()
            ->with(['appointments' => function ($query) {
                $query->with('service')
                    ->orderBy('fecha_inicio', 'desc');
            }])
            ->findOrFail($id);

        return response()->json($client);
    }

    /**
     * Actualizar datos de un cliente
     *
     * Recibe: nombre, telefono, email
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $client = $request->user()->business->clients()->findOrFail($id);
        $client->update($request->only(['nombre', 'telefono', 'email']));

        return response()->json([
            'message' => 'Cliente actualizado correctamente',
            'client' => $client,
        ]);
    }

    /**
     * Eliminar un cliente
     *
     * Nota: Los turnos asociados quedarán con client_id = null
     */
    public function destroy(Request $request, $id)
    {
        $client = $request->user()->business->clients()->findOrFail($id);
        $client->delete();

        return response()->json([
            'message' => 'Cliente eliminado correctamente',
        ]);
    }
}
