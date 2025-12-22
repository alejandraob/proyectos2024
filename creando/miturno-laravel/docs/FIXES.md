# Registro de Fixes - Sistema de Turnos

Historial de errores encontrados y sus soluciones.

---

## Fix #001 - Vue.js no renderiza (12/12/2025)

### Problema
La página mostraba blanco después de configurar Vue.js. La aplicación no se montaba.

### Causa
Error en `main.js`: el método `.mount()` se llamaba antes de `.use(router)`.

### Código incorrecto
```javascript
createApp(App).mount('#app').use(router)
```

### Solución
```javascript
createApp(App).use(router).mount('#app')
```

### Archivos modificados
- `resources/js/main.js`

---

## Fix #002 - Vue Router no instalado (12/12/2025)

### Problema
Error en consola: `Cannot find module 'vue-router'`

### Causa
Vue Router no estaba instalado como dependencia.

### Solución
```bash
npm install vue-router@4
```

---

## Fix #003 - SPA no cargaba en rutas (12/12/2025)

### Problema
Al navegar a `/dashboard` o cualquier ruta Vue, Laravel retornaba 404.

### Causa
Faltaba la configuración catch-all en `routes/web.php` para servir la SPA.

### Solución
```php
// routes/web.php
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');
```

### Archivos modificados
- `routes/web.php`
- Creado: `resources/views/spa.blade.php`

---

## Fix #004 - Case sensitivity en imports Vue (12/12/2025)

### Problema
Algunos archivos .vue no se encontraban al importar.

### Causa
Diferencia de mayúsculas/minúsculas entre nombre de archivo e import.
- Archivo: `home.vue`
- Import: `import Home from './pages/Home.vue'`

### Solución
Renombrar archivos para que coincidan con los imports (primera letra mayúscula):
- `home.vue` → `Home.vue`
- `login.vue` → `Login.vue`
- etc.

---

## Fix #005 - PowerShell curl syntax (12/12/2025)

### Problema
Los comandos curl del tutorial no funcionaban en PowerShell de Windows.

### Causa
PowerShell tiene su propio alias `curl` que apunta a `Invoke-WebRequest`, con sintaxis diferente.

### Solución
Usar `Invoke-RestMethod` de PowerShell:

```powershell
# En lugar de:
curl -X POST http://localhost:8000/api/login -d '{"email":"ana@test.com"}'

# Usar:
$body = @{ email = "ana@test.com"; password = "123456" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method POST -Body $body -ContentType "application/json"
```

---

## Fix #006 - Responsive de horarios cortado (15/12/2025)

### Problema
En la página de Configuración, los inputs de hora para Lunes, Miércoles y Viernes se cortaban en pantallas medianas. El grid de 2 columnas con anchos fijos no se adaptaba correctamente.

### Causa
El uso de `grid-cols-2` genérico con estilos inline de ancho fijo (`style="width: 120px;"`) causaba overflow en la segunda columna.

### Código problemático
```vue
<div class="grid grid-cols-2 gap-4">
    <div v-for="dia in dias" class="flex items-center gap-3">
        <label style="width: 120px;">...</label>
        <input style="width: 120px;" />
        <input style="width: 120px;" />
    </div>
</div>
```

### Solución
Crear clases CSS específicas con breakpoints responsive:

```css
/* CSS */
.horarios-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
}

.horario-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
    background-color: var(--color-bg-light);
    border-radius: var(--radius-md);
}

@media (max-width: 1024px) {
    .horarios-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .horario-row {
        flex-direction: column;
        align-items: flex-start;
    }
}
```

### Archivos modificados
- `resources/css/app.css` (nueva sección 16)
- `resources/js/pages/Configuracion.vue`

---

## Fix #007 - Import en terminal de Windows (15/12/2025)

### Problema
Al intentar usar PrimeVue, el usuario ejecutó `import Toast from 'primevue/toast'` directamente en la terminal, obteniendo error: "import no se reconoce como nombre de un cmdlet".

### Causa
El código JavaScript (`import`) se intentó ejecutar en PowerShell/CMD en lugar de escribirlo en un archivo `.js` o `.vue`.

### Solución
Los imports de JavaScript van dentro de archivos, no en la terminal:

```javascript
// Esto va en un archivo .js o .vue, NO en la terminal
import Toast from 'primevue/toast'
```

Para instalar paquetes desde terminal:
```bash
npm install primevue @primevue/themes
```

---

## Fix #008 - SpeedDial para acciones en Agenda (15/12/2025)

### Mejora
Los botones de acción individuales (Editar, Confirmar, Pendiente, Cancelar) ocupaban mucho espacio en la tabla de turnos.

### Solución
Implementar el componente SpeedDial de PrimeVue que agrupa las acciones en un menú desplegable:

```vue
<SpeedDial
    :model="getAcciones(turno)"
    direction="right"
    :tooltipOptions="{ position: 'top' }"
    showIcon="pi pi-bars"
    hideIcon="pi pi-times"
/>
```

Las acciones se generan dinámicamente según el estado del turno:
- **Editar**: disponible excepto en cancelados
- **Confirmar**: solo para pendientes
- **Pendiente**: solo para confirmados
- **Cancelar**: disponible excepto en cancelados

### Dependencias agregadas
```bash
npm install primeicons
```

### Archivos modificados
- `resources/js/pages/Agenda.vue` (SpeedDial + función getAcciones)
- `resources/js/main.js` (import primeicons/primeicons.css)

---

## Fix #009 - Dark mode abre sidebar en móvil (15/12/2025)

### Problema
En dispositivos móviles (probado con Responsively App en iPhone 12), al tocar el botón de dark mode (sol/luna) en el header, se abría el sidebar en lugar de cambiar el tema.

### Causa
Múltiples factores contribuían al problema:
1. **Áreas táctiles superpuestas**: Los botones de 40x40px eran más pequeños que el mínimo recomendado de 44x44px para iOS
2. **Propagación de eventos**: Los eventos de click podían propagarse entre elementos
3. **Compresión de layout**: En pantallas pequeñas, el título de la página empujaba los elementos causando superposición

### Solución
1. **Aumentar tamaño de botones** a 44x44px (estándar iOS):
```css
.btn-hamburger, .btn-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
}
```

2. **Prevenir propagación de eventos** en Vue:
```vue
<button @click.stop.prevent="toggleDarkMode" type="button">
<button @click.stop.prevent="toggleSidebar" type="button">
```

3. **Optimizar para touch** en CSS:
```css
-webkit-tap-highlight-color: transparent;
touch-action: manipulation;
position: relative;
z-index: 10;
```

4. **Evitar compresión de elementos**:
```css
.header-left, .header-actions {
    flex-shrink: 0;
}

/* En móviles pequeños */
.page-title {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

### Archivos modificados
- `resources/js/components/layout/MainLayout.vue` (botones con .stop.prevent, estilos scoped)
- `resources/css/app.css` (media query 480px para header)

---

## Feature #010 - Recuperar contraseña (15/12/2025)

### Descripción
Implementación de funcionalidad "Olvidé mi contraseña" para mejorar la experiencia cuando un usuario no recuerda sus credenciales.

### Funcionalidad
1. **Login mejorado**: Cuando hay error 401 (credenciales inválidas), se muestra un link "¿Olvidaste tu contraseña? Recuperala aquí".

2. **Página de recuperación** (`/forgot-password`): Formulario para ingresar email y solicitar recuperación.

3. **Seguridad**: El backend siempre responde con éxito (no revela si el email existe en el sistema).

4. **Nota**: El envío real de email está pendiente (marcado con TODO). Por ahora solo se loguea la solicitud.

### Archivos creados/modificados
- `resources/js/pages/ForgotPassword.vue` (nueva página)
- `resources/js/pages/Login.vue` (link a recuperar cuando hay error 401)
- `resources/js/router/index.js` (ruta /forgot-password)
- `resources/js/services/api.js` (método forgotPassword)
- `resources/js/stores/auth.js` (devuelve status en error de login)
- `resources/css/app.css` (estilo .alert-link)
- `app/Http/Controllers/AuthController.php` (método forgotPassword)
- `routes/api.php` (ruta POST /forgot-password)

---

## Fix #011 - Tema de colores compartido entre usuarios (15/12/2025)

### Problema
Al cambiar de usuario, el tema de colores se mantenía del usuario anterior. Por ejemplo: Ana tenía tema "Atardecer", cerraba sesión, Lautaro iniciaba sesión y veía el tema "Atardecer" en lugar de su propio tema "Default".

### Causa
El tema de colores se guardaba únicamente en `localStorage` del navegador, sin asociarlo al usuario. Todos los usuarios del mismo navegador compartían el mismo tema.

### Solución
1. **Nueva migración** para agregar campo `color_theme` a tabla `settings`:
```php
$table->string('color_theme', 50)->default('default');
```

2. **Backend**: Modificar `updateSettings` para aceptar `color_theme` y validar valores permitidos.

3. **Login**: Cargar el tema del usuario al autenticarse:
```javascript
const colorTheme = user.business?.setting?.color_theme || 'default'
document.documentElement.setAttribute('data-theme', colorTheme)
```

4. **Logout**: Resetear tema a default al cerrar sesión.

5. **Configuración**: Guardar tema en backend cuando el usuario lo cambia.

### Archivos modificados
- `database/migrations/2025_12_15_170254_add_color_theme_to_settings_table.php` (nueva migración)
- `app/Models/Setting.php` (agregado color_theme a fillable)
- `app/Http/Controllers/BusinessController.php` (updateSettings acepta color_theme)
- `app/Http/Controllers/AuthController.php` (login carga business.setting)
- `resources/js/stores/auth.js` (aplica tema en login, resetea en logout)
- `resources/js/pages/Configuracion.vue` (guarda tema en backend)

---

## Fix #012 - Validación de client_id en AppointmentController (15/12/2025)

### Problema (Vulnerabilidad de seguridad)
Al crear un turno, se validaba que el `client_id` existiera en la tabla `clients`, pero NO se verificaba que perteneciera al negocio del usuario autenticado.

### Escenario de ataque
1. Ana tiene cliente ID 1 (María) en su negocio
2. Lautaro descubre que existe el cliente ID 1
3. Lautaro crea un turno con `client_id: 1`
4. El turno se crea asociado a María (cliente de otro negocio)

### Solución
Agregar validación explícita antes de crear el turno:
```php
if ($request->client_id) {
    $clienteValido = $business->clients()->where('id', $request->client_id)->exists();
    if (!$clienteValido) {
        return response()->json([
            'message' => 'El cliente no pertenece a tu negocio',
        ], 403);
    }
}
```

### Archivos modificados
- `app/Http/Controllers/AppointmentController.php` (método store)

---

## Feature #013 - Rate limiting en autenticación (15/12/2025)

### Descripción
Protección contra ataques de fuerza bruta en las rutas de autenticación.

### Implementación
Aplicado middleware `throttle:5,1` a las rutas de autenticación:
- `/api/login` - 5 intentos por minuto
- `/api/register` - 5 intentos por minuto
- `/api/forgot-password` - 5 intentos por minuto

```php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});
```

Si se excede el límite, Laravel retorna automáticamente un error 429 (Too Many Requests).

### Archivos modificados
- `routes/api.php`

---

## Fix #014 - Validación de fechas futuras para turnos (15/12/2025)

### Problema
Se podían crear turnos con fechas pasadas, lo cual no tiene sentido para un sistema de reservas.

### Solución
Agregar validación `after_or_equal:today` en los métodos `store` y `storePublic`:

```php
'fecha_inicio' => 'required|date|after_or_equal:today',
```

Esto asegura que solo se puedan crear turnos para hoy o fechas futuras.

### Archivos modificados
- `app/Http/Controllers/AppointmentController.php` (métodos store y storePublic)

---

## Feature #015 - Endpoint de estadísticas del negocio (15/12/2025)

### Descripción
Nuevo endpoint para obtener estadísticas del negocio, útil para dashboards y reportes.

### Endpoint
`GET /api/business/stats`

### Respuesta
```json
{
    "turnos_hoy": 5,
    "turnos_pendientes": 3,
    "total_clientes": 25,
    "turnos_mes": 45,
    "turnos_completados_mes": 30,
    "turnos_cancelados_mes": 5
}
```

### Archivos modificados
- `app/Http/Controllers/BusinessController.php` (método stats)
- `routes/api.php` (ruta GET /business/stats)

---

## Feature #016 - Búsqueda de clientes por nombre/teléfono (15/12/2025)

### Descripción
El endpoint de listar clientes ahora soporta búsqueda por nombre o teléfono.

### Uso
`GET /api/clients?buscar=María`
`GET /api/clients?buscar=1155`

### Implementación
```php
if ($request->has('buscar') && $request->buscar) {
    $buscar = $request->buscar;
    $query->where(function ($q) use ($buscar) {
        $q->where('nombre', 'like', "%{$buscar}%")
          ->orWhere('telefono', 'like', "%{$buscar}%");
    });
}
```

### Archivos modificados
- `app/Http/Controllers/ClientController.php` (método index)

---

## Feature #017 - Filtro de turnos por cliente (15/12/2025)

### Descripción
El endpoint de listar turnos ahora soporta filtrar por cliente específico.

### Uso
`GET /api/appointments?client_id=5`

Se puede combinar con otros filtros existentes:
`GET /api/appointments?client_id=5&estado=confirmado&desde=2025-12-01`

### Archivos modificados
- `app/Http/Controllers/AppointmentController.php` (método index)

---

## Feature #018 - Soft deletes para turnos cancelados (15/12/2025)

### Descripción
Los turnos cancelados ahora utilizan soft deletes, manteniéndose en la base de datos pero ocultos de las consultas normales. Esto permite mantener historial para reportes.

### Implementación
1. **Nueva migración**: Agrega columna `deleted_at` a tabla appointments
2. **Modelo Appointment**: Usa trait `SoftDeletes`
3. **Método cancel**: Aplica soft delete después de marcar como cancelado

### Comportamiento
- Al cancelar un turno: se marca como `cancelado` y se aplica soft delete
- Las consultas normales no muestran turnos cancelados
- Para ver turnos eliminados: `Appointment::withTrashed()->get()`
- Para restaurar: `$appointment->restore()`

### Archivos creados/modificados
- `database/migrations/2025_12_15_173542_add_soft_deletes_to_appointments_table.php`
- `app/Models/Appointment.php` (trait SoftDeletes)
- `app/Http/Controllers/AppointmentController.php` (método cancel)

---

## Feature #019 - Dashboard conectado a endpoint de estadísticas (15/12/2025)

### Descripción
El Dashboard ahora usa el endpoint `/api/business/stats` para obtener las estadísticas, en lugar de calcularlas en el frontend con múltiples llamadas a la API.

### Mejora de rendimiento
- **Antes**: 3 llamadas a la API (turnos de hoy, clientes, turnos del mes)
- **Después**: 1 llamada a `/business/stats` + 1 para turnos de hoy (tabla)

### Archivos modificados
- `resources/js/services/api.js` (método getStats en businessService)
- `resources/js/pages/Dashboard.vue` (usa businessService.getStats)

---

## Fix #020 - Botón "Cerrar sesión" invisible en tema default (15/12/2025)

### Problema
En el tema default, el texto "Cerrar sesión" del sidebar no era visible porque el color del texto era casi negro sobre fondo oscuro.

### Causa
La clase `.btn-ghost` definía `color: var(--color-text)` que en el tema default es `#121012` (casi negro), igual que el fondo del sidebar.

### Solución
Agregar regla CSS específica para botones dentro del sidebar-footer:
```css
.sidebar-footer .btn {
    color: var(--color-white);
    background-color: transparent;
}
```

### Archivos modificados
- `resources/css/app.css`

---

## Feature #021 - Integración Simplificada de MercadoPago (19/12/2025)

### Descripción
Se ha rediseñado completamente la integración de MercadoPago, eliminando la complejidad innecesaria de webhooks y servicios separados.

**Cambio de paradigma:**
- **Antes**: Webhook-based (MercadoPagoService, Guzzle, preferencias en memoria)
- **Después**: Direct payment link + manual confirmation (Http façade, confirmación del usuario)

### Objetivos Logrados
✅ **Reducción de código**: 300+ líneas → ~200 líneas (-33%)  
✅ **Eliminación de dependencias externas**: Guzzle → Http façade de Laravel  
✅ **Simplificación del flujo**: 7 pasos → 4 pasos  
✅ **Mayor confiabilidad**: Usuario confirma explícitamente en lugar de depender de webhooks  

### Cambios Clave

**Backend:**
1. Eliminada clase `app/Services/MercadoPagoService.php` (completa)
2. Simplificado `PaymentController::createCheckout()` 
3. Agregado nuevo método `PaymentController::confirmPayment()`
4. Agregado método `PaymentController::createSimplePreference()` con Http façade
5. Agregada ruta `POST /api/payments/confirm` en `routes/api.php`

**Frontend:**
1. Actualizado `Planes.vue::selectPlan()` con nuevo flujo
2. Actualizado `Planes.vue::checkPaymentStatus()` para confirmar automáticamente
3. Implementado `sessionStorage` para guardar `payment_id` persistentemente
4. Agregado método `paymentsService.confirmPayment()` en `api.js`

**Fixes resueltos durante la implementación:**
- **SSL Certificate Error (cURL 60)**: Agregado `->withoutVerifying()` en desarrollo
- **MercadoPago API 400 Error**: Made `back_urls` conditional (solo en producción)
- **Payment link null**: Combinación de fixes anteriores resolvió el problema

### Nuevo Flujo de Pago

```
Usuario → Click "Upgrade PRO"
    ↓
selectPlan() → POST /api/payments/checkout
    ↓
Backend crea Payment (pending) + preferencia en MP API
    ↓
Devuelve payment_link + payment_id
    ↓
sessionStorage.setItem('payment_id', payment_id)
    ↓
window.location.href = payment_link (redirige a MP)
    ↓
Usuario paga en MercadoPago
    ↓
MP redirige a /planes?status=approved
    ↓
checkPaymentStatus() ejecuta automáticamente
    ↓
POST /api/payments/confirm { payment_id }
    ↓
Backend marca Payment como approved + crea Subscription
    ↓
✅ Usuario tiene acceso a PRO
```

### Documentación Creada
Se han creado 6 archivos de documentación en `/docs`:
1. **MERCADOPAGO_INICIO.md** - Guía de inicio rápido
2. **MERCADOPAGO_DIAGRAMA.md** - Diagramas visuales y arquitectura
3. **MERCADOPAGO_QUICK_START.md** - Quick start práctico
4. **MERCADOPAGO_SIMPLIFIED.md** - Documentación técnica completa
5. **TESTING_MERCADOPAGO.md** - 9 tests paso a paso
6. **MIGRACION_MERCADOPAGO.md** - Resumen de cambios

### Archivos Modificados
- `app/Http/Controllers/PaymentController.php`
- `routes/api.php`
- `resources/js/services/api.js`
- `resources/js/pages/Planes.vue`

### Archivos Eliminados
- `app/Services/MercadoPagoService.php` (ya no necesario)

### Testing
✅ Test 1: GET /api/plans → devuelve 3 planes  
✅ Test 2: GET /api/payments/current-plan → muestra plan FREE  
✅ Test 3: POST /api/payments/checkout → genera link válido  
✅ Test 4: Link de MP abre checkout  
✅ Test 5: Pago con tarjeta de prueba procesa  
✅ Test 6: POST /api/payments/confirm → crea suscripción  
✅ Test 7: Plan ahora muestra PRO  
✅ Test 8: GET /api/payments/history → muestra pago  
✅ Test 9: POST /api/payments/downgrade → vuelve a FREE  

### Notas Técnicas
- No requiere webhooks configurados en MercadoPago
- SSL verification se deshabilita automáticamente en desarrollo
- Back URLs se incluyen solo en producción
- Confirmación es sincrónica y confiable

---

## Fix #022 - Error 500 en topClients con withCount + groupBy (21/12/2025)

### Problema
Al acceder a la página de Reportes, el endpoint `/api/reports/top-clients` devolvía error 500.

### Causa
La combinación de `withCount()` con `leftJoin()` y `groupBy()` en una misma consulta Eloquent causa conflictos SQL. El `withCount` genera una subconsulta que no es compatible con el `groupBy` sobre la tabla principal.

### Código problemático
```php
$data = Client::where('clients.business_id', $business->id)
    ->withCount(['appointments' => ...])
    ->leftJoin('service_payments', ...)
    ->select('clients.*', DB::raw('SUM(...)'))
    ->groupBy('clients.id')  // Conflicto con withCount
    ->get();
```

### Solución
Separar en dos consultas:
1. Primero obtener clientes con `withCount` para turnos
2. Luego obtener totales de pagos en consulta separada

```php
// 1. Clientes con conteo de turnos
$clients = Client::where('business_id', $business->id)
    ->withCount(['appointments' => function ($query) use ($fechaInicio, $fechaFin) {
        $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin . ' 23:59:59'])
              ->where('estado', '!=', 'cancelado');
    }])
    ->having('appointments_count', '>', 0)
    ->orderByDesc('appointments_count')
    ->limit($limite)
    ->get();

// 2. Pagos de esos clientes
$clientIds = $clients->pluck('id');
$pagosClientes = ServicePayment::whereIn('client_id', $clientIds)
    ->where('estado', 'pagado')
    ->whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
    ->selectRaw('client_id, SUM(monto) as total_gastado')
    ->groupBy('client_id')
    ->pluck('total_gastado', 'client_id');

// 3. Combinar resultados
$data = $clients->map(function ($client) use ($pagosClientes) {
    return [
        'id' => $client->id,
        'nombre' => $client->nombre,
        'total_turnos' => $client->appointments_count,
        'total_gastado' => $pagosClientes[$client->id] ?? 0,
    ];
});
```

### Archivos modificados
- `app/Http/Controllers/ReportController.php` (método topClients)

---

## Feature #023 - Sistema de Reportes Premium (21/12/2025)

### Descripción
Nueva página de Reportes y Estadísticas disponible solo para usuarios con plan Premium. Muestra métricas clave del negocio.

### Funcionalidades
1. **Stats Cards**: Clientes atendidos, Turnos totales, Tasa de asistencia, Ingresos totales
2. **Horarios más solicitados**: Gráfico de barras mostrando las horas con más turnos
3. **Días más ocupados**: Gráfico de barras por día de la semana
4. **Servicios más populares**: Tabla con nombre, cantidad y precio
5. **Clientes recurrentes**: Tabla con nombre, visitas y total gastado
6. **Selector de período**: Semana, Mes, Trimestre, Año

### Backend
- `ReportController` con 6 endpoints de estadísticas
- Consultas optimizadas con agrupaciones SQL
- Servicios populares incluidos en dashboard

### Frontend
- `Reportes.vue` con diseño responsive
- Gráficos de barras CSS (sin librerías externas)
- Traducciones en ES/EN/PT

### Restricción Premium
- Ruta con meta `requiresPremium: true`
- Link en sidebar solo visible si `isPremium`
- Badge "PRO" junto al link

### Archivos creados
- `app/Http/Controllers/ReportController.php`
- `resources/js/pages/Reportes.vue`
- `resources/js/services/income.js` (reportsService)

### Archivos modificados
- `routes/api.php`
- `resources/js/router/index.js`
- `resources/js/components/layout/MainLayout.vue`
- `resources/js/i18n/es.js`, `en.js`, `pt.js`

---

## Template para nuevos fixes

```markdown
## Fix #XXX - Título (DD/MM/YYYY)

### Problema
Descripción del error o comportamiento inesperado.

### Causa
Explicación de por qué ocurría el problema.

### Solución
Código o pasos para resolver el problema.

### Archivos modificados
- Lista de archivos
```
