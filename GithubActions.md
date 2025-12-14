Run npm test

> turnos-app@0.0.0 test
> vitest run


 RUN  v3.2.4 /home/runner/work/turnos-app-frontend/turnos-app-frontend

stdout | test/integration/turnosService.integration.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`

stdout | test/e2e/criticalFlows.e2e.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops

stdout | test/e2e/createUsers.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops

stdout | test/e2e/criticalFlows.e2e.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

 ❯ test/e2e/criticalFlows.e2e.test.js (12 tests | 12 skipped) 11ms
   ↓ Flujos Críticos: Rol Alumno > alumno puede listar slots disponibles (GET /slots)
   ↓ Flujos Críticos: Rol Alumno > alumno NO ve RequestsPanel (validación UI - manual)
   ↓ Flujos Críticos: Rol Alumno > alumno puede solicitar un slot disponible (PATCH /slots/:id/solicitar)
   ↓ Flujos Críticos: Rol Alumno > creación de entrega muestra errores de validación por campo
   ↓ Flujos Críticos: Rol Alumno > alumno solo ve sus propias entregas (GET /submissions/:userId)
   ↓ Flujos Críticos: Rol Profesor > profesor puede crear turno (POST /slots)
   ↓ Flujos Críticos: Rol Profesor > profesor puede aprobar solicitud de turno (PUT /slots/:id)
   ↓ Flujos Críticos: Rol Profesor > profesor puede evaluar entregas (PUT /entregas/:id)
   ↓ Flujos Críticos: Rol Superadmin > superadmin puede crear usuario con password por defecto
   ↓ Flujos Críticos: Rol Superadmin > superadmin puede aprobar usuario pendiente (PATCH /auth/aprobar/:id)
   ↓ Flujos Críticos: Rol Superadmin > updateTurno preserva fecha/horario/room al cambiar estado
   ↓ Validaciones Generales > case-sensitivity: backend maneja estados normalizados
stdout | test/integration/turnosService.integration.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

 ❯ test/integration/turnosService.integration.test.js (5 tests | 5 failed) 17ms
   × Servicios de turnos (API real) > crea un turno y lo puede recuperar 11ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
   × Servicios de turnos (API real) > actualiza un turno recien creado 1ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
   × Servicios de turnos (API real) > elimina un turno y la busqueda posterior falla 1ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
   × Servicios de turnos (API real) > rechaza la creación con datos inválidos 1ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
   × Servicios de turnos (API real) > devuelve listado de turnos incluyendo los nuevos 1ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
stdout | test/e2e/createUsers.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: *** }

stdout | test/e2e/createUsers.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

stderr | test/e2e/createUsers.e2e.test.jsx
[e2e] falta/s profesor, superadmin | define TEST_E2E_PROFESOR_EMAIL, TEST_E2E_PROFESOR_PASSWORD, TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.
[e2e] falta/s superadmin | define TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.

 ↓ test/e2e/createUsers.e2e.test.jsx (2 tests | 2 skipped)
stdout | test/e2e/dashboardFlows.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit

stdout | test/e2e/evaluarEntregas.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`

stdout | test/e2e/evaluarEntregas.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops

stdout | test/e2e/evaluarEntregas.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops

stderr | test/e2e/evaluarEntregas.e2e.test.jsx
[e2e] falta/s profesor, superadmin | define TEST_E2E_PROFESOR_EMAIL, TEST_E2E_PROFESOR_PASSWORD, TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.

 ↓ test/e2e/evaluarEntregas.e2e.test.jsx (1 test | 1 skipped)
stdout | test/e2e/dashboardFlows.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops

stdout | test/e2e/dashboardFlows.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }

stderr | test/e2e/dashboardFlows.e2e.test.jsx
[e2e] falta/s alumno, superadmin | define TEST_E2E_ALUMNO_EMAIL, TEST_E2E_ALUMNO_PASSWORD, TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.
[e2e] falta/s profesor, superadmin | define TEST_E2E_PROFESOR_EMAIL, TEST_E2E_PROFESOR_PASSWORD, TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.
[e2e] falta/s superadmin | define TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.

 ↓ test/e2e/dashboardFlows.e2e.test.jsx (3 tests | 3 skipped)
stdout | test/e2e/serverAvailability.e2e.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops

stdout | test/e2e/serverAvailability.e2e.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: *** }

 ❯ test/e2e/serverAvailability.e2e.test.js (3 tests | 3 skipped) 9ms
   ↓ Disponibilidad real de la API de turnos > devuelve el listado de slots publicado
   ↓ Disponibilidad real de la API de turnos > permite crear y eliminar un slot temporal
   ↓ Disponibilidad real de la API de turnos > valida contrato de error unificado {message, errores?}
stdout | test/integration/usuariosService.integration.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

stdout | test/integration/usuariosService.integration.test.js
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

 ❯ test/integration/usuariosService.integration.test.js (1 test | 1 failed) 12ms
   × Usuarios - Integración real contra API > crea un usuario, verifica el listado actualizado y lo elimina 9ms
     → [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
stdout | test/e2e/evaluarEntregasList.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }

stdout | src/components/ui/__tests__/Pagination.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops

stdout | test/e2e/evaluarEntregasList.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops

stderr | test/e2e/evaluarEntregasList.e2e.test.jsx
[e2e] falta/s profesor, superadmin | define TEST_E2E_PROFESOR_EMAIL, TEST_E2E_PROFESOR_PASSWORD, TEST_E2E_SUPERADMIN_EMAIL, TEST_E2E_SUPERADMIN_PASSWORD en tus variables de entorno para habilitar estas pruebas.

stdout | test/e2e/evaluarEntregasList.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops

 ↓ test/e2e/evaluarEntregasList.e2e.test.jsx (1 test | 1 skipped)
 ✓ src/components/ui/__tests__/Pagination.test.jsx (1 test) 296ms
stdout | test/e2e/appNavigation.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops

stdout | test/e2e/appNavigation.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops

stdout | test/e2e/appNavigation.e2e.test.jsx
[dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops

stderr | test/e2e/appNavigation.e2e.test.jsx
[e2e] falta/s profesor | define TEST_E2E_PROFESOR_EMAIL, TEST_E2E_PROFESOR_PASSWORD en tus variables de entorno para habilitar estas pruebas.

stderr | test/e2e/appNavigation.e2e.test.jsx > Navegacion publica de la aplicacion > redirecciona a login cuando un visitante accede a un dashboard
Not implemented: HTMLMediaElement's pause() method

stderr | test/e2e/appNavigation.e2e.test.jsx > Navegacion publica de la aplicacion > redirecciona a login cuando un visitante accede a un dashboard
Not implemented: HTMLMediaElement's pause() method

 ✓ test/e2e/appNavigation.e2e.test.jsx (3 tests | 1 skipped) 769ms
   ✓ Navegacion publica de la aplicacion > muestra la landing page con su CTA principal  667ms

⎯⎯⎯⎯⎯⎯ Failed Suites 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/e2e/criticalFlows.e2e.test.js [ test/e2e/criticalFlows.e2e.test.js ]
Error: [realBackendSession] Define TEST_E2E_ALUMNO_EMAIL/TEST_E2E_ALUMNO_PASSWORD en tu entorno para autenticar el rol "alumno".
 ❯ resolveRoleCredentials test/utils/realBackendSession.js:94:11
     92|   const password = process.env[envConfig.password];
     93|   if (!email || !password) {
     94|     throw new Error(
       |           ^
     95|       `[realBackendSession] Define ${envConfig.email}/${envConfig.pass…
     96|     );
 ❯ resolveAuthSession test/utils/realBackendSession.js:128:37
 ❯ test/e2e/criticalFlows.e2e.test.js:49:43

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  test/e2e/serverAvailability.e2e.test.js [ test/e2e/serverAvailability.e2e.test.js ]
Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
 ❯ resolveRoleCredentials test/utils/realBackendSession.js:94:11
     92|   const password = process.env[envConfig.password];
     93|   if (!email || !password) {
     94|     throw new Error(
       |           ^
     95|       `[realBackendSession] Define ${envConfig.email}/${envConfig.pass…
     96|     );
 ❯ resolveAuthSession test/utils/realBackendSession.js:128:37
 ❯ test/e2e/serverAvailability.e2e.test.js:17:43

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/integration/turnosService.integration.test.js > Servicios de turnos (API real) > crea un turno y lo puede recuperar
 FAIL  test/integration/turnosService.integration.test.js > Servicios de turnos (API real) > actualiza un turno recien creado
 FAIL  test/integration/turnosService.integration.test.js > Servicios de turnos (API real) > elimina un turno y la busqueda posterior falla
 FAIL  test/integration/turnosService.integration.test.js > Servicios de turnos (API real) > rechaza la creación con datos inválidos
 FAIL  test/integration/turnosService.integration.test.js > Servicios de turnos (API real) > devuelve listado de turnos incluyendo los nuevos
Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
 ❯ resolveRoleCredentials test/utils/realBackendSession.js:94:11
     92|   const password = process.env[envConfig.password];
     93|   if (!email || !password) {
     94|     throw new Error(
       |           ^
     95|       `[realBackendSession] Define ${envConfig.email}/${envConfig.pass…
     96|     );
 ❯ resolveAuthSession test/utils/realBackendSession.js:128:37
 ❯ test/integration/turnosService.integration.test.js:70:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  test/integration/usuariosService.integration.test.js > Usuarios - Integración real contra API > crea un usuario, verifica el listado actualizado y lo elimina
Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol "superadmin".
 ❯ resolveRoleCredentials test/utils/realBackendSession.js:94:11
     92|   const password = process.env[envConfig.password];
     93|   if (!email || !password) {
     94|     throw new Error(
       |           ^
     95|       `[realBackendSession] Define ${envConfig.email}/${envConfig.pass…
     96|     );
 ❯ resolveAuthSession test/utils/realBackendSession.js:128:37
 ❯ test/integration/usuariosService.integration.test.js:39:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯


 Test Files  4 failed | 2 passed | 4 skipped (10)
      Tests  6 failed | 3 passed | 23 skipped (32)
   Start at  22:22:03
   Duration  5.20s (transform 1.13s, setup 1.74s, collect 1.55s, tests 1.11s, environment 6.01s, prepare 837ms)

{"numTotalTestSuites":23,"numPassedTestSuites":17,"numFailedTestSuites":6,"numPendingTestSuites":0,"numTotalTests":32,"numPassedTests":3,"numFailedTests":6,"numPendingTests":23,"numTodoTests":0,"snapshot":{"added":0,"failure":false,"filesAdded":0,"filesRemoved":0,"filesRemovedList":[],"filesUnmatched":0,"filesUpdated":0,"matched":0,"total":0,"unchecked":0,"uncheckedKeysByFile":[],"unmatched":0,"updated":0,"didUpdate":false},"startTime":1765750923396,"success":false,"testResults":[{"assertionResults":[{"ancestorTitles":["Navegacion publica de la aplicacion"],"fullName":"Navegacion publica de la aplicacion muestra la landing page con su CTA principal","status":"passed","title":"muestra la landing page con su CTA principal","duration":666.8575700000001,"failureMessages":[],"meta":{}},{"ancestorTitles":["Navegacion publica de la aplicacion"],"fullName":"Navegacion publica de la aplicacion redirecciona a login cuando un visitante accede a un dashboard","status":"passed","title":"redirecciona a login cuando un visitante accede a un dashboard","duration":100.55236700000023,"failureMessages":[],"meta":{}},{"ancestorTitles":["Navegacion publica de la aplicacion"],"fullName":"Navegacion publica de la aplicacion renderiza correctamente la gestion de turnos publica","status":"skipped","title":"renderiza correctamente la gestion de turnos publica","failureMessages":[],"meta":{}}],"startTime":1765750927808,"endTime":1765750928575.5522,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/appNavigation.e2e.test.jsx"},{"assertionResults":[{"ancestorTitles":["CreateUsers - flujo end-to-end"],"fullName":"CreateUsers - flujo end-to-end restringe a los profesores a crear solo alumnos y refleja el alta","status":"skipped","title":"restringe a los profesores a crear solo alumnos y refleja el alta","failureMessages":[],"meta":{}},{"ancestorTitles":["CreateUsers - flujo end-to-end"],"fullName":"CreateUsers - flujo end-to-end permite a un superadmin crear, editar y eliminar usuarios","status":"skipped","title":"permite a un superadmin crear, editar y eliminar usuarios","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/createUsers.e2e.test.jsx"},{"assertionResults":[{"ancestorTitles":["Flujos Críticos: Rol Alumno"],"fullName":"Flujos Críticos: Rol Alumno alumno puede listar slots disponibles (GET /slots)","status":"skipped","title":"alumno puede listar slots disponibles (GET /slots)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Alumno"],"fullName":"Flujos Críticos: Rol Alumno alumno NO ve RequestsPanel (validación UI - manual)","status":"skipped","title":"alumno NO ve RequestsPanel (validación UI - manual)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Alumno"],"fullName":"Flujos Críticos: Rol Alumno alumno puede solicitar un slot disponible (PATCH /slots/:id/solicitar)","status":"skipped","title":"alumno puede solicitar un slot disponible (PATCH /slots/:id/solicitar)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Alumno"],"fullName":"Flujos Críticos: Rol Alumno creación de entrega muestra errores de validación por campo","status":"skipped","title":"creación de entrega muestra errores de validación por campo","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Alumno"],"fullName":"Flujos Críticos: Rol Alumno alumno solo ve sus propias entregas (GET /submissions/:userId)","status":"skipped","title":"alumno solo ve sus propias entregas (GET /submissions/:userId)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Profesor"],"fullName":"Flujos Críticos: Rol Profesor profesor puede crear turno (POST /slots)","status":"skipped","title":"profesor puede crear turno (POST /slots)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Profesor"],"fullName":"Flujos Críticos: Rol Profesor profesor puede aprobar solicitud de turno (PUT /slots/:id)","status":"skipped","title":"profesor puede aprobar solicitud de turno (PUT /slots/:id)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Profesor"],"fullName":"Flujos Críticos: Rol Profesor profesor puede evaluar entregas (PUT /entregas/:id)","status":"skipped","title":"profesor puede evaluar entregas (PUT /entregas/:id)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Superadmin"],"fullName":"Flujos Críticos: Rol Superadmin superadmin puede crear usuario con password por defecto","status":"skipped","title":"superadmin puede crear usuario con password por defecto","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Superadmin"],"fullName":"Flujos Críticos: Rol Superadmin superadmin puede aprobar usuario pendiente (PATCH /auth/aprobar/:id)","status":"skipped","title":"superadmin puede aprobar usuario pendiente (PATCH /auth/aprobar/:id)","failureMessages":[],"meta":{}},{"ancestorTitles":["Flujos Críticos: Rol Superadmin"],"fullName":"Flujos Críticos: Rol Superadmin updateTurno preserva fecha/horario/room al cambiar estado","status":"skipped","title":"updateTurno preserva fecha/horario/room al cambiar estado","failureMessages":[],"meta":{}},{"ancestorTitles":["Validaciones Generales"],"fullName":"Validaciones Generales case-sensitivity: backend maneja estados normalizados","status":"skipped","title":"case-sensitivity: backend maneja estados normalizados","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"failed","message":"[realBackendSession] Define TEST_E2E_ALUMNO_EMAIL/TEST_E2E_ALUMNO_PASSWORD en tu entorno para autenticar el rol \"alumno\".","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/criticalFlows.e2e.test.js"},{"assertionResults":[{"ancestorTitles":["Dashboards protegidos end-to-end"],"fullName":"Dashboards protegidos end-to-end renderiza el dashboard de alumno con turnos disponibles","status":"skipped","title":"renderiza el dashboard de alumno con turnos disponibles","failureMessages":[],"meta":{}},{"ancestorTitles":["Dashboards protegidos end-to-end"],"fullName":"Dashboards protegidos end-to-end muestra las solicitudes pendientes y usuarios en el dashboard de profesor","status":"skipped","title":"muestra las solicitudes pendientes y usuarios en el dashboard de profesor","failureMessages":[],"meta":{}},{"ancestorTitles":["Dashboards protegidos end-to-end"],"fullName":"Dashboards protegidos end-to-end habilita la gestión global en el dashboard de superadmin y el panel flotante","status":"skipped","title":"habilita la gestión global en el dashboard de superadmin y el panel flotante","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/dashboardFlows.e2e.test.jsx"},{"assertionResults":[{"ancestorTitles":["Evaluar Entregas - end-to-end"],"fullName":"Evaluar Entregas - end-to-end filtra, aprueba y desaprueba entregables pendientes","status":"skipped","title":"filtra, aprueba y desaprueba entregables pendientes","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/evaluarEntregas.e2e.test.jsx"},{"assertionResults":[{"ancestorTitles":["Evaluar Entregas - listado para profesor módulo 1"],"fullName":"Evaluar Entregas - listado para profesor módulo 1 muestra entregas del módulo 1 al profesor asignado","status":"skipped","title":"muestra entregas del módulo 1 al profesor asignado","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/evaluarEntregasList.e2e.test.jsx"},{"assertionResults":[{"ancestorTitles":["Disponibilidad real de la API de turnos"],"fullName":"Disponibilidad real de la API de turnos devuelve el listado de slots publicado","status":"skipped","title":"devuelve el listado de slots publicado","failureMessages":[],"meta":{}},{"ancestorTitles":["Disponibilidad real de la API de turnos"],"fullName":"Disponibilidad real de la API de turnos permite crear y eliminar un slot temporal","status":"skipped","title":"permite crear y eliminar un slot temporal","failureMessages":[],"meta":{}},{"ancestorTitles":["Disponibilidad real de la API de turnos"],"fullName":"Disponibilidad real de la API de turnos valida contrato de error unificado {message, errores?}","status":"skipped","title":"valida contrato de error unificado {message, errores?}","failureMessages":[],"meta":{}}],"startTime":1765750923396,"endTime":1765750923396,"status":"failed","message":"[realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/e2e/serverAvailability.e2e.test.js"},{"assertionResults":[{"ancestorTitles":["Servicios de turnos (API real)"],"fullName":"Servicios de turnos (API real) crea un turno y lo puede recuperar","status":"failed","title":"crea un turno y lo puede recuperar","duration":11.196172999999817,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js:70:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}},{"ancestorTitles":["Servicios de turnos (API real)"],"fullName":"Servicios de turnos (API real) actualiza un turno recien creado","status":"failed","title":"actualiza un turno recien creado","duration":1.1132000000000062,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js:70:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}},{"ancestorTitles":["Servicios de turnos (API real)"],"fullName":"Servicios de turnos (API real) elimina un turno y la busqueda posterior falla","status":"failed","title":"elimina un turno y la busqueda posterior falla","duration":0.8111209999999573,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js:70:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}},{"ancestorTitles":["Servicios de turnos (API real)"],"fullName":"Servicios de turnos (API real) rechaza la creación con datos inválidos","status":"failed","title":"rechaza la creación con datos inválidos","duration":0.6844260000000304,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js:70:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}},{"ancestorTitles":["Servicios de turnos (API real)"],"fullName":"Servicios de turnos (API real) devuelve listado de turnos incluyendo los nuevos","status":"failed","title":"devuelve listado de turnos incluyendo los nuevos","duration":0.683373999999958,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js:70:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}}],"startTime":1765750924619,"endTime":1765750924633.6833,"status":"failed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/turnosService.integration.test.js"},{"assertionResults":[{"ancestorTitles":["Usuarios - Integración real contra API"],"fullName":"Usuarios - Integración real contra API crea un usuario, verifica el listado actualizado y lo elimina","status":"failed","title":"crea un usuario, verifica el listado actualizado y lo elimina","duration":9.212229999999636,"failureMessages":["Error: [realBackendSession] Define TEST_E2E_SUPERADMIN_EMAIL/TEST_E2E_SUPERADMIN_PASSWORD en tu entorno para autenticar el rol \"superadmin\".\n    at resolveRoleCredentials (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:94:11)\n    at resolveAuthSession (/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/utils/realBackendSession.js:128:37)\n    at /home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/usuariosService.integration.test.js:39:27\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1436:51)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1442:25)\n    at callSuiteHook (file:///home/runner/work/turnos-app-frontend/turnos-app-frontend/node_modules/@vitest/runner/dist/chunk-hooks.js:1429:21)"],"meta":{}}],"startTime":1765750926830,"endTime":1765750926839.2122,"status":"failed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/test/integration/usuariosService.integration.test.js"},{"assertionResults":[{"ancestorTitles":["Pagination"],"fullName":"Pagination changes page when next button is clicked","status":"passed","title":"changes page when next button is clicked","duration":294.2736909999994,"failureMessages":[],"meta":{}}],"startTime":1765750927090,"endTime":1765750927384.2737,"status":"passed","message":"","name":"/home/runner/work/turnos-app-frontend/turnos-app-frontend/src/components/ui/__tests__/Pagination.test.jsx"}]}
Error: Process completed with exit code 1.