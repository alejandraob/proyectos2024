<?php

use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Income & Reports Routes
|--------------------------------------------------------------------------
|
| Rutas para gestión de ingresos y reportes estadísticos.
| Todas requieren autenticación.
|
*/

Route::middleware('auth:sanctum')->group(function () {

    // Ingresos (pagos de servicios)
    Route::get('/income', [IncomeController::class, 'index']);          // Listar ingresos
    Route::post('/income', [IncomeController::class, 'store']);         // Registrar ingreso
    Route::get('/income/summary', [IncomeController::class, 'summary']); // Resumen de ingresos
    Route::get('/income/{id}', [IncomeController::class, 'show']);      // Ver ingreso
    Route::put('/income/{id}', [IncomeController::class, 'update']);    // Actualizar ingreso
    Route::delete('/income/{id}', [IncomeController::class, 'destroy']); // Eliminar ingreso

    // Reportes y estadísticas
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);        // Dashboard general
    Route::get('/reports/appointments', [ReportController::class, 'appointments']);  // Reporte de turnos
    Route::get('/reports/income', [ReportController::class, 'income']);              // Reporte de ingresos
    Route::get('/reports/top-clients', [ReportController::class, 'topClients']);     // Top clientes
    Route::get('/reports/hourly', [ReportController::class, 'hourlyStats']);         // Estadísticas por hora
    Route::get('/reports/weekday', [ReportController::class, 'weekdayStats']);       // Estadísticas por día de semana
});
