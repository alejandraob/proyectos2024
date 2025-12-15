# Backend Laravel - Paso a Paso

Guía completa para crear el backend del Sistema de Turnos.

---

## Paso 1: Migraciones (Estructura de la Base de Datos)

Las migraciones definen la estructura de las tablas en la base de datos.

### 1.1 Crear las migraciones

```bash
php artisan make:migration create_businesses_table
php artisan make:migration create_clients_table
php artisan make:migration create_appointments_table
php artisan make:migration create_business_hours_table
php artisan make:migration create_settings_table
```

### 1.2 Estructura de cada tabla

#### Tabla `users` (ya existe, solo agregar campo)
```php
$table->id();
$table->string('name');
$table->string('email')->unique();
$table->timestamp('email_verified_at')->nullable();
$table->string('password');
$table->string('telefono')->nullable();  // Campo agregado
$table->rememberToken();
$table->timestamps();
```

#### Tabla `businesses`
```php
$table->id();
$table->foreignId('user_id')->constrained()->onDelete('cascade');
$table->string('nombre_negocio');
$table->string('rubro')->nullable();
$table->string('direccion')->nullable();
$table->string('slug')->unique();  // URL pública: /mi-pelu
$table->string('timezone')->default('America/Argentina/Buenos_Aires');
$table->timestamps();
```

#### Tabla `clients`
```php
$table->id();
$table->foreignId('business_id')->constrained()->onDelete('cascade');
$table->string('nombre');
$table->string('telefono')->nullable();
$table->string('email')->nullable();
$table->timestamps();
```

#### Tabla `appointments`
```php
$table->id();
$table->foreignId('business_id')->constrained()->onDelete('cascade');
$table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
$table->dateTime('fecha_inicio');
$table->dateTime('fecha_fin');
$table->enum('estado', ['pendiente', 'confirmado', 'cancelado'])->default('pendiente');
$table->string('motivo')->nullable();
$table->enum('origen', ['manual', 'web'])->default('manual');
$table->timestamps();
```

#### Tabla `business_hours`
```php
$table->id();
$table->foreignId('business_id')->constrained()->onDelete('cascade');
$table->tinyInteger('dia_semana');  // 0=Domingo, 1=Lunes, ... 6=Sábado
$table->time('hora_inicio');
$table->time('hora_fin');
$table->timestamps();
```

#### Tabla `settings`
```php
$table->id();
$table->foreignId('business_id')->constrained()->onDelete('cascade');
$table->boolean('notificaciones_whatsapp')->default(false);
$table->boolean('notificaciones_email')->default(true);
$table->integer('intervalo_turnos')->default(30);  // minutos: 15, 30, 45, 60
$table->timestamps();
```

### 1.3 Configurar conexión a la base de datos

En el archivo `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=miturno_laravel
DB_USERNAME=root
DB_PASSWORD=
```

### 1.4 Ejecutar las migraciones

```bash
php artisan migrate
```

---

## Paso 2: Modelos

Los modelos representan las tablas y definen las relaciones entre ellas.

### 2.1 Crear los modelos

```bash
php artisan make:model Business
php artisan make:model Client
php artisan make:model Appointment
php artisan make:model BusinessHour
php artisan make:model Setting
```

### 2.2 Estructura de cada modelo

#### User.php
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'telefono',
];

// Un usuario tiene un negocio
public function business()
{
    return $this->hasOne(Business::class);
}
```

#### Business.php
```php
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
```

#### Client.php
```php
protected $fillable = [
    'business_id',
    'nombre',
    'telefono',
    'email',
];

public function business()
{
    return $this->belongsTo(Business::class);
}

public function appointments()
{
    return $this->hasMany(Appointment::class);
}
```

#### Appointment.php
```php
protected $fillable = [
    'business_id',
    'client_id',
    'fecha_inicio',
    'fecha_fin',
    'estado',
    'motivo',
    'origen',
];

protected $casts = [
    'fecha_inicio' => 'datetime',
    'fecha_fin' => 'datetime',
];

public function business()
{
    return $this->belongsTo(Business::class);
}

public function client()
{
    return $this->belongsTo(Client::class);
}
```

#### BusinessHour.php
```php
protected $fillable = [
    'business_id',
    'dia_semana',
    'hora_inicio',
    'hora_fin',
];

public function business()
{
    return $this->belongsTo(Business::class);
}
```

#### Setting.php
```php
protected $fillable = [
    'business_id',
    'notificaciones_whatsapp',
    'notificaciones_email',
    'intervalo_turnos',
];

protected $casts = [
    'notificaciones_whatsapp' => 'boolean',
    'notificaciones_email' => 'boolean',
];

public function business()
{
    return $this->belongsTo(Business::class);
}
```

### 2.3 Diagrama de relaciones

```
User (1) ──────── (1) Business
                       │
                       ├── (1) Setting
                       ├── (N) BusinessHour
                       ├── (N) Client ──── (N) Appointment
                       └── (N) Appointment
```

---

## Paso 3: Controllers

Los controllers manejan la lógica de las peticiones HTTP.

### 3.1 Crear los controllers

```bash
php artisan make:controller AuthController
php artisan make:controller BusinessController
php artisan make:controller ClientController
php artisan make:controller AppointmentController
```

### 3.2 Métodos de cada controller

#### AuthController
| Método | Descripción |
|--------|-------------|
| `register()` | Registra usuario + negocio + settings |
| `login()` | Autentica y retorna token |
| `logout()` | Elimina el token actual |
| `me()` | Retorna usuario autenticado con su negocio |

#### BusinessController
| Método | Descripción |
|--------|-------------|
| `show()` | Obtiene datos del negocio del usuario |
| `update()` | Actualiza nombre, rubro, dirección |
| `updateHours()` | Guarda horarios de atención |
| `updateSettings()` | Actualiza configuración |
| `getBySlug()` | Obtiene negocio por slug (público) |

#### ClientController
| Método | Descripción |
|--------|-------------|
| `index()` | Lista todos los clientes |
| `store()` | Crea un nuevo cliente |
| `show()` | Muestra un cliente con sus turnos |
| `update()` | Actualiza datos del cliente |
| `destroy()` | Elimina un cliente |

#### AppointmentController
| Método | Descripción |
|--------|-------------|
| `index()` | Lista turnos (con filtros por fecha/estado) |
| `store()` | Crea turno desde el panel |
| `storePublic()` | Crea turno desde la web pública |
| `show()` | Muestra un turno |
| `update()` | Actualiza un turno |
| `cancel()` | Cancela un turno |
| `availableSlots()` | Retorna horarios disponibles para un día |

---

## Paso 4: Rutas API

Todas las rutas tienen el prefijo `/api` automáticamente.

### 4.1 Rutas públicas (sin autenticación)

```php
// Autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Para clientes finales
Route::get('/negocio/{slug}', [BusinessController::class, 'getBySlug']);
Route::get('/negocio/{slug}/slots', [AppointmentController::class, 'availableSlots']);
Route::post('/negocio/{slug}/turno', [AppointmentController::class, 'storePublic']);
```

### 4.2 Rutas protegidas (requieren token)

```php
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Negocio
    Route::get('/business', [BusinessController::class, 'show']);
    Route::put('/business', [BusinessController::class, 'update']);
    Route::put('/business/hours', [BusinessController::class, 'updateHours']);
    Route::put('/business/settings', [BusinessController::class, 'updateSettings']);

    // Clientes
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

    // Turnos
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
});
```

---

## Paso 5: Probar la API

### 5.1 Registrar un usuario

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana",
    "email": "ana@test.com",
    "password": "123456",
    "nombre_negocio": "Peluquería Ana"
  }'
```

**Respuesta:**
```json
{
  "message": "Usuario registrado correctamente",
  "user": { "id": 1, "name": "Ana", ... },
  "business": { "id": 1, "slug": "peluqueria-ana-1", ... },
  "token": "1|abc123..."
}
```

### 5.2 Iniciar sesión

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@test.com",
    "password": "123456"
  }'
```

### 5.3 Usar rutas protegidas

Agregar el header `Authorization: Bearer {token}`:

```bash
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer 1|abc123..."
```

### 5.4 Crear un turno

```bash
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "fecha_inicio": "2024-01-15 10:00:00",
    "fecha_fin": "2024-01-15 10:30:00",
    "nombre_cliente": "María García",
    "telefono_cliente": "1122334455",
    "motivo": "Corte de pelo"
  }'
```

### 5.5 Configurar horarios

```bash
curl -X PUT http://localhost:8000/api/business/hours \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "horarios": [
      { "dia_semana": 1, "hora_inicio": "09:00", "hora_fin": "18:00" },
      { "dia_semana": 2, "hora_inicio": "09:00", "hora_fin": "18:00" },
      { "dia_semana": 3, "hora_inicio": "09:00", "hora_fin": "18:00" },
      { "dia_semana": 4, "hora_inicio": "09:00", "hora_fin": "18:00" },
      { "dia_semana": 5, "hora_inicio": "09:00", "hora_fin": "18:00" }
    ]
  }'
```

---

## Resumen de archivos creados/modificados

```
database/migrations/
├── 2014_10_12_000000_create_users_table.php (modificado)
├── 2025_xx_xx_create_businesses_table.php
├── 2025_xx_xx_create_clients_table.php
├── 2025_xx_xx_create_appointments_table.php
├── 2025_xx_xx_create_business_hours_table.php
└── 2025_xx_xx_create_settings_table.php

app/Models/
├── User.php (modificado)
├── Business.php
├── Client.php
├── Appointment.php
├── BusinessHour.php
└── Setting.php

app/Http/Controllers/
├── AuthController.php
├── BusinessController.php
├── ClientController.php
└── AppointmentController.php

routes/
└── api.php (modificado)
```
