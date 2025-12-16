<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'notificaciones_whatsapp',
        'notificaciones_email',
        'intervalo_turnos',
        'color_theme',
    ];

    protected $casts = [
        'notificaciones_whatsapp' => 'boolean',
        'notificaciones_email' => 'boolean',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
