<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nombre_negocio',
        'rubro',
        'direccion',
        'slug',
        'timezone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function businessHours()
    {
        return $this->hasMany(BusinessHour::class);
    }

    public function setting()
    {
        return $this->hasOne(Setting::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
