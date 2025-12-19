<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'free',
                'display_name' => 'FREE',
                'description' => 'Plan gratuito con funciones basicas',
                'price' => 0,
                'currency' => 'ARS',
                'appointments_limit' => 30,
                'professionals_limit' => 1,
                'email_reminders' => false,
                'whatsapp_enabled' => false,
                'public_page' => true,
                'priority_support' => false,
                'advanced_reports' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'pro',
                'display_name' => 'PRO',
                'description' => 'Para profesionales que quieren crecer',
                'price' => 3500,
                'currency' => 'ARS',
                'appointments_limit' => null,
                'professionals_limit' => 1,
                'email_reminders' => true,
                'whatsapp_enabled' => false,
                'public_page' => true,
                'priority_support' => false,
                'advanced_reports' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'premium',
                'display_name' => 'PREMIUM',
                'description' => 'Para equipos y negocios establecidos',
                'price' => 7000,
                'currency' => 'ARS',
                'appointments_limit' => null,
                'professionals_limit' => 5,
                'email_reminders' => true,
                'whatsapp_enabled' => true,
                'public_page' => true,
                'priority_support' => true,
                'advanced_reports' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
