# Registro de Pruebas - Sistema de Turnos

---

## Pruebas Backend API - 12/12/2025

### Configuración de pruebas
- **Servidor:** `php artisan serve` en `http://127.0.0.1:8000`
- **Base de datos:** MySQL - `miturno_laravel`
- **Autenticación:** Laravel Sanctum (Bearer Token)

---

### 1. Autenticación

#### POST /api/register
**Estado:** ✅ EXITOSO

```json
// Request
{
    "name": "Ana",
    "email": "ana@test.com",
    "password": "123456",
    "nombre_negocio": "Peluqueria Ana"
}

// Response (201)
{
    "message": "Usuario registrado correctamente",
    "user": { "id": 1, "name": "Ana", "email": "ana@test.com" },
    "business": { "id": 1, "slug": "peluqueria-ana-1" },
    "token": "1|abc123..."
}
```

#### POST /api/login
**Estado:** ✅ EXITOSO

```json
// Request
{
    "email": "ana@test.com",
    "password": "123456"
}

// Response (200)
{
    "message": "Inicio de sesión exitoso",
    "user": { ... },
    "token": "2|xyz789..."
}
```

---

### 2. Rutas Protegidas (con Bearer Token)

#### GET /api/me
**Estado:** ✅ EXITOSO

```json
// Response
{
    "id": 1,
    "name": "Ana",
    "email": "ana@test.com",
    "business": {
        "id": 1,
        "nombre_negocio": "Peluqueria Ana",
        "slug": "peluqueria-ana-1",
        "setting": {
            "intervalo_turnos": 30,
            "notificaciones_email": true
        }
    }
}
```

#### PUT /api/business/hours
**Estado:** ✅ EXITOSO

```json
// Request
{
    "horarios": [
        { "dia_semana": 1, "hora_inicio": "09:00", "hora_fin": "18:00" },
        { "dia_semana": 2, "hora_inicio": "09:00", "hora_fin": "18:00" },
        { "dia_semana": 3, "hora_inicio": "09:00", "hora_fin": "18:00" },
        { "dia_semana": 4, "hora_inicio": "09:00", "hora_fin": "18:00" },
        { "dia_semana": 5, "hora_inicio": "09:00", "hora_fin": "18:00" }
    ]
}

// Response
{
    "message": "Horarios actualizados correctamente",
    "horarios": [ /* 5 registros creados */ ]
}
```

#### GET /api/appointments
**Estado:** ✅ EXITOSO

```json
// Response
[
    {
        "id": 1,
        "fecha_inicio": "2025-12-15T10:00:00.000000Z",
        "fecha_fin": "2025-12-15T10:30:00.000000Z",
        "estado": "confirmado",
        "motivo": "Corte de pelo",
        "client": {
            "nombre": "María García",
            "telefono": "1122334455"
        }
    }
]
```

#### GET /api/clients
**Estado:** ✅ EXITOSO

```json
// Response
[
    {
        "id": 1,
        "nombre": "María García",
        "telefono": "1122334455",
        "appointments_count": 1
    }
]
```

---

### 3. Rutas Públicas (sin autenticación)

#### GET /api/negocio/{slug}/slots?fecha=2025-12-15
**Estado:** ✅ EXITOSO

```json
// Response
{
    "fecha": "2025-12-15",
    "slots": [
        { "hora_inicio": "09:00", "hora_fin": "09:30", "disponible": true },
        { "hora_inicio": "09:30", "hora_fin": "10:00", "disponible": true },
        { "hora_inicio": "10:00", "hora_fin": "10:30", "disponible": false },  // OCUPADO
        { "hora_inicio": "10:30", "hora_fin": "11:00", "disponible": true },
        // ... más slots hasta las 18:00
    ]
}
```

**Nota:** El slot 10:00-10:30 aparece como `disponible: false` porque tiene el turno de María García.

---

### Datos de Prueba Creados

| Entidad | Datos |
|---------|-------|
| Usuario | Ana (ana@test.com / 123456) |
| Negocio | Peluquería Ana (slug: peluqueria-ana-1) |
| Cliente | María García (tel: 1122334455) |
| Turno | 15/12/2025 10:00-10:30 - Corte de pelo |
| Horarios | Lun-Vie 09:00-18:00 |

---

### Endpoints Probados (16/12/2025)

- [x] POST /api/appointments (crear turno desde panel)
- [x] PUT /api/appointments/{id} (actualizar turno)
- [x] POST /api/appointments/{id}/cancel (cancelar turno)
- [x] POST /api/negocio/{slug}/turno (reserva pública)
- [x] PUT /api/business (actualizar negocio)
- [x] PUT /api/business/settings (actualizar config)
- [x] CRUD completo de clientes
