# Servidor Backend

Guía completa para que el equipo de frontend configure y consuma el API de Gestión de Turnos.

## Visión General
- Base URL por defecto: `http://localhost:3000`
- Salud del servidor: `GET /health` → `{ status: "ok" }`
- Autenticación: JWT en header `Authorization: Bearer <token>`
- CORS: habilitado
- Formato de cuerpo: `application/json`
- DB: MongoDB (`MONGO_URL` en `.env`)
- Entorno: variables en `.env` (ver sección Configuración)

## Configuración
- Requisitos de `.env`:
  - `PORT`: puerto del servidor (opcional, por defecto 3000)
  - `MONGO_URL`: cadena de conexión a MongoDB (obligatoria)
  - `JWT_SECRET`: secreto para firmar tokens JWT (obligatorio)
- Arranque: el servidor se inicia automáticamente excepto en `NODE_ENV=test`
- Índices MongoDB: `autoIndex` activo si `NODE_ENV !== 'production'`

## Autenticación y Sesión
- Header requerido para rutas protegidas: `Authorization: Bearer <token>`
- Roles soportados: `alumno`, `profesor`, `superadmin`
- Aprobación de alumno: algunas rutas requieren que el usuario esté aprobado (`requireApproved`)

### Endpoints de Auth (`/auth`)
- `GET /auth/ping`
  - Respuesta: ping para ver disponibilidad de módulo auth
- `POST /auth/login`
  - Body: `{ username | email, password }`
  - Respuesta: `{ token, user }`
- `GET /auth/session`
  - Requiere: JWT
  - Respuesta: sesión del usuario actual
- `POST /auth/register`
  - Body: datos de registro (validación por `registerValidator`)
  - Respuesta: usuario registrado
- `PATCH /auth/aprobar/:id`
  - Requiere: JWT (roles `superadmin` o `profesor`)
  - Acción: aprobar usuario
- `GET /auth/usuarios`
  - Requiere: JWT (roles `superadmin` o `profesor`)
  - Listado de usuarios vía módulo auth

## Módulo Usuarios (`/usuarios`)
- Todas requieren JWT y roles `superadmin` o `profesor`
- `GET /usuarios/` → listar usuarios
- `GET /usuarios/:id` → detalle
- `POST /usuarios/` → crear
- `PUT /usuarios/:id` → actualizar
- `DELETE /usuarios/:id` → eliminar

## Módulo Assignments (`/assignments`)
- `GET /assignments/`
  - Requiere: JWT
  - Lista todas las asignaciones visibles según permisos
- `GET /assignments/:id`
  - Requiere: JWT
  - Valida `:id` MongoId
- `POST /assignments/`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Body: validado por `assignmentValidator`
- `PUT /assignments/:id`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Body: validado por `assignmentValidator`
- `DELETE /assignments/:id`
  - Requiere: JWT (roles `profesor`, `superadmin`)

## Módulo Slots (`/slots`)
- `GET /slots/mis-solicitudes`
  - Requiere: JWT (rol `alumno`) y aprobado
  - Devuelve solicitudes del alumno
- `GET /slots/`
  - Requiere: JWT
  - Lista de turnos
- `GET /slots/:id`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Detalle de turno
- `POST /slots/`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Body: validado con `createSlotValidator`
- `PATCH /slots/:id/solicitar`
  - Requiere: JWT (rol `alumno`) y aprobado
  - Solicitar turno
- `PATCH /slots/:id/estado`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Actualiza estado de revisión (validado por `updateEstadoValidator`)
- `PATCH /slots/:id/cancelar`
  - Requiere: JWT (rol `alumno`) y aprobado
  - Cancelar turno
- `PUT /slots/:id`
  - Requiere: JWT (roles `profesor`, `superadmin`)
  - Actualiza turno (validado por `updateSlotValidator`)
- `DELETE /slots/:id`
  - Requiere: JWT (roles `profesor`, `superadmin`)

## Módulo Submissions (`/submissions`)
- `GET /submissions/`
  - Requiere: JWT (roles `alumno`, `profesor`, `superadmin`)
  - Soporta filtros por query (dashboard)
- `GET /submissions/detail/:id`
  - Requiere: JWT (roles `alumno`, `profesor`, `superadmin`)
  - Valida `:id` MongoId
- `GET /submissions/:userId`
  - Requiere: JWT (roles `alumno`, `profesor`, `superadmin`)
  - Valida `:userId` MongoId
- `POST /submissions/:id`
  - Requiere: JWT (rol `alumno`) y aprobado
  - `:id` es el ID de turno
  - Body: validado con `submissionValidator`
- `PUT /submissions/:id`
  - Requiere: JWT (roles `alumno`, `profesor`, `superadmin`) y aprobado
  - Body: validado con `submissionValidator`
- `DELETE /submissions/:id`
  - Requiere: JWT (roles `alumno`, `profesor`, `superadmin`) y aprobado

## Módulo Entregas Administrativo (`/entregas`)
- Todas requieren JWT y roles `profesor`, `superadmin`
- `GET /entregas/` → listar
- `GET /entregas/:id` → detalle
- `POST /entregas/` → crear
- `PUT /entregas/:id` → actualizar
- `DELETE /entregas/:id` → eliminar

## Validaciones y Errores
- Validación con `express-validator` y middleware `validateRequest`
- Errores centralizados por `errorHandler`
- `400` errores de validación; `401` sin JWT; `403` sin rol; `404` no encontrado

## DTOs / Mappers (guía para frontend)
- Usuarios: `utils/mappers/userMapper.mjs` → `mapToFrontend(user)` 
  - Expone: `cohorte` (independiente), `moduleNumber` (derivado de cohorte), `moduleCode`, `moduleLabel` (desde modulo)
  - Campo `cohorte` ahora persiste el valor elegido por el usuario sin sincronización automática con módulo
- Slots: `utils/mappers/slotMapper.mjs` → `toFrontend(slot)`
  - Incluye `modulo` del profesor que creó el turno (filtrado por módulo)
  - helpers `timeFormatter`, estados
- Submissions: `utils/mappers/submissionMapper.mjs` → `toFrontend(submission)`; `extractEstado`
- Normalización: `utils/normalizers/normalizers.mjs` y `utils/common/normalizers.mjs`
- Permisos: `utils/permissionUtils.mjs` → filtros de módulo y visibilidad (prefiere `cohorte` como fuente primaria)

## Estados, Roles y Constantes
- Ver `constants/constantes.mjs` para:
  - `VALID_ROLES`, `VALID_ESTADOS`
  - Mapeos `REVIEW_STATUS_*`, `ESTADO_TO_REVIEW_STATUS`
  - Formateo de tiempos y labels de módulo

## Resumen de Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

## Ejemplos de Uso Rápido
- Login:
  - `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "Passw0rd!" }`
- Obtener sesión:
  - `GET /auth/session` con `Authorization`
- Listar turnos:
  - `GET /slots` con `Authorization`
- Solicitar turno:
  - `PATCH /slots/<slotId>/solicitar` con `Authorization` (alumno aprobado)
- Crear entrega:
  - `POST /submissions/<slotId>` con `Authorization`

## Inicio Rápido (Frontend)
1. Configurar `.env` del backend con `MONGO_URL` y `JWT_SECRET`
2. Arrancar backend en `http://localhost:3000`
3. Hacer `POST /auth/login` y guardar `token`
4. Incluir `Authorization: Bearer <token>` en todas las peticiones protegidas
5. Seguir las rutas por rol y aprobación indicadas en las secciones anteriores

## Notas Operativas
- El servidor aborta al arrancar si faltan `MONGO_URL` o `JWT_SECRET`
- Logs HTTP con `morgan dev`
- CORS abierto (ajustar si el frontend está en otro dominio)

## Cambios Recientes
### Independencia de Cohorte (v1.1)
- **Modelo User**: campo `cohorte` es persistido independiente sin sincronización automática con `modulo`
- **Exposición**: DTOs de usuario ahora exponen `cohorte`, `moduleNumber` (derivado de cohorte), y `moduleCode` separados
- **Filtrado de permisos**: usa `cohorte` como fuente primaria para determinar módulo del usuario
- **Edición**: frontend puede actualizar `cohorte` sin afectar `modulo` (la etiqueta del módulo)

### Filtrado de Slots por Módulo (v1.1)
- **Modelo ReviewSlot**: nuevo campo `modulo` (enum) persiste el módulo del profesor creador
- **Creación de turnos**: `POST /slots/` asigna automáticamente el `modulo` del profesor autenticado
- **Listado de turnos**: `GET /slots/` filtra por módulo del usuario actual (aislamiento de cohortes)
