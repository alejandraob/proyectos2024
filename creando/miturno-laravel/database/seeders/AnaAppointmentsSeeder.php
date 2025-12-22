<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AnaAppointmentsSeeder extends Seeder
{
    /**
     * Crear 30 turnos para Ana para probar el límite del plan FREE
     */
    public function run(): void
    {
        $user = User::where('email', 'ana@test.com')->first();

        if (!$user) {
            $this->command->error('Usuario ana@test.com no encontrado');
            return;
        }

        $business = $user->business;

        if (!$business) {
            $this->command->error('El usuario no tiene negocio asociado');
            return;
        }

        // Obtener o crear un cliente de prueba
        $client = Client::firstOrCreate(
            ['business_id' => $business->id, 'email' => 'cliente.prueba@test.com'],
            [
                'nombre' => 'Cliente de Prueba',
                'telefono' => '1155667788',
            ]
        );

        // Servicios de ejemplo
        $servicios = ['Corte de pelo', 'Tintura', 'Brushing', 'Tratamiento capilar', 'Mechas'];

        // Crear 30 turnos en el mes actual
        $baseDate = Carbon::now()->startOfMonth();

        for ($i = 0; $i < 30; $i++) {
            // Distribuir turnos en diferentes días del mes
            $fecha = $baseDate->copy()->addDays($i % 28);

            // Hora entre 9:00 y 17:00
            $hora = 9 + ($i % 8);

            $fechaInicio = $fecha->copy()->setHour($hora)->setMinute(0)->setSecond(0);
            $fechaFin = $fechaInicio->copy()->addMinutes(30);

            Appointment::create([
                'business_id' => $business->id,
                'client_id' => $client->id,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'motivo' => $servicios[$i % count($servicios)],
                'estado' => $i < 25 ? 'confirmado' : 'pendiente',
            ]);
        }

        $this->command->info("Se crearon 30 turnos para {$user->name} en el negocio {$business->nombre_negocio}");
    }
}
