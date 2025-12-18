# 📚 Gestión de Turnos - Portal Académico

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.0+-blue)

**Plataforma moderna para la gestión académica de turnos, entregas y usuarios** con interfaz retro-estilizada, soporte multi-rol y flujos colaborativos.

🔗 **Deploy en vivo:** [https://gestion-turnos-app.netlify.app/](https://gestion-turnos-app.netlify.app/)

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Guía de Uso](#-guía-de-uso)
- [Credenciales de Testing](#-credenciales-de-testing)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🎯 Descripción General

**Gestión de Turnos** es una aplicación web fullstack que reemplaza procesos académicos tradicionales basados en planillas Excel por una plataforma digital centralizada. Permite a estudiantes solicitar turnos, a profesores aprobar/rechazar solicitudes y a administradores gestionar el sistema global.

### Características Clave

- ✅ **Gestión de Turnos**: Creación, edición, aprobación y rechazo
- ✅ **Sistema de Entregas**: Tracking de entregables con estado y comentarios
- ✅ **Gestión de Usuarios**: Validación, aprobación y asignación de roles
- ✅ **Multi-rol**: Soporte para estudiante, profesor y superadmin
- ✅ **Autenticación JWT**: Seguridad basada en tokens
- ✅ **Tema Oscuro**: Interfaz adaptativa con Tailwind CSS
- ✅ **Responsivo**: Diseño mobile-first
- ✅ **Integración Zoom**: Enlace directo a reuniones

---

## 🚀 Características

### Para Estudiantes
- 📅 Solicitar turnos disponibles
- 📋 Ver historial de turnos aprobados
- 📤 Cargar entregas (GitHub + Render)
- ⚙️ Configuración de perfil

### Para Profesores
- ✔️ Aprobar/rechazar solicitudes de turnos
- 👥 Gestionar usuarios pendientes
- 📊 Evaluar entregas
- 🎯 Crear y administrar turnos del módulo

### Para Superadmin
- 🔑 Acceso global a todos los recursos
- 👨‍💼 Gestionar profesores y usuarios
- 📈 Dashboard unificado
- 📁 Importar usuarios en batch

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React + Vite)                     │
├─────────────────────────────────────────────────────┤
│  • React Router v7 (routing)                        │
│  • Context API (global state)                       │
│  • React Hook Form (formularios)                    │
│  • Axios (HTTP client)                              │
│  • Framer Motion (animaciones)                      │
│  • Tailwind CSS (estilos)                           │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   API Gateway       │
        │  (Bearer Tokens)    │
        └──────────┬──────────┘
                   │
┌─────────────────▼──────────────────────────────────┐
│         Backend (Node.js/Express)                  │
├─────────────────────────────────────────────────────┤
│  • REST API (/slots, /submissions|entregas, /usuarios)       │
│  • JWT Authentication                              │
│  • Validación de permisos                          │
│  • MongoDB (persistencia)                          │
└─────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa             | Tecnología                       | Versión |
|------------------|----------------------------------|---------|
| **Frontend**     | React                            | 19.0+   |
| **Build**        | Vite                             | 5.0+    |
| **Styling**      | Tailwind CSS                     | 3.4+    |
| **Formularios**  | React Hook Form                  | 7.48+   |
| **HTTP**         | Axios                            | 1.6+    |
| **Routing**      | React Router                     | 7.0+    |
| **State**        | Context API                      | Nativa  |
| **Testing**      | Vitest + React Testing Library   | 1.0+    |

---

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- **Node.js**: v16.0.0 o superior ([descargar](https://nodejs.org/))
- **npm** o **yarn**: gestor de dependencias
- **Backend API**: URL accesible (ver Configuración)
- **Git**: para clonar el repositorio

Verifica las versiones:
```bash
node --version    # v16.0.0+
npm --version     # 8.0.0+
```

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/turnos-app.git
cd turnos-app
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores (ver sección [Configuración](#-configuración))

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación abrirá en `http://localhost:5173`

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=20000

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_SOUND=true

# E2E Testing (Opcional)
TEST_E2E_API_BASE_URL=http://localhost:3000
TEST_E2E_SUPERADMIN_EMAIL=superadmin.diplomatura@gmail.com
TEST_E2E_SUPERADMIN_PASSWORD=Superadmin#2025
TEST_E2E_PROFESOR_EMAIL=laura.silva.htmlcss@gmail.com
TEST_E2E_PROFESOR_PASSWORD=Prof-HTML-CSS-2025
TEST_E2E_ALUMNO_EMAIL=abril.figueroa.htmlcss.14@gmail.com
TEST_E2E_ALUMNO_PASSWORD=Alumno-HTML-CSS-14
```

### Descripción de Variables

| Variable                | Descripción                    | Ejemplo                   |
|-------------------------|--------------------------------|---------------------------|
| `VITE_API_BASE_URL`     | URL base del backend           | `https://api.example.com` |
| `VITE_API_TIMEOUT`      | Timeout en milisegundos        | `20000`                   |
| `VITE_ENABLE_DARK_MODE` | Activar tema oscuro            | `true`                    |
| `VITE_ENABLE_SOUND`     | Activar sonidos                | `true`                    |
| `TEST_E2E_*`            | Credenciales de testing        | Ver arriba                |

### Configuración por Entorno

**Desarrollo**:
```bash
npm run dev
# Usa .env.local (no versionado)
```

**Testing E2E**:
```bash
npm run test:e2e
# Usa .env.e2e.local (no versionado)
```

**Producción**:
```bash
npm run build
# Usa variables de Netlify/CI-CD
```

---

## 📂 Estructura del Proyecto

```
turnos-app/
├── src/
│   ├── App.jsx                    # Shell principal
│   ├── main.jsx                   # Punto de entrada
│   ├── index.css                  # Estilos globales
│   │
│   ├── components/                # Componentes reutilizables
│   │   ├── ui/                    # Componentes básicos
│   │   │   ├── Button.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Status.jsx
│   │   │   └── ...
│   │   ├── sections/              # Secciones de landing
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   └── Modules.jsx
│   │   ├── turnos/                # Componentes de turnos
│   │   │   ├── TurnosList.jsx
│   │   │   ├── TurnoForm.jsx
│   │   │   ├── TurnoEdit.jsx
│   │   │   └── TurnoDetail.jsx
│   │   ├── entregas/              # Componentes de entregas
│   │   └── layout/                # Layout components
│   │       ├── SideBar.jsx
│   │       └── LayoutWrapper.jsx
│   │
│   ├── context/                   # Global state (Context API)
│   │   ├── AppContext.jsx         # Estado de turnos/usuarios
│   │   ├── AuthContext.jsx        # Autenticación
│   │   ├── LoadingContext.jsx     # Estados de carga
│   │   ├── ErrorContext.jsx       # Manejo de errores
│   │   ├── ModalContext.jsx       # Modales
│   │   ├── ThemeContext.jsx       # Temas
│   │   └── SoundContext.jsx       # Control de sonidos
│   │
│   ├── pages/                     # Páginas principales
│   │   ├── DashboardAlumno.jsx
│   │   ├── DashboardProfesor.jsx
│   │   ├── DashboardSuperadmin.jsx
│   │   ├── TurnosDisponibles.jsx
│   │   ├── MisTurnos.jsx
│   │   ├── SolicitudesTurnos.jsx
│   │   ├── CreateTurnos.jsx
│   │   ├── Entregables.jsx
│   │   ├── EvaluarEntregas.jsx
│   │   ├── Configuracion.jsx
│   │   ├── Contacto.jsx
│   │   └── ...
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAlumnoTurnos.js
│   │   ├── useApproval.js
│   │   ├── usePagination.js
│   │   ├── useEntregaReview.js
│   │   └── useTurnosData.js
│   │
│   ├── services/                  # HTTP clients
│   │   ├── apiClient.js           # Configuración Axios
│   │   ├── turnosService.js       # CRUD de turnos
│   │   ├── slotsService.js        # Deprecado (alias)
│   │   ├── usuariosService.js     # CRUD de usuarios
│   │   ├── entregasService.js     # CRUD de entregas
│   │   └── authService.js         # Autenticación
│   │
│   ├── utils/                     # Funciones utilitarias
│   │   ├── turnos/
│   │   │   ├── form.js            # Validaciones y builders
│   │   │   ├── normalizeTurno.js  # Normalización
│   │   │   └── normalizeEstado.js # Estados
│   │   ├── feedback/
│   │   │   ├── toasts.js          # Sistema de notificaciones
│   │   │   └── errorExtractor.js  # Parsing de errores API
│   │   ├── moduleMap.js           # Mapeos de módulos
│   │   ├── pagination.js          # Paginación
│   │   ├── formatDateForTable.js  # Formateo de fechas
│   │   └── ...
│   │
│   └── router/                    # React Router setup
│       ├── createAppRouter.jsx
│       ├── session.js             # Guards de autenticación
│       └── routes/                # Lazy loaded routes
│           ├── root.jsx
│           ├── landing.jsx
│           ├── login.jsx
│           ├── dashboardAlumno.jsx
│           └── ...
│
├── test/                          # Testing
│   ├── e2e/                       # End-to-end tests
│   │   ├── dashboardFlows.e2e.test.jsx
│   │   ├── appNavigation.e2e.test.jsx
│   │   └── evaluarEntregas.e2e.test.jsx
│   ├── integration/               # Integration tests
│   │   ├── turnosService.integration.test.js
│   │   ├── turnoEdit.integration.test.js
│   │   └── usuariosService.integration.test.js
│   └── utils/                     # Test helpers
│       ├── renderWithProviders.jsx
│       ├── testApi.js
│       ├── realBackendSession.js
│       └── e2eEnv.js
│
├── public/                        # Activos estáticos
│   ├── icons/                     # Íconos SVG
│   ├── img/                       # Imágenes
│   └── sounds/                    # Efectos de sonido
│
├── scripts/                       # Scripts de desarrollo/testing
│   ├── apiHealthTest.mjs
│   ├── probeTurnosPayload.mjs
│   ├── crearUsuariosRoles.mjs
│   ├── renderHtmlReport.mjs
│   └── testProblematicCase.mjs
│
├── .env.example                   # Template de variables
├── .env.e2e.local                 # Variables de E2E (local)
├── .gitignore
├── eslint.config.js
├── vite.config.js
├── tailwind.config.js
├── vitest.config.js
├── package.json
└── README.md
```

---

## 🔧 Scripts Disponibles

### Desarrollo

```bash
# Inicia servidor de desarrollo
npm run dev
# ▶️  http://localhost:5173

# Build para producción
npm run build

# Preview del build localmente
npm run preview
```

### Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests E2E (requiere backend corriendo)
npm run test:e2e

# Tests de integración
npm run test:integration

# Ver cobertura de tests
npm run test:coverage

# Watch mode (re-ejecuta en cambios)
npm run test:watch
```

### Linting

```bash
# Verificar código
npm run lint

# Arreglar issues de linting automáticamente
npm run lint:fix
```

### Scripts Utilitarios

> **⚠️ Nota**: Los siguientes scripts son herramientas de desarrollo y debugging. No están incluidos en el build de producción.

```bash
# Health check del API
npm run scripts:api-health
# Valida conectividad con el backend y contrato de errores

# Probar payloads de turnos
npm run scripts:probe-turnos
# Debug de estructura de datos y validaciones

# Crear usuarios y roles de prueba
npm run scripts:crear-usuarios
# Seed de datos para entorno de desarrollo

# Generar reporte HTML de tests
npm run scripts:render-report
# Convierte resultados JSON a reporte visual

# Test de caso específico
npm run scripts:test-case
# Reproduce escenario problemático documentado

# Test de edición de turno
npm run scripts:test-edit
# Valida flujo de actualización completo
```

**Ubicación**: Todos los scripts de desarrollo están en [`scripts/`](scripts/) y pueden ejecutarse directamente:

```bash
node scripts/apiHealthTest.mjs
node scripts/probeTurnosPayload.mjs
node scripts/testProblematicCase.mjs
```

---

## 👥 Guía de Uso

### 1. Autenticación

Accede a `/login` con tus credenciales:

**Diferentes perfiles disponibles:**
- `superadmin`: Acceso total al sistema
- `profesor`: Aprobación de turnos del módulo asignado
- `alumno`: Acceso limitado a solicitar turnos y cargar entregas

### 2. Dashboard del Alumno

**Ruta:** `/dashboard/alumno`

**Funcionalidades:**
- 📋 **Turnos Disponibles**: Filtra por review y solicita turnos
- 🗓️ **Mis Turnos**: Historial de turnos aprobados
- 📦 **Entregables**: Carga y seguimiento de entregas

```jsx
// Ejemplo: Solicitar un turno
const { solicitarTurno } = useAppData();
await solicitarTurno(turnoId);
```

### 3. Dashboard del Profesor

**Ruta:** `/dashboard/profesor`

**Funcionalidades:**
- ✅ **Solicitudes de Turnos**: Aprobar/rechazar solicitudes
- 👥 **Usuarios Pendientes**: Validar nuevos registros
- 📊 **Evaluar Entregables**: Revisar y comentar entregas
- ➕ **Crear Turnos**: Agregar nuevos slots

### 4. Dashboard del Superadmin

**Ruta:** `/dashboard/superadmin`

**Funcionalidades:**
- 🌐 Acceso a todas las secciones
- 📊 Vista unificada de usuarios, turnos y entregas
- ⚡ Gestión rápida de aprobaciones

### 5. Configuración de Perfil

**Ruta:** `/configuracion`

**Opciones:**
- 👤 Ver información de perfil
- 🎨 Cambiar tema (claro/oscuro)
- 🔊 Activar/desactivar sonidos
- 🔐 Cambiar contraseña

### 6. Contacto

**Ruta:** `/contacto`

Formulario para reportar issues o sugerencias

---

## 🔑 Credenciales de Testing

### Superadmin
Acceso total al sistema, gestión global de recursos.

```
📧 Email:    superadmin.diplomatura@gmail.com
🔐 Password: Superadmin#2025
```

**Permisos:**
- Crear/editar/eliminar turnos
- Gestionar todos los usuarios
- Ver reportes globales
- Configuración del sistema

### Profesor
Gestión de turnos y evaluación de entregas del módulo asignado.

```
📧 Email:    laura.silva.htmlcss@gmail.com
🔐 Password: Prof-HTML-CSS-2025
```

**Permisos:**
- Crear turnos del módulo HTML-CSS
- Aprobar/rechazar solicitudes de estudiantes
- Evaluar entregas
- Ver estudiantes pendientes de aprobación

**Módulo asignado:** HTML-CSS

### Alumno
Solicitar turnos y cargar entregas.

```
📧 Email:    abril.figueroa.htmlcss.14@gmail.com
🔐 Password: Alumno-HTML-CSS-14
```

**Permisos:**
- Ver turnos disponibles
- Solicitar turnos
- Cargar entregas
- Ver estado de solicitudes

**Módulo:** HTML-CSS | **Cohorte:** 14

---

## 📡 API Documentation

### Autenticación

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}

# Respuesta
{
  "token": "eyJhbGc...",
  "usuario": {
    "id": "123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "role": "alumno"
  }
}
```

### Turnos

```bash
# Listar turnos
GET /slots
Authorization: Bearer <token>

# Obtener turno por ID
GET /slots/:id
Authorization: Bearer <token>

# Crear turno (profesor/superadmin)
POST /slots
Authorization: Bearer <token>
Content-Type: application/json

{
  "review": 1,
  "fecha": "2025-12-20",
  "horario": "14:00 - 15:00",
  "sala": "101",
  "zoomLink": "https://zoom.us/j/...",
  "comentarios": "Turno de repaso",
  "estado": "Disponible"
}

# Actualizar turno
PUT /slots/:id
Authorization: Bearer <token>

{
  "comentarios": "Actualizado",
  "estado": "Disponible"
}

# Cambiar estado (profesor/superadmin)
PATCH /slots/:id/estado
Authorization: Bearer <token>

{
  "estado": "aprobado"  // valores permitidos: aprobado | pendiente | cancelado
}

# Solicitar turno (alumno)
PATCH /slots/:id/solicitar
Authorization: Bearer <token>

# Cancelar solicitud (alumno)
PATCH /slots/:id/cancelar
Authorization: Bearer <token>

# Eliminar turno
DELETE /slots/:id
Authorization: Bearer <token>
```

### Entregas

```bash
# Listar entregas
GET /entregas
Authorization: Bearer <token>

# Crear entrega
POST /entregas
Authorization: Bearer <token>

{
  "sprint": 1,
  "githubLink": "https://github.com/...",
  "renderLink": "https://render.com/...",
  "comentarios": "Código limpio"
}

# Actualizar estado (profesor)
PATCH /entregas/:id/estado
Authorization: Bearer <token>

{
  "estado": "Aprobada"  // o "Rechazada"
}
```

### Usuarios

```bash
# Listar usuarios
GET /usuarios
Authorization: Bearer <token>

# Crear usuario (batch)
POST /usuarios/batch
Authorization: Bearer <token>

[
  {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "alumno",
    "cohort": 1,
    "modulo": "HTML-CSS"
  }
]

# Aprobar usuario (profesor/superadmin)
PATCH /usuarios/:id/aprobar
Authorization: Bearer <token>

# Rechazar usuario
PATCH /usuarios/:id/rechazar
Authorization: Bearer <token>
```

### Códigos de Estado

| Código | Significado       |
|--------|-------------------|
| `200`  | OK                |
| `201`  | Created           |
| `400`  | Bad Request       |
| `401`  | Unauthorized      |
| `403`  | Forbidden         |
| `404`  | Not Found         |
| `409`  | Conflict          |
| `500`  | Server Error      |

---

## 🧪 Testing

### Estructura de Tests

```
test/
├── e2e/              # Tests end-to-end (interfaz completa)
├── integration/      # Tests de integración (servicios HTTP)
└── utils/            # Helpers y fixtures
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Solo E2E
npm run test:e2e

# Solo integración
npm run test:integration

# Watch mode
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Ejemplo: Test E2E

```javascript
// test/e2e/dashboardFlows.e2e.test.jsx
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "../utils/renderWithProviders";

it("renderiza dashboard de alumno", async () => {
  // Renderiza app con usuario autenticado
  await renderApp({ route: "/dashboard/alumno", user: "alumno" });

  // Verifica que se mostró el heading
  expect(
    await screen.findByRole("heading", { name: /mis turnos/i })
  ).toBeInTheDocument();
});
```

### Credenciales para Testing

Las credenciales de testing están documentadas arriba (ver [Credenciales de Testing](#-credenciales-de-testing)).

Para usar en tests E2E, configura tu `.env.e2e.local`:

```env
TEST_E2E_SUPERADMIN_EMAIL=superadmin.diplomatura@gmail.com
TEST_E2E_SUPERADMIN_PASSWORD=Superadmin#2025
TEST_E2E_PROFESOR_EMAIL=laura.silva.htmlcss@gmail.com
TEST_E2E_PROFESOR_PASSWORD=Prof-HTML-CSS-2025
TEST_E2E_ALUMNO_EMAIL=abril.figueroa.htmlcss.14@gmail.com
TEST_E2E_ALUMNO_PASSWORD=Alumno-HTML-CSS-14
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. "Cannot find module" en imports

**Causa:** Rutas relativas incorrectas

**Solución:**
```javascript
// ❌ Malo
import Button from "./components/ui/Button";

// ✅ Bueno (desde src/)
import { Button } from "../components/ui/Button";
```

#### 2. "401 Unauthorized" en API calls

**Causa:** Token expirado o no enviado

**Solución:**
```bash
# Verifica que el token está en localStorage
window.localStorage.getItem("token")

# Re-login con credenciales válidas
```

#### 3. Tests fallan con "Cannot read property of undefined"

**Causa:** Falta normalización de datos del API

**Solución:**
```javascript
import { normalizeTurno } from "../src/utils/turnos/normalizeTurno";
const turnoNormalizado = normalizeTurno(turnoDelAPI);
```

#### 4. "CORS" errors en desarrollo

**Causa:** Backend no configurado para CORS

**Solución:**
```bash
# Verifica que el backend tiene:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

#### 5. Vite rebuild muy lento

**Causa:** Node modules sin limpiar

**Solución:**
```bash
# Limpiar cache
rm -rf node_modules
npm install

# O usar npm ci para instalación determinística
npm ci
```

### Logs y Debugging

```javascript
// Habilitar logs en desarrollo
if (import.meta.env.DEV) {
  console.log("Estado actual:", state);
  console.log("Token:", localStorage.getItem("token"));
}

// DevTools de React
// Instala React DevTools extension en Chrome/Firefox
```

### Contactar Soporte

Para issues no resueltos:
- 📧 Email: contacto@example.com
- 🐛 Issues: Reportar en la aplicación
- 💬 Contacto: Formulario en `/contacto`

---

## 🤝 Contribución

### Guía de Contribución

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-feature`)
3. **Commit** tus cambios (`git commit -am 'Agrega nueva feature'`)
4. **Push** a la rama (`git push origin feature/nueva-feature`)
5. **Abre un Pull Request**

### Estándares de Código

```javascript
// ✅ Buenas prácticas

// 1. Usar functional components con hooks
export const MiComponente = () => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Efecto
  }, []);
  
  return <div>Contenido</div>;
};

// 2. Documentar con JSDoc
/**
 * Crea un turno desde un formulario
 * @param {Object} formValues - Valores del formulario
 * @param {boolean} isCreating - Flag de creación vs edición
 * @returns {Object} Payload para API
 */
export const buildTurnoPayloadFromForm = (formValues, isCreating) => {
  // ...
};

// 3. Manejar errores correctamente
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error("Error:", error);
  showToast("Algo salió mal", "error");
  throw error;
}

// 4. Usar TypeScript para types críticos
// En futuro migration
```

### Commits

Usar formato convencional:

```bash
git commit -m "feat: agregar validación de turnos"
git commit -m "fix: corregir paginación en tabla"
git commit -m "docs: actualizar README"
git commit -m "test: agregar tests para TurnoForm"
git commit -m "style: formatear código con Prettier"
```

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

```
MIT License

Copyright (c) 2025 Gestión de Turnos - Augusto Villegas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

Ver LICENSE para detalles completos.

---

## 📞 Contacto y Recursos

| Recurso                     | Link                                                                                                |
|-----------------------------|-----------------------------------------------------------------------------------------------------|
| **Live App**                | [https://gestion-turnos-app.netlify.app/](https://gestion-turnos-app.netlify.app/)               |
| **LinkedIn**                | [https://www.linkedin.com/in/augustovillegas/](https://www.linkedin.com/in/augustovillegas/)     |
| **Formulario de Contacto**  | `/contacto`                                                                                         |
| **Reportar Issues**         | Contactar vía formulario                                                                            |

---

## 🙏 Agradecimientos

Desarrollado con ❤️ para la comunidad académica.

**Stack Moderno:**
- React + Vite para desarrollo rápido
- Tailwind CSS para styling profesional
- Vitest para testing confiable
- Context API para state management

---

**Última actualización:** Diciembre 2025 | **Versión:** 1.0.0

**Desarrollado por:** Augusto Villegas | [LinkedIn](https://www.linkedin.com/in/augustovillegas/)
