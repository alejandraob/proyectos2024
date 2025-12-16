<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'nombre',
        'precio',
        'duracion',
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'duracion' => 'integer',
        'activo' => 'boolean',
    ];

    /**
     * El negocio al que pertenece el servicio
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Turnos que tienen este servicio
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Scope para servicios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
