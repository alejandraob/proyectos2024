# TodoList Backend - Sistema de Turnos

---

## Completado ✅

### Paso 1: Base de Datos (12/12/2025)
- [x] Migración tabla `users` (campo telefono agregado)
- [x] Migración tabla `businesses`
- [x] Migración tabla `clients`
- [x] Migración tabla `appointments`
- [x] Migración tabla `business_hours`
- [x] Migración tabla `settings`
- [x] Ejecutar migraciones

### Paso 2: Modelos (12/12/2025)
- [x] Modelo User con relación a Business
- [x] Modelo Business con relaciones
- [x] Modelo Client con relaciones
- [x] Modelo Appointment con relaciones
- [x] Modelo BusinessHour
- [x] Modelo Setting

### Paso 3: Controllers (12/12/2025)
- [x] AuthController (register, login, logout, me, forgotPassword)
- [x] BusinessController (show, update, updateHours, updateSettings, getBySlug, stats)
- [x] ClientController (index, store, show, update, destroy)
- [x] AppointmentController (index, store, storePublic, show, update, cancel, availableSlots)

### Paso 4: Rutas API (12/12/2025)
- [x] Rutas públicas de autenticación
- [x] Rutas públicas para clientes (reservas)
- [x] Rutas protegidas con Sanctum

### Paso 5: Pruebas (12/12/2025)
- [x] Test registro de usuario
- [x] Test login
- [x] Test /api/me
- [x] Test configuración de horarios
- [x] Test listado de turnos
- [x] Test listado de clientes
- [x] Test slots disponibles (público)

### Paso 6: Mejoras de Autenticación (15/12/2025)
- [x] Endpoint POST /forgot-password (simulado, sin envío real de email)
- [x] Login devuelve business.setting con color_theme
- [x] Migración add_color_theme_to_settings_table
- [x] Campo color_theme en modelo Setting
- [x] Validación de color_theme en updateSettings

### Mejoras de Seguridad (15/12/2025)
- [x] Validar que client_id pertenezca al business en AppointmentController
- [x] Rate limiting en rutas de autenticación - 5 intentos/minuto
- [x] Validación de fechas futuras para turnos - after_or_equal:today

### Funcionalidades Adicionales (15/12/2025)
- [x] Endpoint para estadísticas del negocio (GET /business/stats)
- [x] Búsqueda de clientes por nombre/teléfono (GET /clients?buscar=)
- [x] Filtro de turnos por cliente (GET /appointments?client_id=)
- [x] Soft deletes para turnos cancelados

### Notificaciones por Email (16/12/2025)
- [x] Configurar SMTP con Gmail
- [x] Mailable NuevoTurnoMail (notifica al profesional)
- [x] Mailable TurnoConfirmadoMail (notifica al cliente)
- [x] Mailable TurnoCanceladoMail (notifica al cliente)
- [x] Templates Blade con markdown para emails
- [x] Integración en AppointmentController (storePublic, update, cancel)
- [x] Validación de notificaciones_email activadas
- [x] Manejo de errores con try/catch y Log::error

### Mejoras AppointmentController (16/12/2025)
- [x] Método update() acepta nombre_cliente y telefono_cliente
- [x] Actualización de datos del cliente asociado al turno
- [x] Timezone configurado a America/Argentina/Buenos_Aires

### Sistema de Servicios (16/12/2025)
- [x] Migración tabla `services` (business_id, nombre, precio, duracion, activo)
- [x] Migración add_service_id_to_appointments_table
- [x] Modelo Service con relaciones (belongsTo Business, hasMany Appointments)
- [x] Relación services() en modelo Business
- [x] Relación service() en modelo Appointment
- [x] ServiceController (index, store, show, update, destroy, getBySlug)
- [x] Rutas API protegidas: GET/POST/PUT/DELETE /services
- [x] Ruta pública: GET /negocio/{slug}/services
- [x] AppointmentController actualizado para manejar service_id
- [x] Scope activos() en modelo Service

### Frontend - Sistema de Servicios (16/12/2025)
- [x] servicesService en api.js (getAll, getOne, create, update, delete, getBySlug)
- [x] CRUD de servicios en Configuracion.vue
- [x] Dropdown de servicios en Agenda.vue con auto-duración
- [x] Dropdown de servicios en Reservar.vue (página pública)
- [x] Visualización de servicio en tabla y calendario de Agenda

### Recordatorios Automáticos (16/12/2025)
- [x] RecordatorioTurnoMail Mailable (notifica al cliente 24h antes)
- [x] Template recordatorio-turno.blade.php con detalles del turno
- [x] Comando artisan `turnos:enviar-recordatorios`
- [x] Scheduler configurado en Kernel.php (diario a las 9:00 AM Argentina)
- [x] Filtro por turnos de mañana con estado pendiente/confirmado
- [x] Validación de notificaciones_email activadas
- [x] Logging de errores y estadísticas de envío

### Integración WhatsApp con Twilio (16/12/2025)
- [x] Instalar SDK de Twilio (twilio/sdk)
- [x] Configurar credenciales en .env y config/services.php
- [x] Crear WhatsAppService con métodos de envío
- [x] Integrar en AppointmentController (nuevo turno, confirmación, cancelación)
- [x] Integrar en SendAppointmentReminders (recordatorios 24h)
- [x] Formateo automático de números argentinos (+549)
- [x] Toggle de notificaciones WhatsApp en Configuración (frontend)

---

## Pendiente 📋

(Sin tareas pendientes)

---

## Notas Técnicas

### Estructura de archivos creados
```
app/
├── Http/Controllers/
│   ├── AuthController.php
│   ├── BusinessController.php
│   ├── ClientController.php
│   ├── AppointmentController.php
│   └── ServiceController.php
├── Console/
│   ├── Kernel.php (scheduler configurado)
│   └── Commands/
│       └── SendAppointmentReminders.php
├── Mail/
│   ├── NuevoTurnoMail.php
│   ├── TurnoConfirmadoMail.php
│   ├── TurnoCanceladoMail.php
│   └── RecordatorioTurnoMail.php
├── Services/
│   └── WhatsAppService.php
├── Models/
│   ├── User.php (modificado)
│   ├── Business.php
│   ├── Client.php
│   ├── Appointment.php
│   ├── BusinessHour.php
│   ├── Setting.php
│   └── Service.php

resources/
├── views/emails/
│   ├── nuevo-turno.blade.php
│   ├── turno-confirmado.blade.php
│   ├── turno-cancelado.blade.php
│   └── recordatorio-turno.blade.php
├── js/
│   ├── services/api.js
│   └── pages/
│       ├── Agenda.vue
│       ├── Configuracion.vue
│       ├── Reservar.vue
│       └── ...

database/migrations/
├── create_businesses_table.php
├── create_clients_table.php
├── create_appointments_table.php
├── create_business_hours_table.php
├── create_settings_table.php
├── create_services_table.php
├── add_color_theme_to_settings_table.php
├── add_soft_deletes_to_appointments_table.php
└── add_service_id_to_appointments_table.php

routes/
└── api.php
```

### Endpoints API

#### Públicos (sin autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/register | Registro de profesional |
| POST | /api/login | Inicio de sesión |
| POST | /api/forgot-password | Recuperar contraseña |
| GET | /api/negocio/{slug} | Ver datos del negocio |
| GET | /api/negocio/{slug}/slots | Ver horarios disponibles |
| GET | /api/negocio/{slug}/services | Ver servicios disponibles |
| POST | /api/negocio/{slug}/turno | Solicitar turno |

#### Protegidos (requieren token)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/logout | Cerrar sesión |
| GET | /api/me | Obtener usuario actual |
| GET | /api/business | Ver mi negocio |
| GET | /api/business/stats | Estadísticas del negocio |
| PUT | /api/business | Actualizar datos del negocio |
| PUT | /api/business/hours | Actualizar horarios |
| PUT | /api/business/settings | Actualizar configuración |
| GET | /api/clients | Listar clientes |
| POST | /api/clients | Crear cliente |
| GET | /api/clients/{id} | Ver cliente |
| PUT | /api/clients/{id} | Actualizar cliente |
| DELETE | /api/clients/{id} | Eliminar cliente |
| GET | /api/appointments | Listar turnos |
| POST | /api/appointments | Crear turno |
| GET | /api/appointments/{id} | Ver turno |
| PUT | /api/appointments/{id} | Actualizar turno |
| POST | /api/appointments/{id}/cancel | Cancelar turno |
| GET | /api/services | Listar servicios |
| POST | /api/services | Crear servicio |
| GET | /api/services/{id} | Ver servicio |
| PUT | /api/services/{id} | Actualizar servicio |
| DELETE | /api/services/{id} | Eliminar servicio |

### Comandos útiles
```bash
# Ejecutar migraciones
php artisan migrate

# Revertir migraciones
php artisan migrate:rollback

# Limpiar caché
php artisan cache:clear
php artisan config:clear

# Generar token de prueba
php artisan tinker
>>> $user = User::first();
>>> $user->createToken('test')->plainTextToken;

# Ejecutar servidor de desarrollo
php artisan serve

# Compilar frontend
npm run dev
npm run build

# Recordatorios de turnos
php artisan turnos:enviar-recordatorios

# Ejecutar scheduler (para producción)
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```
