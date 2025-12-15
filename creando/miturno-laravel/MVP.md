Sistema de Turnos (SaaS Multi-Tenant)

Versión: 1.0 — MVP Realizable
Tecnologías utilizadas:

Backend: PHP (Laravel)

Frontend: SPA (Vue.js)

Base de datos: MariaDB

Autenticación: JWT o sesiones

Infraestructura: 1 hosting + 1 base de datos (multi-tenant por columna)

🎯 1. Objetivo del MVP

Crear un sistema simple, usable y rápido para que profesionales de belleza (peluquerías, uñas, barberías, masajes, pestañas, etc.) puedan gestionar sus turnos desde el celular sin hacer llamadas.

El MVP apunta a:

Generar turnos

Ver la agenda

Cancelar turnos

Enviar recordatorio automático

Panel simple de negocio

Nada más.
Lo demás se agrega luego.

🧩 2. Roles

Solo 2 roles para el MVP:

👩‍⚕️ Profesional (dueña del negocio)

Administra su agenda

Configura horarios

Ve clientes

Crea o cancela turnos

Visualiza agenda diaria/semana

Recibe notificaciones de nuevos turnos

👤 Cliente final

(En MVP puede ni siquiera tener login, solo un formulario)

Solicita turno

Recibe notificación

🧱 3. Estructura mínima de la base de datos
Tabla: users

(Profesionales del negocio)

id
nombre
email
password_hash
telefono
created_at
updated_at

Tabla: businesses

(un profesional puede tener un negocio)

id
user_id (FK)
nombre_negocio
rubros (peluquería, uñas, etc.)
direccion
timezone
created_at
updated_at

Tabla: clients

(Clientes del negocio)

id
business_id (FK)
nombre
telefono
email
created_at
updated_at

Tabla: appointments

(Turnos)

id
business_id (FK)
client_id (FK, opcional)
fecha_inicio
fecha_fin
estado (“pendiente”, “confirmado”, “cancelado”)
motivo (corte, uñas, masaje)
origen (“manual”, “web”)
created_at
updated_at

Tabla: business_hours

(Horarios de atención)

id
business_id (FK)
dia_semana (0–6)
hora_inicio
hora_fin

Tabla: settings

(Config por negocio)

id
business_id
notificaciones_whatsapp (boolean)
notificaciones_email (boolean)
intervalo_turnos (15, 30, 45 min)

🖥️ 4. Funcionalidades del MVP
✔ 4.1. Registro y login de profesional

Email + password

Validación

Protección básica

Crear negocio automáticamente al registrarse

✔ 4.2. Configuración inicial del negocio

Cargar horarios

Intervalo entre turnos (15, 30, 60 min)

Datos del negocio

✔ 4.3. Agenda diaria y semanal

La parte más importante del MVP.

Incluye:

Vista día

Vista semana

Bloques de tiempo disponibles

Turnos ocupados coloreados

Botón “Crear Turno”

Botón “Cancelar”

✔ 4.4. Crear turno (por la profesional)

Formulario:

Nombre del cliente

Servicio (texto simple)

Fecha

Hora

El sistema:

Valida que el turno NO choque

Valida horario laboral

Crea el turno

(Opcional) manda WhatsApp / mail

✔ 4.5. Turno desde el sitio público (cliente final)

No necesita login.

URL del negocio, ej: /mi-pelu

Selecciona día

Selecciona hora disponible

Completa datos

Confirma

Mensaje de éxito

(Opcional) email/whatsapp automático

✔ 4.6. Cancelación de turno

Profesional:

Botón “Cancelar”

Estado → “cancelado”

Cliente (opcional MVP):

Link de cancelación enviado por mail

✔ 4.7. Panel básico

Métricas simples:

Turnos del día

Turnos de la semana

Cancelados

Próximo turno

✔ 4.8. Notificaciones

En MVP:

Email simple (SMTP)

Más adelante:

WhatsApp + recordatorios automáticos

🏗️ 5. Arquitectura (simple y clara)
Modelo multi-tenant simple (por columna)

Cada tabla importante tiene business_id.

Eso significa:

Un solo sistema

Todos los clientes dentro

Cada profesional ve solo lo suyo

Sin múltiples bases de datos.
Rápido, fácil y escalable para un MVP.

🚦 6. Flujo principal del usuario (Profesional)
1. Se registra

↓

2. Carga su horario

↓

3. Entra al calendario

↓

4. Crea turnos manuales

↓

5. Comparte su link público

↓

6. Recibe turnos

↓

7. Ve agenda y trabaja

↓

¡Listo! SaaS funcionando
🌐 7. Flujo del Cliente
1. Entra al link del negocio
2. Ve días disponibles
3. Selecciona hora
4. Completa datos
5. Confirma
6. Recibe notificación
🎨 8. Interfaces mínimas del MVP
Pantallas Profesionales:

Login

Registro

Configuración inicial

Agenda día

Agenda semana

Crear turno

Ajustes

Panel de negocio

Pantallas Cliente:

Selección de día

Selección de hora

Formulario

Confirmación

🧪 9. Tests mínimos

Login → OK

Crear turno → OK

Turno sobre otro → Error

Turno fuera de horario → Error

Cancelar turno → OK

Crear cliente → OK

Agenda diaria muestra turnos → OK

💰 10. Monetización del MVP

No te compliques.

Opción simple:

2000–3500 ARS por mes (precio simbólico)

Pago por Mercado Pago

100% manual al principio

Después escalás.

🚀 11. Roadmap post-MVP

Orden recomendado:

WhatsApp automático

Multi-usuario por negocio

Servicios configurables

Recordatorios de 24 y 2 horas

Agenda mensual

Pagos online al reservar

App móvil (wrapper)

🧲 12. Qué hace que este sistema SE VENDA

Simple

Lindo

Sin cosas raras

Funciona en celular

Link rápido

Agenda clara

Soporte amable (o automatizado)
