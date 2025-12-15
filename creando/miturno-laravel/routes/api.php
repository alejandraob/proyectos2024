<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AppointmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Todas las rutas tienen el prefijo /api automáticamente
| Ejemplo: /api/login, /api/appointments, etc.
|
*/

// =============================================
// RUTAS PÚBLICAS (sin autenticación)
// =============================================

// Autenticación
Route::post('/register', [AuthController::class, 'register']);  // Registro de profesional
Route::post('/login', [AuthController::class, 'login']);        // Inicio de sesión

// Rutas públicas para clientes finales (reservar turno)
Route::get('/negocio/{slug}', [BusinessController::class, 'getBySlug']);              // Ver datos del negocio
Route::get('/negocio/{slug}/slots', [AppointmentController::class, 'availableSlots']); // Ver horarios disponibles
Route::post('/negocio/{slug}/turno', [AppointmentController::class, 'storePublic']);   // Solicitar turno

// =============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================

Route::middleware('auth:sanctum')->group(function () {

    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);  // Cerrar sesión
    Route::get('/me', [AuthController::class, 'me']);           // Obtener usuario actual

    // Negocio
    Route::get('/business', [BusinessController::class, 'show']);              // Ver mi negocio
    Route::put('/business', [BusinessController::class, 'update']);            // Actualizar datos del negocio
    Route::put('/business/hours', [BusinessController::class, 'updateHours']); // Actualizar horarios
    Route::put('/business/settings', [BusinessController::class, 'updateSettings']); // Actualizar configuración

    // Clientes
    Route::get('/clients', [ClientController::class, 'index']);        // Listar clientes
    Route::post('/clients', [ClientController::class, 'store']);       // Crear cliente
    Route::get('/clients/{id}', [ClientController::class, 'show']);    // Ver cliente
    Route::put('/clients/{id}', [ClientController::class, 'update']);  // Actualizar cliente
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']); // Eliminar cliente

    // Turnos
    Route::get('/appointments', [AppointmentController::class, 'index']);          // Listar turnos
    Route::post('/appointments', [AppointmentController::class, 'store']);         // Crear turno
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);      // Ver turno
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);    // Actualizar turno
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']); // Cancelar turno
});
