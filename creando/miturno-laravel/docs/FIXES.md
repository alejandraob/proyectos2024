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
