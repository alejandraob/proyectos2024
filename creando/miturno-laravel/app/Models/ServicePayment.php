<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'client_id',
        'appointment_id',
        'service_id',
        'monto',
        'metodo_pago',
        'estado',
        'descripcion',
        'referencia',
        'fecha_pago',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'date',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function scopePagados($query)
    {
        return $query->where('estado', 'pagado');
    }

    public function scopeDelMes($query, $year = null, $month = null)
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        return $query->whereYear('fecha_pago', $year)
                     ->whereMonth('fecha_pago', $month);
    }

    public function scopeDelPeriodo($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_pago', [$fechaInicio, $fechaFin]);
    }
}
