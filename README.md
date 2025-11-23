# Auditoría técnica – Turnos App Frontend

## Contexto y alcance
- Revisión manual del repo `turnos-app` (Vite + React 19 + Tailwind) al 10/11/2025, sin backend disponible.
- Foco en flujo de información entre contextos, persistencia en localStorage, duplicación de lógica y bugs funcionales visibles en dashboards de alumno/profesor/superadmin.
- Restricciones del entorno: sandbox de solo lectura y sin API; no se ejecutaron pruebas automáticas ni se alteró el backend.

## Resumen ejecutivo
- 4 hallazgos críticos (integridad de datos y control de acceso) que deben resolverse antes de liberar.
- 5 hallazgos importantes que bloquean funcionalidades visibles (búsquedas, aprobaciones, formularios).
- 6 observaciones de mantenimiento/UX/pruebas que acumulan deuda técnica pero se pueden abordar en paralelo.

## Hallazgos críticos
1. **Actualizaciones parciales destruyen turnos existentes**. `mapTurnoPayload` siempre envía `review`, `fecha`, `horario`, `start/end` y `zoomLink` con lo que venga en el payload, aunque sea `undefined`, y `updateTurno` reconstruye el estado local sólo con ese payload (`src/services/turnosService.js:7`, `src/context/AppContext.jsx:583`). Los flujos de aprobación/cancelación solo mandan `{ estado: ... }` (`src/pages/SolicitudesTurnos.jsx:65`, `src/components/overlay/RequestsPanel.jsx:83`, `src/pages/DashboardSuperadmin.jsx:54`), por lo que cada acción termina sobreescribiendo campos obligatorios con `0` o `""` y eliminando `solicitanteId/modulo/profesorId`. **Impacto**: los turnos quedan corruptos tanto en la API como en el cache local. **Sugerencia**: exponer un endpoint PATCH o fusionar el turno actual antes de enviar; impedir que `mapTurnoPayload` escriba campos cuando no se proveen.
2. **Un único cache de `turnos` para todos los roles causa datos inconsistentes y expone información**. `AppContext` persiste la colección completa en `localStorage` bajo una sola clave (`src/context/AppContext.jsx:44-90`). Cada pantalla escribe subsets diferentes (`src/pages/DashboardAlumno.jsx:196`, `src/pages/DashboardProfesor.jsx:101`, `src/pages/DashboardSuperadmin.jsx:118`, `src/components/turnos/TurnosList.jsx:33`), pero métricas y paneles flotantes consumen esa misma lista (`src/components/overlay/RequestsPanel.jsx:17`, `src/context/AppContext.jsx:330`). **Impacto**: lo último que se consultó pisa al resto (p.ej. un alumno deja la app mostrando solo su cohorte y un admin ve la lista parcial hasta forzar otra carga); además se serializan en disco datos filtrados. **Sugerencia**: separar caches por rol/filtro o dejar la colección sólo en memoria usando claves por query (React Query/SWR) y derivar vistas memorizadas.
3. **El panel flotante permite cancelar turnos ajenos sin validar rol ni dueño**. `Layout` añade `RequestsPanel` en cualquier `/dashboard` autenticado (`src/shell/Layout.jsx:9-28`) y el panel cancela cualquier turno "Solicitado" sin comprobar `solicitanteId` ni rol (`src/components/overlay/RequestsPanel.jsx:25-101`). **Impacto**: cualquier alumno puede abrir el panel y liberar turnos de terceros, rompiendo trazabilidad. **Sugerencia**: ocultar el panel para alumnos, validar en backend/servicio que el usuario tenga permisos y que el turno le pertenezca antes de cambiar a "Disponible".
4. **La sección de entregables del alumno expone todo el sistema**. Aunque se calcula `entregasAlumno`, se pasa el arreglo global `entregas` al componente (`src/pages/DashboardAlumno.jsx:374-460`) y `Entregables` renderiza/edita exactamente lo que recibe (`src/pages/Entregables.jsx:19-150`). **Impacto**: cada estudiante puede ver, editar o eliminar entregas de otras cohortes, y la colección completa queda cacheada en `localStorage`. **Sugerencia**: pasar sólo `entregasAlumno`, reforzar guardas servidoras en `removeEntrega` y limpiar almacenamiento al cambiar de usuario.

## Hallazgos importantes
- **Colecciones sensibles persistidas en localStorage compartido** (`src/context/AppContext.jsx:52-80`). Usuarios, turnos y entregas se guardan íntegros en disco sin namespacing ni cifrado, por lo que cualquiera con acceso al dispositivo puede leer datos personales. Limitar lo persistido a tokens/IDs o cifrar por usuario.
- **Las búsquedas de turnos no filtran nada**: los `SearchBar` de disponibles y "Mis turnos" ignoran el arreglo filtrado y sólo resetean la página (`src/pages/TurnosDisponibles.jsx:41-53`, `src/pages/MisTurnos.jsx:40-46`). El usuario ve siempre la lista completa. Replicar el patrón usado en `TurnosList` (`setTurnosBuscados`).
- **Las acciones de aprobación del listado administrativo son placeholders**. Los botones "Aprobar/Rechazar" dentro de `TurnosList` sólo muestran un toast "pendiente de implementar" (`src/components/turnos/TurnosList.jsx:111-120`). La pantalla principal del superadmin no cumple la función prometida. Tras corregir el bug de payload, reutilizar `updateTurno` con datos completos.
- **El formulario de nuevas entregas nunca resalta errores** porque `handleAgregarEntrega` no llama `setEntregaErrors` con el objeto `validation` antes de salir (`src/pages/Entregables.jsx:273-315`). El usuario recibe un toast genérico sin saber qué campo está mal. Propagar los mensajes como se hace en `EntregaEdit`.
- **Los controles de paginación referencian assets inexistentes** (`src/components/ui/Pagination.jsx:99-142`). Se piden `/src/left.svg`, `/src/right.svg`, etc., pero no existe ningún SVG con esos nombres en `public/`, lo que genera 404 y deja botones sin iconografía. Reutilizar íconos de `public/icons` o mover los SVG al `public` real.
- **La navegación del footer lleva a una ruta inexistente**. El menú incluye `/contacto` (`src/components/layout/Footer.jsx:23-47`), pero no hay ruta configurada en `createAppRouter`, por lo que el usuario aterriza en el error boundary. Ajustar el menú o crear la página.

## Observaciones de mantenimiento, UX y duplicación
- **`useLocalStorage` toca `localStorage` durante el render** (`src/hooks/useLocalStorage.js:3-18`), lo que rompe SSR/Vitest (ReferenceError) y imposibilita reusar hooks en tests sin DOM. Añadir guards (`typeof window !== "undefined"`) o permitir inyección de storage.
- **Comparaciones de estado sensibles a mayúsculas** en botones críticos: `RequestsPanel` sólo detecta `"Solicitado"` con S mayúscula (`src/components/overlay/RequestsPanel.jsx:25`), mientras otras partes usan minúsculas; `CardTurno` y `DashboardAlumno` comparan `"Disponible"/"Solicitado"` literalmente (`src/components/ui/CardTurno.jsx:34`, `src/pages/DashboardAlumno.jsx:222`). Si la API retorna minúsculas, los botones quedan bloqueados.
- **Menús con acciones falsas**: `AlumnoActions` muestra "Ver detalle" pero sólo hace `console.log` (`src/components/ui/AlumnoActions.jsx:41`), y las opciones de entregas se pintan aunque no haya handlers. Debe ocultarse o implementar la navegación real.
- **Lógica de deducción de módulo/cohorte duplicada** en alumno, profesor y evaluador (`src/pages/DashboardAlumno.jsx:27-90`, `src/pages/DashboardProfesor.jsx:27-87`, `src/pages/EvaluarEntregas.jsx:38-87`). Cada copia interpreta campos distintos y puede producir resultados inconsistentes. Extraer helper en `utils/moduleAssignment` con tests.
- **Contadores globales dependen de datos parciales**. `totalTurnosSolicitados` se calcula sobre `turnosState` sin distinguir filtros (`src/context/AppContext.jsx:330`), por lo que refleja lo último cargado, no el estado real del sistema.
- **Tokens y sesiones se sincronizan vía `localStorage` pero cada actualización dispara `showToast`** (`src/context/AuthContext.jsx:10-40`). En uso real produce spam de notificaciones cuando hay múltiples pestañas; considerar notificar sólo cuando la acción inicia desde la pestaña actual.

## Recomendaciones de pruebas
- Escribir pruebas de integración para `AppContext` que aseguren que `updateTurno` fusiona datos existentes y que los contadores no usan conjuntos filtrados inadvertidamente.
- Añadir tests (unitarios o contract) sobre un helper extraído de "assignment" de módulo/cohorte para garantizar coherencia entre dashboards.
- Incorporar pruebas de componente para los `SearchBar` de turnos validando que la tabla recibe el arreglo filtrado.
- Automatizar un flujo E2E que verifique que alumnos no pueden cancelar solicitudes ajenas (una vez aplicado el guardado de roles).
- Cubrir validaciones del formulario de entregas (crear y editar) para evitar regresiones en UX.

## Próximos pasos sugeridos
1. Corregir de raíz el envío/merge de turnos (nuevo endpoint PATCH o merge local + sanitización en `mapTurnoPayload`).
2. Segmentar el estado de `turnos`/`entregas`/`usuarios` por rol o eliminar la persistencia indiscriminada en `localStorage`.
3. Restringir el `RequestsPanel` a roles administrativos y validar ownership en backend.
4. Sanitizar el flujo de entregas del alumno (filtrado, permisos, validaciones y mensajes de error).
5. Completar las funcionalidades "pendientes" (búsquedas, botones de aprobación, menú de detalle) y agregar las pruebas descritas.

## Configuración para pruebas con API real

- `VITE_API_BASE_URL` debe apuntar a un backend real (localhost, staging o producción).
- Para forzar que los tests E2E usen el servidor remoto independientemente del valor de `VITE_API_BASE_URL`, configura `TEST_E2E_FORCE_REMOTE=true`.
- Cada flujo E2E usa credenciales reales y obtiene el token llamando a `/auth/login`. Configurá las siguientes variables de entorno con cuentas válidas y aprobadas:
  - `TEST_E2E_ALUMNO_EMAIL` / `TEST_E2E_ALUMNO_PASSWORD`
  - `TEST_E2E_PROFESOR_EMAIL` / `TEST_E2E_PROFESOR_PASSWORD`
  - `TEST_E2E_SUPERADMIN_EMAIL` / `TEST_E2E_SUPERADMIN_PASSWORD`
- Los tests crean y limpian datos reales (turnos, usuarios y entregas) usando la API. Para evitar interferencias, ejecutalos contra un entorno dedicado de QA o credenciales específicas para automatización.
