<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'price',
        'currency',
        'appointments_limit',
        'professionals_limit',
        'email_reminders',
        'whatsapp_enabled',
        'public_page',
        'priority_support',
        'advanced_reports',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'email_reminders' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'public_page' => 'boolean',
        'priority_support' => 'boolean',
        'advanced_reports' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function isFree()
    {
        return $this->price == 0;
    }
}
