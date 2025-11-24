# Sistema de Módulos y Permisos - Arquitectura de Segmentación

**Fecha:** 23 de Noviembre, 2025  
**Propósito:** Guía técnica para integración frontend - Sistema de permisos basado en módulos

---

## 📋 Tabla de Contenidos

1. [Concepto de Módulo](#concepto-de-módulo)
2. [Arquitectura de Permisos](#arquitectura-de-permisos)
3. [Identificación de Usuarios por Módulo](#identificación-de-usuarios-por-módulo)
4. [Filtrado Automático de Datos](#filtrado-automático-de-datos)
5. [Casos de Uso por Rol](#casos-de-uso-por-rol)
6. [Implementación Frontend](#implementación-frontend)
7. [Ejemplos de Flujos Completos](#ejemplos-de-flujos-completos)

---

## Concepto de Módulo

### Definición

Un **módulo** representa una materia o área de conocimiento dentro de la Diplomatura Full Stack. Cada módulo tiene:

- **Código numérico** (1-4)
- **Nombre canónico** (string)
- **Slug** (identificador corto)

### Módulos Disponibles

```javascript
const MODULES = [
  { code: 1, name: "HTML-CSS", slug: "htmlcss" },
  { code: 2, name: "JAVASCRIPT", slug: "javascript" },
  { code: 3, name: "BACKEND - NODE JS", slug: "node" },
  { code: 4, name: "FRONTEND - REACT", slug: "react" }
];
```

### Campo `moduleCode` vs `cohorte`

**⚠️ IMPORTANTE:** En el modelo User:

```javascript
{
  moduleCode: Number,  // Código del módulo (1-4)
  cohorte: Number,     // Alias de moduleCode (mismo valor)
  modulo: String       // Nombre del módulo ("HTML-CSS", etc.)
}
```

- `moduleCode` y `cohorte` **siempre tienen el mismo valor**
- `modulo` es el nombre legible del módulo
- El backend utiliza `cohorte` para filtrar en las consultas de base de datos
- El frontend debe usar `moduleNumber` o `moduleCode` para identificar el módulo

---

## Arquitectura de Permisos

### Centralización en `permissionUtils.mjs`

**Ubicación:** `utils/permissionUtils.mjs`

El sistema de permisos está completamente centralizado en este módulo, que exporta:

1. **`buildModuleFilter(requester, options)`** - Genera filtros de consulta por módulo
2. **`buildUserListFilter(requester, queryFilters)`** - Filtros específicos para usuarios
3. **`getModuleNumber(user)`** - Extrae el número de módulo de forma robusta

### Principio de Segmentación

**Regla de oro:** Cada profesor solo puede acceder a recursos de **su propio módulo**.

```
┌─────────────────────────────────────────────────────────┐
│                    SEGMENTACIÓN POR MÓDULO              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Profesor HTML-CSS (moduleCode: 1)                     │
│     ↓                                                   │
│  Solo ve/gestiona:                                      │
│    • Alumnos con moduleCode = 1                        │
│    • Asignaciones con cohorte = 1                      │
│    • Slots con cohorte = 1                             │
│    • Entregas de alumnos del módulo 1                  │
│                                                         │
│  NO puede ver/modificar recursos de módulos 2, 3, 4    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Identificación de Usuarios por Módulo

### Estructura del Usuario

```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: "alumno" | "profesor" | "superadmin";
  moduleCode: number;        // 1, 2, 3, o 4
  cohorte: number;           // Mismo valor que moduleCode
  modulo: string;            // "HTML-CSS", "JAVASCRIPT", etc.
  status: "Pendiente" | "Aprobado" | "Rechazado";
}
```

### Asignación de Módulo

#### Profesores

**Cada profesor está asignado a UN solo módulo:**

| Email | Nombre | moduleCode | modulo |
|-------|--------|------------|--------|
| `laura.silva.htmlcss@gmail.com` | Laura Silva | 1 | HTML-CSS |
| `gabriel.martinez.javascript@gmail.com` | Gabriel Martínez | 2 | JAVASCRIPT |
| `paula.costa.node@gmail.com` | Paula Costa | 3 | BACKEND - NODE JS |
| `sergio.ledesma.react@gmail.com` | Sergio Ledesma | 4 | FRONTEND - REACT |

#### Alumnos

**Cada alumno está inscrito en UN módulo:**

```javascript
// Ejemplo de alumno
{
  name: "Mateo Alvarez",
  email: "mateo.alvarez.htmlcss.01@gmail.com",
  role: "alumno",
  moduleCode: 1,
  modulo: "HTML-CSS",
  status: "Aprobado"
}
```

#### Superadmin

**No tiene restricción de módulo:**

```javascript
{
  name: "Admin App",
  email: "admin.seed@gmail.com",
  role: "superadmin",
  moduleCode: null,  // No aplica
  cohorte: null
}
```

---

## Filtrado Automático de Datos

### Función `buildModuleFilter()`

**Ubicación:** `utils/permissionUtils.mjs`

Esta función se invoca en **todos los servicios** antes de hacer consultas a la base de datos.

#### Parámetros

```javascript
buildModuleFilter(requester, options = {})
```

- **`requester`**: Usuario autenticado (`req.user`)
  - `role`: Rol del usuario
  - `moduleNumber` o `moduleCode`: Código del módulo
  - `id`: ID del usuario

- **`options`**: Configuración adicional
  - `queryFilters`: Filtros del query string (ej: `?cohort=1`)
  - `studentOnly`: Si `true`, agrega filtro `role: "alumno"`
  - `studentField`: Nombre del campo para filtrar por alumno (ej: `"student"`)
  - `userId`: ID específico para filtros

#### Retorno

```javascript
// Retorna un objeto de filtro para Mongoose
{
  cohorte: 1,           // Filtra por módulo (si aplica)
  role: "alumno",       // Filtra por rol (si studentOnly = true)
  student: "userId"     // Filtra por alumno específico (si studentField definido)
}
```

### Lógica por Rol

#### 1. Superadmin

```javascript
if (role === "superadmin") {
  // Sin restricciones de módulo
  // Solo aplica filtros opcionales del query
  if (queryFilters.cohort) {
    return { cohorte: queryFilters.cohort };
  }
  return {};  // Ve TODOS los recursos
}
```

**Ejemplo:**
- `GET /usuarios` → Ve todos los usuarios de todos los módulos
- `GET /usuarios?moduleNumber=1` → Filtra opcionalmente por módulo 1

#### 2. Profesor

```javascript
if (role === "profesor") {
  const moduloActual = Number(moduleNumber ?? moduleCode);
  
  if (!Number.isFinite(moduloActual)) {
    throw { status: 403, message: "No autorizado" };
  }
  
  // SIEMPRE filtra por su propio módulo
  const filtro = { cohorte: moduloActual };
  
  if (studentOnly) {
    filtro.role = "alumno";  // Solo alumnos de su módulo
  }
  
  return filtro;
}
```

**Ejemplo:**
- Profesor con `moduleCode: 1`
- `GET /usuarios` → Automáticamente filtra por `cohorte: 1` y `role: "alumno"`
- **Resultado:** Solo ve alumnos del módulo HTML-CSS

#### 3. Alumno

```javascript
if (role === "alumno") {
  const moduloActual = Number(moduleNumber ?? moduleCode);
  
  const filtro = { cohorte: moduloActual };
  
  if (studentField) {
    filtro[studentField] = userId ?? id;  // Solo sus propios recursos
  }
  
  return filtro;
}
```

**Ejemplo:**
- Alumno con `moduleCode: 2`
- `GET /submissions/:userId` → Filtra por `cohorte: 2` y `student: userId`
- **Resultado:** Solo ve sus propias entregas del módulo JAVASCRIPT

### Aplicación en Servicios

#### Ejemplo: `slotService.obtenerTurnosPorFiltro()`

```javascript
export async function obtenerTurnosPorFiltro(user, queryFilters = {}) {
  // 1. Construir filtro automático según rol y módulo
  const filtro = buildModuleFilter(user, { queryFilters });
  
  // 2. Aplicar filtro en consulta
  const slots = await slotRepository.obtenerTodos(filtro);
  
  // 3. Filtrado adicional para alumnos
  if (user.role === "alumno") {
    return slots.filter(slot => {
      const isDisponible = slot.estado === "Disponible";
      const isPropio = String(slot.student?._id) === String(user.id);
      return isDisponible || isPropio;
    });
  }
  
  return slots;
}
```

**Flujo:**
1. Profesor HTML-CSS llama `GET /slots`
2. `buildModuleFilter()` retorna `{ cohorte: 1 }`
3. Consulta SQL: `ReviewSlot.find({ cohorte: 1 })`
4. Solo obtiene slots del módulo HTML-CSS

---

## Casos de Uso por Rol

### Superadmin

#### Permisos
- ✅ Acceso completo a **todos** los módulos
- ✅ Puede crear/editar/eliminar recursos de cualquier módulo
- ✅ Puede filtrar opcionalmente por módulo usando query params

#### Endpoints sin restricción de módulo
```javascript
GET /usuarios                    // Todos los usuarios
GET /usuarios?moduleNumber=1     // Filtra por módulo 1
GET /assignments                 // Todas las asignaciones
GET /slots                       // Todos los slots
GET /entregas                    // Todas las entregas
```

#### Ejemplo de Uso
```javascript
// Login como superadmin
POST /auth/login
Body: {
  email: "admin.seed@gmail.com",
  password: "admin123"
}

// Listar todos los usuarios de todos los módulos
GET /usuarios
Response: [
  { nombre: "Alumno 1", moduleCode: 1, modulo: "HTML-CSS" },
  { nombre: "Alumno 2", moduleCode: 2, modulo: "JAVASCRIPT" },
  { nombre: "Alumno 3", moduleCode: 3, modulo: "BACKEND - NODE JS" },
  // ... todos los usuarios
]

// Filtrar por módulo específico
GET /usuarios?moduleNumber=1
Response: [
  { nombre: "Alumno 1", moduleCode: 1, modulo: "HTML-CSS" },
  { nombre: "Alumno 2", moduleCode: 1, modulo: "HTML-CSS" },
  // ... solo usuarios del módulo 1
]
```

---

### Profesor

#### Permisos
- ✅ Ver/gestionar **solo** recursos de su módulo
- ✅ Crear asignaciones para su módulo
- ✅ Crear/actualizar slots de su módulo
- ✅ Aprobar/rechazar entregas de alumnos de su módulo
- ✅ Aprobar cuentas de usuarios de su módulo
- ❌ **NO** puede acceder a recursos de otros módulos

#### Restricciones Aplicadas Automáticamente

**1. Listado de Usuarios**

```javascript
// Profesor HTML-CSS (moduleCode: 1)
GET /usuarios
// Filtro aplicado: { cohorte: 1, role: "alumno" }
// Respuesta: Solo alumnos del módulo HTML-CSS
```

**2. Creación de Asignaciones**

```javascript
// Profesor JAVASCRIPT (moduleCode: 2) crea asignación
POST /assignments
Body: {
  title: "Sprint 1 - JS",
  description: "Proyecto JavaScript",
  dueDate: "2025-12-01",
  modulo: "JAVASCRIPT"  // Debe coincidir con su módulo
}

// Backend automáticamente:
// 1. Valida que el módulo coincida con el profesor
// 2. Establece cohorte = 2
// 3. Establece createdBy = profesor._id
```

**3. Gestión de Slots**

```javascript
// Profesor BACKEND (moduleCode: 3)
GET /slots
// Filtro aplicado: { cohorte: 3 }
// Respuesta: Solo slots del módulo BACKEND - NODE JS

POST /slots
Body: {
  date: "2025-12-01",
  startTime: "10:00",
  endTime: "11:00",
  // ... otros campos
}
// Backend establece automáticamente cohorte = 3
```

**4. Revisión de Entregas**

```javascript
// Profesor REACT (moduleCode: 4)
GET /entregas
// Filtro aplicado: { cohorte: 4 }
// Respuesta: Solo entregas de alumnos del módulo FRONTEND - REACT

PUT /entregas/:id
Body: {
  reviewStatus: "Aprobado",
  comentarios: "Excelente trabajo"
}
// Solo puede actualizar entregas de su módulo
```

#### Validaciones del Backend

El backend valida que el profesor **no intente acceder** a módulos ajenos:

```javascript
// Profesor HTML-CSS intenta acceder a asignación del módulo JAVASCRIPT
GET /assignments/abc123

// Backend verifica:
if (assignment.cohorte !== profesor.moduleCode) {
  throw { status: 403, message: "No autorizado a ver esta asignación" };
}
```

---

### Alumno

#### Permisos
- ✅ Ver asignaciones de su módulo
- ✅ Reservar/cancelar slots de su módulo
- ✅ Crear/editar sus propias entregas
- ✅ Ver solo sus propias entregas
- ❌ **NO** puede ver recursos de otros módulos
- ❌ **NO** puede ver entregas de otros alumnos

#### Restricciones Aplicadas

**1. Asignaciones**

```javascript
// Alumno HTML-CSS (moduleCode: 1)
GET /assignments
// Filtro aplicado: { cohorte: 1 }
// Respuesta: Solo asignaciones del módulo HTML-CSS
```

**2. Slots (Turnos)**

```javascript
// Alumno JAVASCRIPT (moduleCode: 2)
GET /slots
// Filtro aplicado: { cohorte: 2 }
// Filtrado adicional: Solo slots con estado "Disponible" O propios

// Resultado: Ve solo:
// - Slots disponibles del módulo JAVASCRIPT
// - Slots que él mismo reservó (aunque estén en otro estado)
// NO ve: Slots reservados por otros alumnos
```

**3. Entregas**

```javascript
// Alumno BACKEND (moduleCode: 3)
GET /submissions/:userId
// Validación: userId debe ser el ID del alumno autenticado
// Filtro aplicado: { cohorte: 3, student: alumno._id }
// Respuesta: Solo sus propias entregas del módulo BACKEND

// Intento de ver entregas de otro alumno
GET /submissions/otroAlumnoId
// Error 403: "No autorizado a ver las entregas de otros alumnos"
```

**4. Reserva de Slots**

```javascript
// Alumno REACT (moduleCode: 4) reserva turno
PATCH /slots/:id/solicitar

// Backend valida:
// 1. El slot pertenece al módulo 4
// 2. El slot está disponible
// 3. El alumno no tiene otro turno reservado en el mismo sprint
// 4. El alumno está aprobado (status === "Aprobado")
```

---

## Implementación Frontend

### 1. Detección del Módulo del Usuario

Al hacer login o validar sesión:

```javascript
// Respuesta de /auth/login o /auth/session
{
  id: "abc123",
  nombre: "Laura Silva",
  email: "laura.silva.htmlcss@gmail.com",
  role: "profesor",
  moduleNumber: 1,
  moduleLabel: "HTML-CSS",
  estado: "Aprobado",
  isApproved: true
}
```

**Guardar en el estado global:**
```javascript
const currentUser = {
  id: response.id,
  role: response.role,
  moduleNumber: response.moduleNumber,
  moduleLabel: response.moduleLabel,
  // ... otros campos
};
```

### 2. Mostrar/Ocultar Elementos según Módulo

#### Ejemplo: Mostrar solo módulo del profesor

```jsx
// Componente de Profesor
function DashboardProfesor({ currentUser }) {
  return (
    <div>
      <h1>Módulo: {currentUser.moduleLabel}</h1>
      
      {/* Lista de alumnos - El backend ya filtra por módulo */}
      <AlumnosList moduleNumber={currentUser.moduleNumber} />
      
      {/* Asignaciones - El backend solo devuelve las del módulo */}
      <AssignmentsList />
      
      {/* NO mostrar selector de módulo - está fijo */}
    </div>
  );
}
```

#### Ejemplo: Superadmin con selector de módulo

```jsx
// Componente de Superadmin
function DashboardSuperadmin() {
  const [selectedModule, setSelectedModule] = useState(null);
  
  return (
    <div>
      {/* Superadmin SÍ puede cambiar de módulo */}
      <ModuleSelector 
        value={selectedModule}
        onChange={setSelectedModule}
      />
      
      {/* Pasar filtro opcional al backend */}
      <AlumnosList 
        moduleNumber={selectedModule}  // Puede ser null (todos)
      />
    </div>
  );
}
```

### 3. Manejo de Filtros en Consultas

#### Profesor

```javascript
// El backend YA filtra automáticamente, NO enviar filtro de módulo
async function fetchAlumnos() {
  const response = await fetch(`${API_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Backend retorna solo alumnos del módulo del profesor
  return response.json();
}
```

#### Superadmin

```javascript
// Superadmin PUEDE enviar filtro opcional
async function fetchAlumnos(moduleNumber = null) {
  let url = `${API_URL}/usuarios`;
  
  if (moduleNumber) {
    url += `?moduleNumber=${moduleNumber}`;
  }
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  return response.json();
}
```

### 4. Validación Frontend (Defensiva)

Aunque el backend valida, el frontend puede prevenir intentos inválidos:

```javascript
// Validar que el profesor no intente crear asignación para otro módulo
function CrearAsignacion({ currentUser }) {
  const handleSubmit = (data) => {
    // Validación defensiva
    if (currentUser.role === "profesor") {
      if (data.moduleNumber !== currentUser.moduleNumber) {
        alert("No puedes crear asignaciones para otros módulos");
        return;
      }
    }
    
    // Enviar al backend
    createAssignment(data);
  };
}
```

### 5. Mostrar Información de Módulo

```jsx
// Badge de módulo en la UI
function ModuleBadge({ moduleNumber, moduleLabel }) {
  const colors = {
    1: "bg-blue-500",    // HTML-CSS
    2: "bg-yellow-500",  // JAVASCRIPT
    3: "bg-green-500",   // BACKEND
    4: "bg-purple-500"   // REACT
  };
  
  return (
    <span className={`px-2 py-1 rounded ${colors[moduleNumber]}`}>
      {moduleLabel}
    </span>
  );
}
```

---

## Ejemplos de Flujos Completos

### Flujo 1: Profesor Lista Alumnos

#### 1. Login del Profesor

```javascript
POST /auth/login
Body: {
  email: "laura.silva.htmlcss@gmail.com",
  password: "Prof-HTML-CSS-2025"
}

Response: {
  token: "eyJhbGc...",
  user: {
    id: "prof123",
    nombre: "Laura Silva",
    email: "laura.silva.htmlcss@gmail.com",
    role: "profesor",
    moduleNumber: 1,
    moduleLabel: "HTML-CSS"
  }
}
```

#### 2. Frontend Almacena Info

```javascript
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

#### 3. Frontend Consulta Alumnos

```javascript
GET /usuarios
Headers: {
  Authorization: "Bearer eyJhbGc..."
}

// Backend procesa:
// 1. auth middleware extrae usuario del token
// 2. allowRoles valida que sea profesor o superadmin
// 3. buildUserListFilter genera: { cohorte: 1, role: "alumno" }
// 4. userRepository.obtenerTodos({ cohorte: 1, role: "alumno" })
```

#### 4. Backend Responde

```javascript
Response: [
  {
    id: "alumno1",
    nombre: "Mateo Alvarez",
    email: "mateo.alvarez.htmlcss.01@gmail.com",
    role: "alumno",
    moduleNumber: 1,
    moduleLabel: "HTML-CSS",
    estado: "Aprobado"
  },
  {
    id: "alumno2",
    nombre: "Camila Herrera",
    email: "camila.herrera.htmlcss.02@gmail.com",
    role: "alumno",
    moduleNumber: 1,
    moduleLabel: "HTML-CSS",
    estado: "Aprobado"
  }
  // ... solo alumnos del módulo HTML-CSS
]
```

#### 5. Frontend Renderiza

```jsx
function AlumnosList({ alumnos }) {
  return (
    <div>
      <h2>Alumnos del Módulo HTML-CSS</h2>
      {alumnos.map(alumno => (
        <AlumnoCard key={alumno.id} alumno={alumno} />
      ))}
    </div>
  );
}
```

---

### Flujo 2: Alumno Reserva Turno

#### 1. Alumno Autenticado

```javascript
// Usuario almacenado en localStorage
{
  id: "alumno789",
  nombre: "Diego Suarez",
  email: "diego.suarez.javascript.01@gmail.com",
  role: "alumno",
  moduleNumber: 2,
  moduleLabel: "JAVASCRIPT",
  estado: "Aprobado"
}
```

#### 2. Frontend Lista Turnos Disponibles

```javascript
GET /slots
Headers: {
  Authorization: "Bearer token..."
}

// Backend aplica:
// 1. Filtro por módulo: { cohorte: 2 }
// 2. Filtrado adicional para alumno:
//    - estado === "Disponible" O
//    - student === alumno789
```

#### 3. Backend Responde

```javascript
Response: [
  {
    id: "slot1",
    date: "2025-12-01",
    startTime: "10:00",
    endTime: "11:00",
    estado: "Disponible",  // Alumno puede ver porque está disponible
    cohorte: 2,
    modulo: "JAVASCRIPT"
  },
  {
    id: "slot2",
    date: "2025-12-02",
    startTime: "14:00",
    endTime: "15:00",
    estado: "Solicitado",  // Alumno ve porque él lo reservó
    student: "alumno789",
    cohorte: 2,
    modulo: "JAVASCRIPT"
  }
  // NO incluye slots reservados por otros alumnos
  // NO incluye slots de otros módulos
]
```

#### 4. Alumno Reserva Turno

```javascript
PATCH /slots/slot1/solicitar
Headers: {
  Authorization: "Bearer token..."
}

// Backend valida:
// 1. El slot existe y es del módulo 2
// 2. El slot está disponible
// 3. El alumno está aprobado
// 4. El alumno no tiene otro turno en ese sprint
```

#### 5. Backend Responde

```javascript
Response: {
  id: "slot1",
  date: "2025-12-01",
  startTime: "10:00",
  endTime: "11:00",
  estado: "Solicitado",     // Cambió de Disponible a Solicitado
  student: "alumno789",     // Asignado al alumno
  solicitanteNombre: "Diego Suarez",
  cohorte: 2,
  modulo: "JAVASCRIPT"
}
```

---

### Flujo 3: Superadmin Gestiona Múltiples Módulos

#### 1. Superadmin Lista Todos los Usuarios

```javascript
GET /usuarios
Headers: {
  Authorization: "Bearer superadmin_token..."
}

// Backend NO aplica filtro de módulo
// buildUserListFilter para superadmin retorna {}
```

#### 2. Respuesta Completa

```javascript
Response: [
  { nombre: "Alumno 1", moduleNumber: 1, modulo: "HTML-CSS" },
  { nombre: "Alumno 2", moduleNumber: 2, modulo: "JAVASCRIPT" },
  { nombre: "Alumno 3", moduleNumber: 3, modulo: "BACKEND - NODE JS" },
  { nombre: "Alumno 4", moduleNumber: 4, modulo: "FRONTEND - REACT" },
  // ... usuarios de TODOS los módulos
]
```

#### 3. Superadmin Filtra por Módulo Específico

```javascript
GET /usuarios?moduleNumber=3
Headers: {
  Authorization: "Bearer superadmin_token..."
}

// Backend aplica filtro opcional: { cohorte: 3 }
```

#### 4. Respuesta Filtrada

```javascript
Response: [
  { nombre: "Carla Mansilla", moduleNumber: 3, modulo: "BACKEND - NODE JS" },
  { nombre: "Ivan Robles", moduleNumber: 3, modulo: "BACKEND - NODE JS" },
  // ... solo usuarios del módulo BACKEND - NODE JS
]
```

---

## Validaciones y Errores Comunes

### Error 403: Módulo no coincide

```javascript
// Profesor HTML-CSS intenta acceder a asignación de JAVASCRIPT
GET /assignments/asignacion_javascript_id

Response 403: {
  message: "No autorizado a ver esta asignación"
}
```

**Causa:** El profesor intenta acceder a un recurso que no pertenece a su módulo.

**Solución Frontend:** No permitir navegación a recursos de otros módulos.

### Error 403: Acceso denegado

```javascript
// Alumno intenta listar usuarios
GET /usuarios

Response 403: {
  message: "Acceso denegado"
}
```

**Causa:** El rol del usuario no tiene permiso para ese endpoint.

**Solución Frontend:** Ocultar rutas/botones según el rol del usuario.

### Error 403: Cuenta no aprobada

```javascript
// Alumno con status "Pendiente" intenta reservar turno
PATCH /slots/slot1/solicitar

Response 403: {
  message: "Tu cuenta debe ser aprobada por un profesor o administrador"
}
```

**Causa:** El alumno no tiene `status === "Aprobado"`.

**Solución Frontend:** Mostrar mensaje de "cuenta pendiente de aprobación" y deshabilitar acciones.

---

## Resumen de Reglas de Negocio

### Por Rol

| Acción | Superadmin | Profesor | Alumno |
|--------|-----------|----------|--------|
| Ver todos los módulos | ✅ | ❌ | ❌ |
| Crear asignación | ✅ Cualquier módulo | ✅ Solo su módulo | ❌ |
| Ver alumnos | ✅ Todos | ✅ Solo de su módulo | ❌ |
| Crear slot | ✅ Cualquier módulo | ✅ Solo su módulo | ❌ |
| Reservar slot | ❌ | ❌ | ✅ Solo de su módulo |
| Ver entregas | ✅ Todas | ✅ Solo de su módulo | ✅ Solo propias |
| Aprobar usuarios | ✅ | ✅ Solo de su módulo | ❌ |

### Por Recurso

| Recurso | Campo de Segmentación | Filtro Aplicado |
|---------|----------------------|-----------------|
| User | `moduleCode`, `cohorte` | Profesor: `cohorte = suModulo` |
| Assignment | `cohorte` | Profesor: `cohorte = suModulo` |
| ReviewSlot | `cohorte` | Profesor/Alumno: `cohorte = suModulo` |
| Submission | `assignment.cohorte` (derivado) | Profesor: entregas de alumnos de su módulo |

---

## Checklist de Integración Frontend

### Durante Login/Sesión

- [ ] Guardar `moduleNumber` y `moduleLabel` del usuario
- [ ] Guardar `role` para controlar permisos de UI
- [ ] Validar que `status === "Aprobado"` para alumnos

### En la Interfaz de Usuario

- [ ] **Profesor:** Mostrar badge con su módulo (NO selector)
- [ ] **Superadmin:** Mostrar selector de módulo (opcional)
- [ ] **Alumno:** Mostrar su módulo de forma informativa

### En Listados de Datos

- [ ] **NO** enviar filtro de módulo si el usuario es profesor (backend lo hace automáticamente)
- [ ] **SÍ** enviar filtro opcional si el usuario es superadmin
- [ ] Confiar en que el backend filtra correctamente

### En Creación de Recursos

- [ ] **Profesor:** Validar que el módulo coincida con el suyo antes de enviar
- [ ] **Superadmin:** Permitir seleccionar cualquier módulo
- [ ] Mostrar el módulo del recurso de forma clara en formularios

### Manejo de Errores

- [ ] Detectar error 403 por módulo incorrecto
- [ ] Mostrar mensaje claro al usuario
- [ ] Redirigir a página apropiada o mostrar recursos permitidos

---

## Datos de Prueba

### Usuarios por Módulo

```javascript
// Módulo 1: HTML-CSS
Profesor: laura.silva.htmlcss@gmail.com (Prof-HTML-CSS-2025)
Alumnos: 66 alumnos con moduleCode = 1

// Módulo 2: JAVASCRIPT
Profesor: gabriel.martinez.javascript@gmail.com (Prof-JAVASCRIPT-2025)
Alumnos: 49 alumnos con moduleCode = 2

// Módulo 3: BACKEND - NODE JS
Profesor: paula.costa.node@gmail.com (Prof-BACKEND-NODE-JS-2025)
Alumnos: 21 alumnos con moduleCode = 3

// Módulo 4: FRONTEND - REACT
Profesor: sergio.ledesma.react@gmail.com (Prof-FRONTEND-REACT-2025)
Alumnos: 31 alumnos con moduleCode = 4
```

Ver archivo completo: `/logs/docs/SEED_USERS.md`

---

**Última actualización:** 23 de Noviembre, 2025  
**Sistema:** Post-refactorización con permisos centralizados