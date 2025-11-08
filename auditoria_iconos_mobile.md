# Prompt de Auditoría para Codex — Consistencia de Íconos (Foco en Mobile)
**No modifiques ningún archivo. Solo analiza y reporta.**

## Objetivo
Identificar por qué los íconos difieren entre **CreateTurnos** y **SolicitudesTurnos** en **mobile**, y producir un reporte de solo lectura. Esperamos que **CreateTurnos** y **SolicitudesTurnos (mobile)** usen el **mismo set de íconos y el mismo método de renderizado**.

---

## Alcance (archivos a inspeccionar)
Revisar estos archivos (solo lectura):
- `src/.../CreateTurnos.jsx`
- `src/.../SolicitudesTurnos.jsx`
- `src/.../CardTurnosCreados.jsx`
- `src/.../ProfesorActions.jsx` (menú de escritorio, solo como referencia)
- `src/.../DropdownActions.jsx` (renderer del menú, solo como referencia)
- `src/.../Button.jsx` (confirmar que no introduce íconos por su cuenta)
- Opcionalmente revisar el shell/entry de la app para el CSS de íconos:
  - `index.html`, `main.jsx`/`index.tsx`, estilos globales (por ej. `app.css`) buscando import de `bootstrap-icons.css`.

> Las rutas pueden variar; buscá por nombre de archivo si es necesario.

---

## Qué detectar (sin cambios, solo hallazgos)

### A) Mobile usa la misma card que CreateTurnos
1. En `CreateTurnos.jsx`, identificar qué componente de card se usa en mobile (esperado: `CardTurnosCreados`).
2. En `SolicitudesTurnos.jsx`, confirmar que el **render mobile** (dentro del bloque con `sm:hidden`) usa **el mismo componente** (`CardTurnosCreados`) y no `CardTurno` u otro.
3. Si en `SolicitudesTurnos.jsx` se usa un componente distinto en mobile, reportar el nombre del componente y las líneas donde se renderiza.

**Salida esperada:**
- Archivo + línea(s) en `CreateTurnos.jsx` mostrando la card.
- Archivo + línea(s) en `SolicitudesTurnos.jsx` mostrando la card usada en mobile.
- Veredicto: “Mismo componente” o “Componente diferente”.

---

### B) Método de renderizado de íconos en la card (mobile)
Inspeccionar `CardTurnosCreados.jsx`:
1. Para cada botón (Aprobar, Rechazar, Ver detalle, Copiar link), anotar **cómo se renderiza el ícono**:
   - `<i className="bi ...">` (Bootstrap Icons)
   - `<img src="/icons/...">` (imagen raster/SVG)
2. Señalar cualquier **mezcla** de `<i>` e `<img>` dentro del **mismo botón**.
3. Confirmar que **no hay doble render**: el botón no debe renderizar a la vez `<i>` e `<img>`.

**Salida esperada:**
- Una tabla: Botón → Método (`<i>` o `<img>`) → Líneas.
- Lista de botones que renderizan **ambos** o que podrían renderizar ambos de forma condicional.

---

### C) Disponibilidad de Bootstrap Icons
Comprobar si el **CSS de Bootstrap Icons** está incluido **globalmente**:
- Buscar un import como:
  - En HTML: `<link rel="stylesheet" href=".../bootstrap-icons.css">`
  - En JS/CSS: `import "bootstrap-icons/font/bootstrap-icons.css";` en archivos de entrada.
- Si no se encuentra en el proyecto, indicar “No detectado”.

**Salida esperada:**
- Ubicación(es) y línea(s) donde se incluye el CSS de Bootstrap Icons, o “No detectado”.

---

### D) Referencias solo de escritorio (contexto, no cambiar)
Inspeccionar `ProfesorActions.jsx` y `DropdownActions.jsx`:
1. Identificar si las opciones pasan **`leading` (React node con `<i>`)** o **`icon` (string de ruta)** a `DropdownActions`.
2. En `DropdownActions.jsx`, confirmar cómo se renderiza el ícono:
   - Si existe `leading` → renderizar **exclusivamente** `leading`.
   - Si no hay `leading` pero hay `icon` → renderizar `<img>`.
   - Si no hay ninguno → no renderizar ícono.
3. Señalar cualquier caso donde **se pasen ambos** `leading` e `icon` a la **misma** opción (posible doble ícono).

**Salida esperada:**
- Lista de opciones que usan `leading` vs `icon`.
- Confirmación de que `DropdownActions` renderiza íconos de manera **exclusiva** (sin superposición) con líneas de referencia.
- Lista de opciones del menú que pasen **ambos** `leading` e `icon`.

---

### E) Revisión del componente Button
En `Button.jsx`, verificar que **no inyecta íconos** por sí mismo (debe renderizar `children` tal cual).

**Salida esperada:**
- Líneas que confirman que `Button` simplemente renderiza `children` sin añadir íconos.

---

## Formato del reporte (lo que debe imprimir Codex)
Generar **un único reporte en Markdown** con estas secciones:

1. **Resumen (1–3 viñetas)** — si mobile usa el mismo componente y si los set/métodos de íconos coinciden.
2. **Hallazgos A–E** — según lo pedido arriba, con rutas y rangos de línea.
3. **Causas potenciales** — viñetas concisas (p. ej., falta el CSS de Bootstrap Icons, se usa otra card en mobile, doble render de ícono).
4. **Criterios de aceptación** — condiciones para considerar que hay paridad:
   - Mobile en `SolicitudesTurnos.jsx` usa `CardTurnosCreados`.
   - `CardTurnosCreados` renderiza íconos de forma consistente y con el mismo método que en `CreateTurnos.jsx` (preferir `<i class="bi …">` para botones; el icono de Zoom puede permanecer como `<img>`).
   - El CSS de Bootstrap Icons está presente globalmente.
   - Ningún botón/ítem del menú renderiza **a la vez** `leading` e `icon`.

**Importante:**  
- **No modifiques ningún archivo.**  
- **No propongas diffs.**  
- Entrega únicamente el **reporte de auditoría en Markdown**.
