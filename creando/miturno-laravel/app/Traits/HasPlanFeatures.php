<?php

namespace App\Traits;

use App\Models\Plan;
use App\Models\Subscription;

/**
 * Trait para verificar features del plan del usuario
 *
 * Uso en controllers:
 *   use HasPlanFeatures;
 *
 *   $plan = $this->getUserPlan($user);
 *   if (!$this->canUseFeature($user, 'whatsapp_enabled')) { ... }
 *   if ($this->hasReachedAppointmentLimit($user)) { ... }
 */
trait HasPlanFeatures
{
    /**
     * Obtener el plan actual del usuario
     */
    protected function getUserPlan($user): Plan
    {
        $subscription = Subscription::where('user_id', $user->id)
            ->active()
            ->with('plan')
            ->first();

        if ($subscription && $subscription->plan) {
            return $subscription->plan;
        }

        // Retornar plan FREE por defecto
        return Plan::where('name', 'free')->first() ?? $this->getDefaultFreePlan();
    }

    /**
     * Plan FREE por defecto si no existe en BD
     */
    private function getDefaultFreePlan(): Plan
    {
        $plan = new Plan();
        $plan->name = 'free';
        $plan->display_name = 'FREE';
        $plan->appointments_limit = 30;
        $plan->professionals_limit = 1;
        $plan->email_reminders = false;
        $plan->whatsapp_enabled = false;
        $plan->public_page = true;
        $plan->priority_support = false;
        $plan->advanced_reports = false;
        return $plan;
    }

    /**
     * Verificar si el usuario puede usar una feature específica
     *
     * @param mixed $user
     * @param string $feature - Nombre del campo: email_reminders, whatsapp_enabled, etc.
     */
    protected function canUseFeature($user, string $feature): bool
    {
        $plan = $this->getUserPlan($user);
        return (bool) ($plan->{$feature} ?? false);
    }

    /**
     * Verificar si el usuario ha alcanzado el límite de turnos del mes
     */
    protected function hasReachedAppointmentLimit($user): bool
    {
        $plan = $this->getUserPlan($user);

        // null = sin límite (planes de pago)
        if ($plan->appointments_limit === null) {
            return false;
        }

        // Contar turnos del mes actual
        $business = $user->business;
        if (!$business) {
            return false;
        }

        $count = $business->appointments()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return $count >= $plan->appointments_limit;
    }

    /**
     * Obtener cuántos turnos quedan disponibles este mes
     */
    protected function getRemainingAppointments($user): ?int
    {
        $plan = $this->getUserPlan($user);

        // null = ilimitados
        if ($plan->appointments_limit === null) {
            return null;
        }

        $business = $user->business;
        if (!$business) {
            return $plan->appointments_limit;
        }

        $count = $business->appointments()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return max(0, $plan->appointments_limit - $count);
    }

    /**
     * Obtener todas las features del plan como array
     */
    protected function getPlanFeatures($user): array
    {
        $plan = $this->getUserPlan($user);

        return [
            'plan_name' => $plan->name,
            'plan_display_name' => $plan->display_name,
            'appointments_limit' => $plan->appointments_limit,
            'appointments_remaining' => $this->getRemainingAppointments($user),
            'professionals_limit' => $plan->professionals_limit,
            'email_reminders' => (bool) $plan->email_reminders,
            'whatsapp_enabled' => (bool) $plan->whatsapp_enabled,
            'public_page' => (bool) $plan->public_page,
            'priority_support' => (bool) $plan->priority_support,
            'advanced_reports' => (bool) $plan->advanced_reports,
        ];
    }
}
