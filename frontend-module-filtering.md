# Guia de filtrado por modulo para el frontend

Este documento describe como consumir los endpoints del backend para que el frontend muestre la informacion correcta a **alumnos**, **profesores** y **superadmins** segun su modulo. Tambien valida que el servidor ya esta preparado para soportar este comportamiento.

---

## 1. Campos disponibles al autenticarse

Cuando un usuario inicia sesion (`POST /auth/login`) el backend devuelve un objeto `user` sanitizado que conserva los metadatos necesarios para filtrar:

- `role`: `alumno`, `profesor` o `superadmin`.
- `cohort`: identificador numerico del modulo/cohorte asignado.
- `modulo` y `moduloSlug` (si estan presentes en la base de datos seed).
- `isApproved` y `estado` para validar accesos.

Referencia: `services/authService.mjs` y sanitizado en `utils/sanitizeUser.mjs`.

> Recomendacion frontend: guardar estos campos en el store de sesion. El numero de cohorte sirve para consultar turnos y usuarios; el slug o la etiqueta pueden usarse para mostrar nombres legibles.

---

## 2. Mapeo de modulos

El backend centraliza la relacion **cohorte <-> etiqueta** en `utils/moduleMap.mjs`:

| Cohorte (`cohort`) | Etiqueta normalizada (`moduleToLabel`) |
| --- | --- |
| `1` | `HTML-CSS` |
| `2` | `JAVASCRIPT` |
| `3` | `NODE` |
| `4` | `REACT` |

Funciones disponibles:

- `moduleToLabel(numero)` -> etiqueta en mayusculas.
- `labelToModule("HTML-CSS")` -> numero de cohorte.
- `ensureModuleLabel(valor)` -> etiqueta valida siempre en mayusculas.

> Recomendacion frontend: reutilizar este mismo mapeo (copiarlo o consumirlo desde un endpoint) para construir menus de filtrado coherentes.

---

## 3. Endpoints clave y parametros soportados

### 3.1 Usuarios (profesores y superadmin)

- **Ruta**: `GET /auth/usuarios`
- **Autorizacion**: requiere token de un `superadmin` o `profesor` (middleware `allowRoles("superadmin", "profesor")` en `routes/authRoutes.mjs`).
- **Query params soportados** (`services/frontendUserService.mjs`):
  - `rol=alumno|profesor|superadmin`
  - `estado=Pendiente|Aprobado|Rechazado`
  - `modulo=HTML-CSS|JAVASCRIPT|NODE|REACT` (insensible a minusculas).

> Profesor: filtrar inicialmente usando su propio modulo (`moduleToLabel(user.cohort)`).
>
> Superadmin: puede listar todo y aplicar filtros manualmente si necesita segmentar.

### 3.2 Turnos (listado publico para el frontend)

- **Ruta**: `GET /turnos`
- **Fuente**: `routes/turnosRoutes.mjs` → `controllers/slotController.mjs` → `services/frontendSlotService.mjs`.
- **Query params soportados**:
  - `modulo=HTML-CSS|JAVASCRIPT|NODE|REACT`
  - `cohort=1|2|3|4`
  - `review` (numero de revision)
  - `estado=Disponible|Solicitado|Aprobado|Rechazado`
  - `userId` (filtra por solicitante; acepta ObjectId o cadena normalizada).

La respuesta incluye campos ya formateados:

- `modulo` (etiqueta legible), `cohort`, `reviewNumber`, `estado`, `reviewStatus`, `start`, `end`, `startTime`, `endTime`, `room`, `zoomLink`, `comentarios`, `solicitanteId`, `solicitanteEmail`.

> Profesor: combinar `modulo` y `estado` para ver disponibilidad de su cohorte.
>
> Alumno: utilizar su cohorte (`cohort` del login) para consultar `GET /turnos?cohort=1` o la etiqueta `GET /turnos?modulo=HTML-CSS`.
>
> Superadmin: acceder sin filtros y ofrecer herramientas de busqueda global.

### 3.3 Turnos autenticados (`/slots`)

- **Ruta**: `GET /slots`
- **Uso**: panel interno autenticado (mismo controlador que `/turnos` pero sin sanitizado adicional).
- **Query params**: actualmente admite `cohort`, y la capa de servicio (`slotService.obtenerTurnosPorFiltro`) esta lista para ampliarse si fuese necesario exponer `modulo`.

> Servidor: ya diferencia accesos por rol (ver `routes/slotRoutes.mjs`) y valida cohorte del alumno al solicitar o cancelar (`services/slotService.mjs`).

---

## 4. Datos completos en turnos seed

El script `scripts/crearTurnosReviews.mjs` rellena todas las columnas del modelo:

- `cohort`, `reviewNumber`, `date`, `startTime`, `endTime`, `start`, `end`, `room`, `zoomLink`, `estado`, `reviewStatus`, `comentarios`, `modulo`, `moduloSlug`, `student`, `assignment`, `approvedByProfessor`.

Esto garantiza que el frontend reciba registros listos para mostrar sin casos vacios.

---

## 5. Flujos sugeridos por rol

### Alumno
1. Al iniciar sesion, guardar `cohort` y `role`.
2. Para listar turnos disponibles: `GET /turnos?cohort=<cohort>` o `modulo=<etiqueta>`.
3. Para reservar: usar los endpoints autenticados (`PATCH /slots/:id/solicitar`) que ya validan que la cohorte coincida con la del alumno (`services/slotService.mjs`).

### Profesor
1. Tras login, obtener `cohort` y etiqueta mediante `moduleToLabel`.
2. Listar alumnos de su modulo: `GET /auth/usuarios?rol=alumno&modulo=<etiqueta>`.
3. Administrar turnos: `GET /turnos?modulo=<etiqueta>` y usar `PATCH /slots/:id/estado` para aprobar o rechazar.

### Superadmin
1. Acceso completo a `/auth/usuarios` y `/turnos` sin filtros iniciales.
2. Puede aplicar `rol`, `estado` y `modulo` segun la vista necesaria.
3. Puede crear turnos seed adicionales llamando a `POST /turnos` (usa `frontendSlotService.crearTurno`).

---

## 6. Validacion de soporte en el servidor

- **Filtrado de usuarios**: `services/frontendUserService.mjs` ya soporta `rol`, `estado` y `modulo` (lineas 20-70).
- **Filtrado de turnos**: `services/frontendSlotService.mjs` procesa `cohort`, `review`, `estado`, `modulo` y `userId` (lineas 320-360).
- **Autorizacion por rol**: middlewares `auth` + `allowRoles` se aplican en `routes/authRoutes.mjs` y `routes/slotRoutes.mjs`.
- **Datos seed completos**: `scripts/crearTurnosReviews.mjs` genera registros con todos los campos utilizados por el frontend.

> Conclusion: no se requieren cambios de backend adicionales; basta con que el frontend utilice los campos y query params descritos.

---

## 7. Checklist para el equipo frontend

- [ ] Consumir `POST /auth/login` y almacenar `role`, `cohort`, `modulo`, `moduloSlug`.
- [ ] Reutilizar el mapeo de `utils/moduleMap.mjs` para mostrar nombres de modulos.
- [ ] Para listados:
  - Usuarios: `GET /auth/usuarios?modulo=HTML-CSS` (profesor o superadmin).
  - Turnos: `GET /turnos?cohort=1` (alumno) o `GET /turnos?modulo=NODE&estado=Disponible` (profesor).
- [ ] Usar `PATCH /slots/:id/solicitar` y `PATCH /slots/:id/cancelar` solo para alumnos aprobados.
- [ ] Validar estados (`Disponible`, `Solicitado`, `Aprobado`, `Rechazado`) en la UI con los mismos literales que el backend.

Con esta configuracion, el frontend puede filtrar y mostrar la informacion adecuada para cada rol sin modificaciones adicionales en el servidor.
