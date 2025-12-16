# TodoList Frontend - Sistema de Turnos

---

## Completado ✅

### Configuración Inicial (12/12/2025)
- [x] Instalar Vue.js 3
- [x] Instalar Vue Router
- [x] Configurar Vite
- [x] Crear estructura de carpetas (pages, components)
- [x] Configurar spa.blade.php
- [x] Configurar catch-all route en web.php

### Archivos Vue Creados (12/12/2025)
- [x] App.vue (componente raíz)
- [x] router/index.js (configuración de rutas)
- [x] pages/Home.vue
- [x] pages/Login.vue
- [x] pages/Register.vue
- [x] pages/Dashboard.vue
- [x] pages/Agenda.vue
- [x] pages/Clientes.vue
- [x] pages/Configuracion.vue

### Estilos y UI (15/12/2025)
- [x] Crear app.css con sistema de diseño completo
- [x] Variables CSS (colores, espaciados, sombras)
- [x] Componentes CSS (botones, formularios, cards, tablas, modales)
- [x] Layout (sidebar, header, contenido principal)
- [x] Responsive design (tablets y móviles)
- [x] Animaciones y spinners

### Configuración API (15/12/2025)
- [x] Instalar Axios para peticiones HTTP
- [x] Crear services/api.js con configuración centralizada
- [x] Configurar interceptores de Axios (token automático)
- [x] Interceptor de respuesta para 401 (logout automático)
- [x] Services: authService, businessService, clientsService, appointmentsService

### Estado Global (15/12/2025)
- [x] Instalar Pinia
- [x] Crear stores/auth.js con persistencia en localStorage
- [x] Actions: login, register, logout, fetchUser, updateBusiness

### Autenticación (15/12/2025)
- [x] Implementar formulario de Login con validación
- [x] Implementar formulario de Register
- [x] Guardar token en localStorage
- [x] Proteger rutas con navigation guards
- [x] Implementar logout
- [x] Manejo de errores de autenticación

### Layout Principal (15/12/2025)
- [x] MainLayout.vue con sidebar y header
- [x] Navegación activa resaltada
- [x] Info del usuario y negocio en sidebar
- [x] Slot para acciones en header

### Dashboard (15/12/2025)
- [x] Cards de resumen (turnos hoy, pendientes, clientes, este mes)
- [x] Tabla de próximos turnos
- [x] Links a agenda

### Agenda (15/12/2025)
- [x] Filtros por fecha y estado
- [x] Listado de turnos en tabla
- [x] Modal para crear turno nuevo
- [x] Modal para editar turno existente
- [x] Cambiar estado (confirmar/pendiente/cancelar)
- [x] Badges de estado con colores

### Clientes (15/12/2025)
- [x] Listado de clientes con buscador en tiempo real
- [x] Modal para crear cliente
- [x] Modal para editar cliente
- [x] Contador de turnos por cliente
- [x] Eliminar cliente con confirmación

### Configuración (15/12/2025)
- [x] Formulario datos del negocio (nombre, rubro, dirección)
- [x] Mostrar URL pública con slug
- [x] Editor de horarios de atención (responsive)
- [x] Configuración de notificaciones
- [x] Selector de intervalo de turnos

### Sistema de Notificaciones (15/12/2025)
- [x] Instalar PrimeVue
- [x] Configurar ToastService y ConfirmationService
- [x] Crear composable useNotify.js
- [x] Reemplazar alert() nativo por Toast
- [x] Reemplazar confirm() nativo por ConfirmDialog
- [x] Métodos: success, error, warn, info, confirmAction, confirmDelete, confirmCancel

### Mejoras UI Agenda (15/12/2025)
- [x] Instalar PrimeIcons
- [x] Implementar SpeedDial para acciones de turnos
- [x] Menú dinámico según estado del turno
- [x] Dirección de despliegue: izquierda a derecha

### Sidebar y Dark Mode (15/12/2025)
- [x] Botón hamburguesa para colapsar sidebar
- [x] Sidebar colapsable en desktop (muestra solo iconos)
- [x] Sidebar oculto en móvil (se abre con hamburguesa)
- [x] Overlay oscuro al abrir sidebar en móvil
- [x] Dark mode toggle en header
- [x] Persistencia de preferencias en localStorage
- [x] Estilos completos para dark mode (cards, tablas, modales, formularios, badges)

### Fixes Mobile (15/12/2025)
- [x] Fix #009: Dark mode button abría sidebar en iPhone (áreas táctiles superpuestas)
- [x] Botones táctiles de 44x44px (estándar iOS)
- [x] Prevención de propagación de eventos (@click.stop.prevent)
- [x] Título de página con ellipsis en móviles pequeños

### Optimización Dashboard (15/12/2025)
- [x] Dashboard conectado a endpoint /api/business/stats (Feature #019)
- [x] Reducción de 3 llamadas API a 2 (stats + turnos del día)
- [x] Método getStats() agregado a businessService

### Mejoras Clientes (15/12/2025)
- [x] Botones de acción con PrimeVue Button e iconos (pi-pencil, pi-trash)
- [x] Estilo consistente con página de Agenda
- [x] Tooltips en botones de acción

### Fixes UI (15/12/2025)
- [x] Fix #020: Botón "Cerrar sesión" invisible en tema default (sidebar oscuro)
- [x] Color blanco forzado para botones en sidebar-footer

### Sistema de Temas (15/12/2025)
- [x] 5 temas de colores personalizables (Default, Esmeralda, Oceano, Atardecer, Neon)
- [x] Variables CSS con data-theme selector
- [x] Selector visual con preview en Configuración
- [x] Persistencia en localStorage
- [x] Carga automática del tema al iniciar la app
- [x] Tema guardado por usuario en base de datos (Fix #011)
- [x] Tema se aplica al login y resetea al logout

### Recuperar Contraseña (15/12/2025)
- [x] Página ForgotPassword.vue con formulario de email
- [x] Ruta /forgot-password en router
- [x] Link en Login cuando hay error de credenciales (401)
- [x] Endpoint simulado en backend (TODO: envío real de email)
- [x] Estilo .alert-link para links dentro de alertas

### Página Pública de Reservas (15/12/2025)
- [x] Vista de negocio por slug (/reservar/:slug)
- [x] Ruta pública con meta: { public: true }
- [x] Header con nombre del negocio, rubro y dirección
- [x] Info de días de atención
- [x] Selector de fecha con validación de días laborales
- [x] Grid de slots disponibles (filtrado por disponibilidad)
- [x] Formulario: nombre, teléfono, email (opcional), motivo (opcional)
- [x] Confirmación visual con mensaje de éxito
- [x] Notificación Toast cuando se selecciona día inválido
- [x] Botón "Reservar otro turno" para reiniciar

### Link de Reservas en Configuración (15/12/2025)
- [x] Sección "Link de reservas" en datos del negocio
- [x] Input readonly con URL completa
- [x] Botón copiar al portapapeles con notificación
- [x] Botón "Ver" que abre en nueva pestaña
- [x] Estilos CSS para .url-publica

### Calendario Visual - Agenda (16/12/2025)
- [x] Integración de FullCalendar (@fullcalendar/vue3)
- [x] Plugins: daygrid, timegrid, interaction, list
- [x] Vistas: mensual, semanal, diaria, lista
- [x] Drag & drop para mover turnos
- [x] Resize para cambiar duración
- [x] Click en slot vacío para crear turno
- [x] Click en evento para editar turno
- [x] Colores por estado (verde=confirmado, amarillo=pendiente, rojo=cancelado)
- [x] Botón para alternar entre calendario y vista lista
- [x] Estilos responsive y dark mode
- [x] Indicador de hora actual (nowIndicator)
- [x] Horarios dinámicos según configuración del negocio (slotMinTime/slotMaxTime)
- [x] businessHours integrado con días de atención configurados

### Mejoras Edición de Turnos (16/12/2025)
- [x] Actualización de datos del cliente desde modal de edición
- [x] Campos nombre_cliente y telefono_cliente enviados al backend
- [x] Backend actualiza cliente asociado al turno

### Sistema de Servicios (16/12/2025)
- [x] servicesService en api.js (getAll, getOne, create, update, delete, getBySlug)
- [x] Sección de gestión de servicios en Configuracion.vue
- [x] CRUD completo de servicios con modal
- [x] Tabla de servicios con nombre, duración, precio, estado
- [x] Dropdown de servicios en modal de Agenda.vue
- [x] Auto-ajuste de duración al seleccionar servicio
- [x] Mostrar servicio en tabla y calendario de Agenda
- [x] Dropdown de servicios en Reservar.vue (página pública)
- [x] Envío de service_id en creación/edición de turnos

### Historial de Turnos del Cliente (16/12/2025)
- [x] Botón "Ver historial" en tabla de clientes (icono pi-history)
- [x] Modal con historial de turnos del cliente
- [x] Estadísticas: total turnos, confirmados, cancelados
- [x] Tabla con fecha, hora, servicio y estado
- [x] Backend: endpoint show() incluye turnos con servicio ordenados por fecha

### Exportación de Agenda (16/12/2025)
- [x] Instalar dependencias: xlsx, jspdf, jspdf-autotable
- [x] Botones de exportación en header de Agenda (Excel verde, PDF rojo)
- [x] Exportar a Excel (.xlsx) con columnas formateadas
- [x] Exportar a PDF con tabla estilizada y encabezado
- [x] Columnas: Fecha, Hora, Hora Fin, Cliente, Teléfono, Servicio, Precio, Estado
- [x] Nombre de archivo con fecha actual

### Integración WhatsApp (16/12/2025)
- [x] Toggle de notificaciones WhatsApp en Configuración
- [x] Descripción actualizada del toggle (sin "Próximamente")
- [x] Backend integrado con Twilio para envío de mensajes

---

## Pendiente 📋

(Sin tareas pendientes - MVP completado)

---

## Estructura de Archivos Actual

```
resources/js/
├── App.vue                    # Componente raíz (Toast + ConfirmDialog)
├── main.js                    # Inicialización (Vue, Pinia, Router, PrimeVue)
├── router/
│   └── index.js               # Rutas con navigation guards
├── stores/
│   └── auth.js                # Estado de autenticación (Pinia)
├── services/
│   └── api.js                 # Axios + interceptores + services
├── composables/
│   └── useNotify.js           # Toast y confirmaciones (PrimeVue)
├── components/
│   └── layout/
│       └── MainLayout.vue     # Layout con sidebar
└── pages/
    ├── Home.vue
    ├── Login.vue
    ├── Register.vue
    ├── ForgotPassword.vue
    ├── Dashboard.vue
    ├── Agenda.vue
    ├── Clientes.vue
    ├── Configuracion.vue
    └── Reservar.vue          # Página pública para clientes

resources/css/
└── app.css                    # Sistema de diseño completo (16 secciones)
```

---

## Dependencias Instaladas

```json
{
  "vue": "^3.x",
  "vue-router": "^4.x",
  "pinia": "^2.x",
  "axios": "^1.x",
  "primevue": "^4.x",
  "@primevue/themes": "^4.x",
  "primeicons": "^7.x",
  "@fullcalendar/vue3": "^6.x",
  "@fullcalendar/core": "^6.x",
  "@fullcalendar/daygrid": "^6.x",
  "@fullcalendar/timegrid": "^6.x",
  "@fullcalendar/interaction": "^6.x",
  "@fullcalendar/list": "^6.x"
}
```

---

## Paleta de Colores

```css
--color-light: #ced8e5
--color-dark: #121012
--color-primary: #203b80
--color-secondary: #4364a9
--color-info: #168ce4
--color-accent1: #49434e
--color-accent2: #3c7197
--color-accent3: #96abbe
--color-success: #08a05c
--color-warning: #e1ca08
--color-danger: #ef1903
--color-white: #ffffff
```
