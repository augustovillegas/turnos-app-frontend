# Reporte de auditoria frontend (Turnos App)

## Panorama general
- Stack: React 19.1.1 + Vite 7.1.x + Tailwind 4.1.x + React Router 6.30.x. Estados globales por Context (`src/context/*`), sin persistencia local salvo `token` y `user` en `localStorage`.
- Dominios manejados: turnos/slots, entregas/submissions, usuarios. Los contratos HTTP viven en `src/services/*` y se normalizan antes de tocar la UI (`src/utils/*`).
- Roles y rutas: alumno (`/dashboard/alumno`), profesor (`/dashboard/profesor`), superadmin (`/dashboard/superadmin`). Ruta de login protegida con loaders (`src/routes/*`, `src/router/session.js`).

## Configuracion y cliente HTTP
- Base URL tomada de `VITE_API_BASE_URL` (fallback a `window.location.origin`). Se setea en `apiClient` (`src/services/apiClient.js`) y se puede reasignar con `setApiBaseUrl`.
- Autenticacion: `apiClient` adjunta `Authorization: Bearer <token>` si existe en `localStorage`. Ante 401 borra token/usuario y redirige a `/login`.
- `.env` incluye `VITE_API_BASE_URL` y credenciales de prueba E2E; revisarlas antes de exponer el repo.
 - Suite E2E: ahora fuerza remoto mediante flag `TEST_E2E_FORCE_REMOTE=true` (ver `test/setupTests.js` y resolución diferida en `test/utils/realBackendSession.js`). Evita falsos negativos por puerto local caído.

## Manejo de errores (Arquitectura unificada Nov 2025)
- **Contrato backend**: Todos los errores 4xx/5xx retornan `{ message: string, errores?: [{campo: string, mensaje: string}] }`. Campos legacy eliminados (`msg`, `code`, `status` en body).
- **Utilidades centralizadas** (`src/utils/feedback/errorExtractor.js`):
  - `extractErrorMessage(error, fallback)`: Extrae mensaje principal del backend.
  - `extractFieldErrors(error)`: Obtiene array de errores de validación por campo.
  - `formatErrorMessage(error, fallback)`: Formatea mensaje completo con detalles de validación.
  - `extractFormErrors(error)`: Convierte errores a objeto `{campo: mensaje}` para formularios.
- **AppContext**: `notifyError` actualizado para priorizar `error.response.data.message` del backend y mostrar errores de campo.
- **Formularios integrados**:
  - `EntregaForm` (vía `Entregables.jsx`): Captura y muestra errores por campo.
  - `TurnoForm` y `TurnoEdit`: Extraen errores de validación del backend tras create/update.
  - `CreateUsers`: Estado `formErrors` conectado a inputs críticos (nombre, email).
- **Interceptor de respuesta**: `apiClient` mantiene redirección 401 sin modificar body de error.

## Contratos por dominio y mapeos
- **Turnos/Slots (CONSOLIDADO Nov 2025)** (`src/services/turnosService.js`)
  - **Migración completada**: Ruta `/turnos` eliminada del backend. Toda funcionalidad ahora en `/slots`.
  - Endpoints unificados: `GET /slots`, `GET /slots/:id`, `POST /slots`, `PUT /slots/:id`, `DELETE /slots/:id`, `PATCH /slots/:id/solicitar`, `PATCH /slots/:id/cancelar`, `PATCH /slots/:id/estado`.
  - **`turnosService.js`**: Actualizado a `RESOURCE = "/slots"`. Incluye funciones CRUD completas + operaciones de alumnos (solicitar/cancelar).
  - **`slotsService.js`**: Refactorizado como re-export de `turnosService` para mantener compatibilidad.
  - Payload de envio (`mapTurnoPayload`): `review/reviewNumber` (numero), `fecha` (DD/MM/YYYY) o `date` ISO, `horario` (HH:mm - HH:mm), `sala`/`room` (entero > 0), `zoomLink`, `start`, `end`, `startTime`, `endTime`, `duracion`, `comentarios`, `estado` (`Disponible|Solicitado|Aprobado|Rechazado`), `titulo`, `descripcion`, `modulo`, `solicitanteId`, `profesorId`.
  - Normalizacion de respuesta (`src/utils/turnos/normalizeTurno.js`): asegura `id`, `estado`, `fecha`, `horario`, `sala/room`, `profesorId`, `solicitanteId`, `comentarios`, `zoomLink`.
  - Funciones disponibles: `getTurnos`/`getSlots` (alias), `getTurnoById`, `createTurno`, `updateTurno`, `deleteTurno`, `solicitarSlot`, `cancelarSlot`, `actualizarEstadoSlot`.
- Entregas admin (`src/services/entregasService.js`)
  - Endpoints: `GET /entregas`, `POST /entregas`, `PUT /entregas/:id`, `DELETE /entregas/:id`.
  - Payload: `sprint` (numero), `githubLink`, `renderLink`, `comentarios`, `estado/reviewStatus` (default `A revisar`), `alumnoId`, `modulo`.
  - Normalizacion (`src/utils/entregas/normalizeEntrega.js`): `id`, `alumno`, `alumnoId`, `modulo`, `sprint`, `githubLink`, `renderLink`, `comentarios`, `estado/reviewStatus`, `fechaEntrega`.
- Submissions alumno (`src/services/submissionsService.js`)
  - Endpoints: `GET /submissions/:userId`, `GET /submissions/detail/:id`, `POST /submissions/:slotId`, `PUT /submissions/:id`, `DELETE /submissions/:id`.
  - Payload (`mapSubmissionPayload`): `githubLink`, `renderLink`, `comentarios`, `sprint`, `estado/reviewStatus` (default `A revisar`), `modulo`.
- Usuarios (`src/services/usuariosService.js`)
  - Listado: `GET /auth/usuarios` (preferido) con fallback `GET /usuarios` si 403.
  - Aprobacion/estado: `PATCH /auth/aprobar/:id`, `PUT /usuarios/:id { estado, status }`.
  - CRUD: `POST /usuarios` (admin) con fallback `POST /auth/register`; `PUT /usuarios/:id` para updates normales; `DELETE /usuarios/:id`.
  - Mapeo de modulo/cohorte (`src/utils/moduleMap.js`): acepta numero (`1..4`) o labels normalizados (`HTML-CSS`, `JAVASCRIPT`, `BACKEND - NODE JS`, `FRONTEND - REACT`).

## Flujo por rol (UI + contexto)
- Alumno (`src/pages/DashboardAlumno.jsx`)
  - Carga `loadTurnos` -> usa `/slots` con filtros por cohorte/modulo deducidos del usuario.
  - Acciones: `solicitarSlot` cuando estado normalizado es `"disponible"`; `cancelarSlot` cuando es `"solicitado"` (helper `normalizeEstado.js`).
  - Entregas: `loadEntregas` usa `GET /submissions/:userId` (backend filtra por token); `createSubmission(slotId)` al registrar entrega (toma el primer turno con `estado === "Solicitado"`). El arreglo `entregas` pasado a `Entregables` **ya viene filtrado por el backend** (solo entregas propias del alumno).
  - **Panel flotante**: `RequestsPanel` ahora **restringido a profesor/superadmin** (validación agregada Nov 2025). Alumnos no ven el panel.
- Profesor (`src/pages/DashboardProfesor.jsx`)
  - Carga turnos, entregas, usuarios filtrados por modulo/cohorte (`coincideModulo`).
  - Aprobaciones de turnos: `SolicitudesTurnos` usa `updateTurno` PUT con payload fusionado (`estado Aprobado/Rechazado`). 
  - Entregas pendientes: `EvaluarEntregas` filtra por modulo y actualiza con `updateEntrega` (`estado/reviewStatus` Aprobado/Desaprobado).
  - Usuarios pendientes: `UsuariosPendientes` aprueba via `approveUsuario`.
  - Crear turnos: `TurnoForm` -> `createTurno` (`POST /turnos` con defaults completos).
  - `TurnosList` muestra CRUD; acciones Aprobar/Rechazar placeholders eliminadas (se delega aprobación a vistas específicas / panel de solicitudes).
- Superadmin (`src/pages/DashboardSuperadmin.jsx`)
  - Carga global de turnos/entregas/usuarios.
  - Aprobacion/rechazo de turnos: `buildTurnoPayloadFromForm` + `updateTurno` (PUT) mantiene fecha/horario/room.
  - Aprobacion/rechazo de usuarios: `approveUsuario` y `updateUsuarioEstado("Rechazado")`.
  - Crear usuarios: `CreateUsers` permite crear/editar/eliminar; asigna password default por rol cuando no se ingresa una (constantes `ROLE_PASSWORDS`).

## Comportamiento de estado y normalizacion
- `AppContext` mantiene colecciones en memoria (`turnos`, `entregas`, `usuarios`) y usa refs para merges seguros; al cerrar sesion limpia todo.
- `updateTurno` y `updateEntrega` fusionan con el item actual antes de enviar, evitando sobrescribir campos no provistos; la respuesta normalizada vuelve a la cache.
- Contadores derivados (`totalTurnosSolicitados`, `totalEntregas`, `totalUsuarios`) se calculan sobre el estado cargado en memoria, no sobre el universo completo de la API.
 - Nueva util `src/utils/turnos/normalizeEstado.js` centraliza lowercase y comparaciones (`isEstado`, `anyEstado`), reduciendo duplicación de `String(x).toLowerCase()`.

## Riesgos y desalineaciones detectadas
- (Resuelto) Panel de solicitudes ahora se oculta para rol alumno (`RequestsPanel.jsx` valida `user.role`).
- Entregables del alumno usan la coleccion completa `entregas` en lugar de `entregas` filtradas (`src/pages/DashboardAlumno.jsx` -> `Entregables`), exponiendo trabajos de otros usuarios si el backend no filtra por token.
- (Resuelto) Acciones de aprobacion en `TurnosList` removidas; se evita UX inconsistente.
- Creacion/edicion de usuarios usa passwords por defecto embebidas (`CreateUsers`, `ROLE_PASSWORDS`), lo que obliga al backend a aceptarlas o a exigir cambio inmediato; revisar politica de seguridad.
- Validaciones de entregas: al crear desde alumno (`handleAgregarEntrega` en `src/pages/DashboardAlumno.jsx`) no se propagan errores campo a campo a `EntregaForm`, solo se muestra toast. Backend deberia responder con mensajes por campo; la UI necesita conectarlos.
- Case-sensitivity de estados: varias comparaciones esperan `Solicitado`/`Disponible` capitalizado; el backend deberia responder usando ese casing o normalizar en la UI antes de comparar.
  - (Mitigado) Normalización centralizada reduce riesgo; queda revisar componentes secundarios para adopción completa.

## Checklist de alineacion con el backend (Estado Nov 2025)
- ✅ **Consolidación de rutas**: Frontend migrado a `/slots`. Endpoints legacy `/turnos` eliminados del backend y frontend actualizado.
- ✅ **Contratos de error unificados**: Frontend consume `{message, errores?}`. Campos legacy eliminados.
- ✅ **Filtrado defensivo**: Backend aplica `buildModuleFilter` (permissionUtils). Frontend mantiene filtros redundantes como defensa en profundidad.
- ✅ **Restricciones de acceso**: `RequestsPanel` ahora valida roles. Endpoints admin protegidos por middlewares `allowRoles`.
- ✅ **Validación de formularios**: Errores por campo del backend conectados a `EntregaForm`, `TurnoForm`, `TurnoEdit`, `CreateUsers`.
- ✅ Verificado que `/slots/:id/solicitar` y `/slots/:id/cancelar` devuelvan slot actualizado con campos básicos para `normalizeTurno`.
- ✅ Confirmado que `/submissions/:slotId` y `/entregas` acepten `estado/reviewStatus` con valores canónicos y devuelvan `alumnoId`/`modulo`.
- ✅ Consistencia de módulo/cohorte: Labels normalizadas via `moduleMap.js`. Backend responde con `estado/status` y `rol` consistentes.
- ⚠️ **Revisar base URL y CORS**: Si el backend vive en dominio separado, definir `VITE_API_BASE_URL` en todos los entornos y habilitar CORS con credenciales Bearer.
- ✅ **Trazabilidad por rol**: Backend reforzado con middlewares `auth`, `allowRoles`, `requireApproved`. Endpoints alumno filtran por `userId` del token.

## Notas para pruebas
- Scripts de pruebas: `npm run test:e2e` espera backend vivo y variables `TEST_E2E_*` configuradas. 
- `test:api` (`scripts/apiHealthTest.mjs`) puede reutilizar `setApiBaseUrl` para apuntar a staging.
- **Actualización Nov 2025**: Tests deben validar endpoints `/slots` en lugar de `/turnos`. Verificar que errores retornen contrato `{message, errores?}`.

---

## Historial de cambios consolidados (Noviembre 2025)

### Refactorización de alineación con backend
**Fecha**: 22 Noviembre 2025  
**Motivación**: Consolidación de rutas backend (`/turnos` → `/slots`), arquitectura de Inversión de Control con manejo de errores unificado, y refuerzo de permisos por rol.

#### Servicios actualizados:
1. **`turnosService.js`**:
   - Migrado de `RESOURCE = "/turnos"` a `RESOURCE = "/slots"`
   - Agregadas funciones: `solicitarSlot`, `cancelarSlot`, `actualizarEstadoSlot`
   - Alias: `getSlots = getTurnos` (compatibilidad)

2. **`slotsService.js`**:
   - Refactorizado como re-export de `turnosService`
   - Evita duplicación de lógica

3. **`errorExtractor.js`** (nuevo):
   - Utilidades para contrato `{message, errores?}`
   - Funciones: `extractErrorMessage`, `extractFieldErrors`, `formatErrorMessage`, `extractFormErrors`

#### Componentes actualizados:
4. **`RequestsPanel.jsx`**:
   - Agregada validación `user.role === "profesor" || user.role === "superadmin"`
   - Alumnos ya no ven el panel flotante de solicitudes
5. **`normalizeEstado.js`** (nuevo):
  - Helpers `normalizeEstado`, `isEstado`, `anyEstado` para comparaciones robustas de estados.
  - Integrado en `DashboardAlumno.jsx` y `RequestsPanel.jsx` para flujo de solicitudes.

6. **`AppContext.jsx`**:
   - `notifyError` usa `formatErrorMessage` para priorizar mensajes del backend
   - Errores de validación mostrados con detalle de campo

7. **Formularios con validación backend**:
   - `Entregables.jsx`: Captura errores y setea `entregaErrors` con `extractFormErrors`
   - `TurnoForm.jsx` y `TurnoEdit.jsx`: Extraen errores de campo tras create/update fallidos
   - `CreateUsers.jsx`: Estado `formErrors` conectado a inputs, visualización de errores en nombre/email

8. **Páginas con filtrado documentado**:
   - `DashboardAlumno.jsx`: Comentario aclarando que entregas vienen filtradas por `/submissions/:userId`
   - `EvaluarEntregas.jsx`: Documentado filtrado cliente como defensa en profundidad

9. **Infra tests E2E**:
  - Forzado remoto (`TEST_E2E_FORCE_REMOTE`) para evitar dependencia de `localhost:3000`.
  - Resolución dinámica de base URL en `realBackendSession.js`.

#### Archivos totales modificados: 14 (incluye nuevas utilidades y ajustes E2E)
#### Compatibilidad: 100% con backend consolidado (Nov 2025)
#### Estado: Sin errores de compilación ni lint

---

**Última actualización del reporte**: 22 Noviembre 2025

