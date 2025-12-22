<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ServicePayment;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ServicePaymentsSeeder extends Seeder
{
    /**
     * Crear pagos de prueba para los negocios existentes
     */
    public function run(): void
    {
        $users = User::with('business')->get();

        foreach ($users as $user) {
            $business = $user->business;

            if (!$business) {
                continue;
            }

            // Obtener clientes y servicios del negocio
            $clients = Client::where('business_id', $business->id)->get();
            $services = Service::where('business_id', $business->id)->get();

            if ($clients->isEmpty()) {
                $this->command->info("Negocio {$business->nombre_negocio} no tiene clientes, omitiendo...");
                continue;
            }

            $metodosPago = ['efectivo', 'tarjeta', 'transferencia', 'mercadopago'];
            $estados = ['pagado', 'pagado', 'pagado', 'pendiente']; // Mayoría pagados

            // Crear pagos para los últimos 3 meses
            for ($month = 0; $month < 3; $month++) {
                $baseDate = Carbon::now()->subMonths($month);
                $numPayments = rand(8, 20); // Entre 8 y 20 pagos por mes

                for ($i = 0; $i < $numPayments; $i++) {
                    $client = $clients->random();
                    $service = $services->isNotEmpty() ? $services->random() : null;
                    $monto = $service ? $service->precio : rand(500, 5000);

                    // Fecha aleatoria dentro del mes
                    $dia = rand(1, min(28, $baseDate->daysInMonth));
                    $fechaPago = $baseDate->copy()->day($dia);

                    ServicePayment::create([
                        'business_id' => $business->id,
                        'client_id' => $client->id,
                        'service_id' => $service?->id,
                        'monto' => $monto,
                        'metodo_pago' => $metodosPago[array_rand($metodosPago)],
                        'estado' => $estados[array_rand($estados)],
                        'descripcion' => $service ? null : 'Servicio personalizado',
                        'fecha_pago' => $fechaPago->toDateString(),
                    ]);
                }
            }

            $totalPagos = ServicePayment::where('business_id', $business->id)->count();
            $this->command->info("Se crearon {$totalPagos} pagos para {$business->nombre_negocio}");
        }
    }
}
