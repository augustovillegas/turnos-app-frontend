# Prueba Real: Creación y Listado de Usuario QA

**Fecha:** 22 de Noviembre, 2025

## Objetivo
Verificar que el backend local permite crear un usuario “Alumno QA” y que este aparece correctamente en el listado de usuarios tanto para un profesor como para un superadmin, usando credenciales reales del seed (`SEED_USERS.md`).

## Pasos Realizados

1. **Login como profesor** (`profesor.general@gmail.com`)
2. **Login como superadmin** (`admin.seed@gmail.com`)
3. **Creación de usuario QA**
   - Nombre: `Alumno QA Test`
   - Email: `alumno.qa.<timestamp>@test.com`
   - Password: `Test1234!`
   - Módulo: `FRONTEND - REACT`
   - Estado: `Aprobado`
4. **Listado de usuarios**
   - Consultado como profesor
   - Consultado como superadmin

## Resultados

- **Usuario creado:**
  ```json
  {
    "nombre": "Alumno QA Test",
    "email": "alumno.qa.<timestamp>@test.com",
    "role": "alumno",
    "estado": "Aprobado",
    "moduleLabel": "FRONTEND - REACT"
  }
  ```
- **¿Profesor ve al alumno QA?:** `true`
- **¿Superadmin ve al alumno QA?:** `true`

## Conclusión

✅ El usuario QA aparece correctamente en el listado para ambos roles. El backend responde como se espera y no hay problemas de visibilidad ni permisos en la configuración actual.

---

_Esta prueba se realizó ejecutando el script `scripts/prueba_creacion_y_listado_usuario.mjs` con credenciales del seed._
