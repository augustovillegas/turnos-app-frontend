# Reporte de auditoria frontend (Turnos App)

## Panorama general
- Stack: React 19 + Vite + Tailwind + React Router 6.30. Estados globales por Context (`src/context/*`), sin persistencia local salvo `token` y `user` en `localStorage`.
- Dominios manejados: turnos/slots, entregas/submissions, usuarios. Los contratos HTTP viven en `src/services/*` y se normalizan antes de tocar la UI (`src/utils/*`).
- Roles y rutas: alumno (`/dashboard/alumno`), profesor (`/dashboard/profesor`), superadmin (`/dashboard/superadmin`). Ruta de login protegida con loaders (`src/routes/*`, `src/router/session.js`).

## Configuracion y cliente HTTP
- Base URL tomada de `VITE_API_BASE_URL` (fallback `VITE_BACKEND_URL`, `VITE_API_URL` o `window.location.origin`). Se setea en `apiClient` (`src/services/apiClient.js`) y se puede reasignar con `setApiBaseUrl`.
- Autenticacion: `apiClient` adjunta `Authorization: Bearer <token>` si existe en `localStorage`. Ante 401 borra token/usuario y redirige a `/login`.
- `.env` incluye `VITE_API_BASE_URL` y credenciales de prueba E2E; revisarlas antes de exponer el repo.

## Contratos por dominio y mapeos
- Turnos (`src/services/turnosService.js`)
  - Endpoints: `GET /turnos`, `GET /turnos/:id`, `POST /turnos`, `PUT /turnos/:id`, `DELETE /turnos/:id`.
  - Payload de envio (`mapTurnoPayload`): `review/reviewNumber` (numero), `fecha` (DD/MM/YYYY) o `date` ISO, `horario` (HH:mm - HH:mm), `sala`/`room` (numero), `zoomLink`, `start`, `end`, `startTime`, `endTime`, `duracion`, `comentarios`, `estado` (`Disponible|Solicitado|Aprobado|Rechazado`), `titulo`, `descripcion`, `modulo`, `solicitanteId`, `profesorId`.
  - Normalizacion de respuesta (`src/utils/turnos/normalizeTurno.js`): asegura `id`, `estado`, `fecha`, `horario`, `sala/room`, `profesorId`, `solicitanteId`, `comentarios`, `zoomLink`.
- Slots alumno (`src/services/slotsService.js`)
  - Endpoints: `GET /slots`, `PATCH /slots/:id/solicitar`, `PATCH /slots/:id/cancelar`, `PATCH /slots/:id/estado { estado }`.
  - Usados solo por rol alumno (`loadTurnos`, `solicitarTurno`, `cancelarTurno` en `src/context/AppContext.jsx`).
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
  - Acciones: `solicitarSlot` cuando `estado === "Disponible"`; `cancelarSlot` cuando `estado === "Solicitado"`.
  - Entregas: `loadEntregas` usa `GET /submissions/:userId`; `createSubmission(slotId)` al registrar entrega (toma el primer turno con `estado === "Solicitado"`). La vista actual pasa el arreglo completo `entregas` a `Entregables`, no la lista filtrada por alumno.
  - Panel flotante global (`src/components/overlay/RequestsPanel.jsx`) visible en cualquier dashboard autenticado; permite devolver turnos a “Disponible” via `updateTurno` sin validar rol ni ownership.
- Profesor (`src/pages/DashboardProfesor.jsx`)
  - Carga turnos, entregas, usuarios filtrados por modulo/cohorte (`coincideModulo`).
  - Aprobaciones de turnos: `SolicitudesTurnos` usa `updateTurno` PUT con payload fusionado (`estado Aprobado/Rechazado`). 
  - Entregas pendientes: `EvaluarEntregas` filtra por modulo y actualiza con `updateEntrega` (`estado/reviewStatus` Aprobado/Desaprobado).
  - Usuarios pendientes: `UsuariosPendientes` aprueba via `approveUsuario`.
  - Crear turnos: `TurnoForm` -> `createTurno` (`POST /turnos` con defaults completos).
  - `TurnosList` muestra CRUD; acciones Aprobar/Rechazar dentro de la tabla siguen siendo placeholders (solo toast).
- Superadmin (`src/pages/DashboardSuperadmin.jsx`)
  - Carga global de turnos/entregas/usuarios.
  - Aprobacion/rechazo de turnos: `buildTurnoPayloadFromForm` + `updateTurno` (PUT) mantiene fecha/horario/room.
  - Aprobacion/rechazo de usuarios: `approveUsuario` y `updateUsuarioEstado("Rechazado")`.
  - Crear usuarios: `CreateUsers` permite crear/editar/eliminar; asigna password default por rol cuando no se ingresa una (constantes `ROLE_PASSWORDS`).

## Comportamiento de estado y normalizacion
- `AppContext` mantiene colecciones en memoria (`turnos`, `entregas`, `usuarios`) y usa refs para merges seguros; al cerrar sesion limpia todo.
- `updateTurno` y `updateEntrega` fusionan con el item actual antes de enviar, evitando sobrescribir campos no provistos; la respuesta normalizada vuelve a la cache.
- Contadores derivados (`totalTurnosSolicitados`, `totalEntregas`, `totalUsuarios`) se calculan sobre el estado cargado en memoria, no sobre el universo completo de la API.

## Riesgos y desalineaciones detectadas
- Panel de solicitudes accesible para todos los dashboards y sin chequeo de pertenencia: un alumno puede cancelar cualquier turno desde `RequestsPanel` (`src/shell/Layout.jsx`, `src/components/overlay/RequestsPanel.jsx`). Backend debe validar rol/owner y se deberia ocultar el panel en UI para roles no admin.
- Entregables del alumno usan la coleccion completa `entregas` en lugar de `entregas` filtradas (`src/pages/DashboardAlumno.jsx` -> `Entregables`), exponiendo trabajos de otros usuarios si el backend no filtra por token.
- Acciones de aprobacion en `TurnosList` aun no llaman al servicio (solo muestran toast “pendiente de implementar”), por lo que los flujos admin desde esa vista no impactan backend (`src/components/turnos/TurnosList.jsx`).
- Creacion/edicion de usuarios usa passwords por defecto embebidas (`CreateUsers`, `ROLE_PASSWORDS`), lo que obliga al backend a aceptarlas o a exigir cambio inmediato; revisar politica de seguridad.
- Validaciones de entregas: al crear desde alumno (`handleAgregarEntrega` en `src/pages/DashboardAlumno.jsx`) no se propagan errores campo a campo a `EntregaForm`, solo se muestra toast. Backend deberia responder con mensajes por campo; la UI necesita conectarlos.
- Case-sensitivity de estados: varias comparaciones esperan `Solicitado`/`Disponible` capitalizado; el backend deberia responder usando ese casing o normalizar en la UI antes de comparar.

## Checklist de alineacion con el backend
- Confirmar contratos de turnos/slots: que `PUT /turnos/:id` acepte payload completo generado por `mapTurnoPayload` y mantenga `solicitanteId/profesorId/modulo` al aprobar/rechazar/cancelar. Si el backend solo soporta parches parciales, exponer endpoint `PATCH` y ajustar el servicio.
- Verificar que `/slots/:id/solicitar` y `/slots/:id/cancelar` devuelvan el slot actualizado con `id`, `estado`, `solicitanteId` y los campos basicos (`fecha`, `horario`, `room`) para que `normalizeTurno` no deje nulls.
- Asegurar que `/submissions/:slotId` y `/entregas` acepten `estado/reviewStatus` con valores `A revisar|Aprobado|Desaprobado` y devuelvan `alumnoId`/`modulo` para el filtrado por profesor.
- Para usuarios, mantener consistencia de modulo/cohorte: labels permitidas (`HTML-CSS`, `JAVASCRIPT`, `BACKEND - NODE JS`, `FRONTEND - REACT`) o numeros (`1..4`). Responder siempre `estado/status` y `rol` para que `normalizeUsuario` no genere temporales.
- Revisar base URL y CORS: el frontend asume mismo origen si no hay variable; si el backend vive en dominio separado, definir `VITE_API_BASE_URL` en todos los entornos y habilitar CORS con credenciales Bearer.
- Si se requiere trazabilidad por rol, reforzar en backend: impedir que tokens de alumno llamen endpoints admin (`/turnos` PUT/DELETE, `/usuarios`, `/entregas`) y que los endpoints alumno (`/slots`, `/submissions`) ignoren ids que no correspondan al usuario autenticado.

## Notas para pruebas
- Scripts de pruebas: `npm run test:e2e` espera backend vivo y variables `TEST_E2E_*` configuradas. 
- `test:api` (`scripts/apiHealthTest.mjs`) puede reutilizar `setApiBaseUrl` para apuntar a staging.

