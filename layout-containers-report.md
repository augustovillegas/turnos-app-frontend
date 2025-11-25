# Reporte de Configuración de Contenedores (Layout & Responsive)

Fecha: 2025-11-24
Rama: master
Contexto: Normalización de wrappers, eliminación de duplicados y alineación móvil.

---
## 1. Objetivo del Reporte
Unificar criterios de estructura y estilos de contenedores (wrappers) en páginas y componentes reutilizables para:
- Consistencia visual entre vistas (usuarios, turnos, entregas).
- Reducción de nesting innecesario.
- Base clara para futuras extensiones (theming, variantes compactas, layouts alternos).

---
## 2. Patrón Global Adoptado
Componente central: `LayoutWrapper` (`src/components/layout/LayoutWrapper.jsx`)

Clase base:
```
mx-auto w-full max-w-6xl p-4 sm:p-6 flex flex-col gap-6
```
Propósito de cada clase:
- `mx-auto`: Centrado horizontal del contenedor principal.
- `w-full`: Ocupa todo el ancho disponible posible del viewport.
- `max-w-6xl`: Limita el ancho para evitar líneas demasiado largas en desktop (>1152px aprox).
- `p-4 sm:p-6`: Padding homogéneo (mobile vs ≥640px).
- `flex flex-col gap-6`: Distribución vertical uniforme de secciones.

Uso: Las páginas orquestadoras (CreateUsers, CreateTurnos, TurnosDisponibles, MisTurnos, SolicitudesTurnos, UsuariosPendientes, EvaluarEntregas, Entregables) emplean este wrapper como raíz.

---
## 3. Páginas con LayoutWrapper
| Página | Ruta | Clase final adicional | Notas |
|--------|------|-----------------------|-------|
| CreateUsers.jsx | `src/pages/CreateUsers.jsx` | `text-[#111827] dark:text-gray-100 transition-colors duration-300` | Orquesta listar/crear/editar usuarios. |
| CreateTurnos.jsx | `src/pages/CreateTurnos.jsx` | `text-[#111827] dark:text-gray-100 transition-colors duration-300` | Admin de turnos (listar/crear/editar/detalle). |
| TurnosDisponibles.jsx | `src/pages/TurnosDisponibles.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg transition-colors duration-300` | Vista alumno para solicitar. |
| MisTurnos.jsx | `src/pages/MisTurnos.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg transition-colors duration-300` | Turnos propios del alumno. |
| SolicitudesTurnos.jsx | `src/pages/SolicitudesTurnos.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg` | Panel de solicitudes (aprobación / rechazo). |
| UsuariosPendientes.jsx | `src/pages/UsuariosPendientes.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg transition-colors duration-300` | Aprobación de usuarios nuevos. |
| EvaluarEntregas.jsx | `src/pages/EvaluarEntregas.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg transition-colors duration-300` | Revisión de entregas. |
| Entregables.jsx | `src/pages/Entregables.jsx` | `text-[#111827] dark:text-gray-100 rounded-lg transition-colors duration-300` | Listado y creación de entregas. |

Observación: El uso de `rounded-lg` está presente solo en vistas con panel visual estilizado (listados principales). Se podría estandarizar (decidir entre tenerlo siempre o hacerlo opcional vía prop).

---
## 4. Componentes Internos (List Views)
Antes: `UsuariosList.jsx` y `TurnosList.jsx` duplicaban wrapper con padding + max-width dentro de páginas ya envueltas.
Después: Reducción a raíz simple.

Estado actual (verificado 24-Nov-2025):
- `UsuariosList.jsx` root: `<div className="w-full flex flex-col gap-6">`
- `TurnosList.jsx` root: `<div className="w-full flex flex-col gap-6">`

Ventajas implementadas:
- ✅ No hay doble `p-4 sm:p-6`.
- ✅ No impone un ancho máximo adicional.
- ✅ Permite que el page wrapper (LayoutWrapper) gobierne spacing general.
- ✅ Cards móviles ocupan 100% del ancho disponible sin restricciones internas.

---
## 5. Patrones de Secciones Internas (Filtros, Títulos)
Estructura común en listados:
```
<h2 class="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">Título</h2>
<div class="flex flex-col gap-2"> // Filtros stacked en mobile
  <ReviewFilter ... />
  <SearchBar ... />
</div>
```
En layouts con mayor densidad (TurnosList) se usa composición lado a lado en `sm:` o `md:`.

Posible mejora: Crear `FiltersGroup` para homogeneizar markup y clases.

---
## 6. Tablas (Desktop) vs Tarjetas (Mobile)
Componente: `Table.jsx`

Modo clásico (no responsive):
- Envoltura: `div.w-full.overflow-x-auto`
- Ancho interno mínimo: `min-w-[680px]` (previene quiebres de columnas).

Modo responsive (`responsive` = true):
- Desktop: bloque dentro de `<div className="hidden md:block">`.
- Mobile: tarjetas renderizadas dentro de `<div className="mt-4 space-y-4 md:hidden">`.
- ✅ **Actualización 24-Nov-2025**: Se eliminó `px-2` para alinear borde con padding global del wrapper.

Estado actual en páginas:
- TurnosDisponibles: `<div className="mt-4 space-y-4 md:hidden">` ✅
- MisTurnos: `<div className="mt-4 space-y-4 md:hidden">` ✅
- UsuariosPendientes: `<div className="mt-4 space-y-4 md:hidden">` ✅
- SolicitudesTurnos: `<div className="mt-4 space-y-4 md:hidden">` ✅
- Entregables: `<div className="mt-4 space-y-4 md:hidden">` ✅
- UsuariosList (componente): `<div className="space-y-3 md:hidden">` ✅
- Table.jsx (componente): `<div className="mt-4 space-y-4 md:hidden">` ✅

Recomendado futuro:
- Parametrizar `minWidth` globalmente (const central).
- Hacer `containerClass` default unificado (evitar repeticiones de `px-4`).

---
## 7. Tarjetas (Cards) Móviles
Ejemplos: `CardTurno.jsx`, `CardTurnosCreados.jsx`, `CardUsuario.jsx`, `CardEntrega.jsx`.

Clases base común (ejemplo `CardTurno.jsx`):
```jsx
<div className="space-y-2 sm:space-y-3 rounded-md border-2 border-[#111827] bg-white p-3 sm:p-4 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
```

Implementación actual (verificado 24-Nov-2025):
- **CardTurno.jsx**: `p-3 sm:p-4 space-y-2 sm:space-y-3` ✅
- **CardUsuario.jsx**: `p-3 sm:p-4 space-y-2 sm:space-y-3` ✅

Notas de implementación:
- ✅ `p-3 sm:p-4` mantiene densidad adecuada en mobile.
- ✅ `space-y-2 sm:space-y-3` crea ritmo vertical consistente.
- ✅ **Tarjetas ocupan todo el ancho del contenedor padre** (LayoutWrapper proporciona el padding, cards no agregan margen lateral).
- ✅ Sin `px-2` en contenedores móviles externos (eliminado en normalización).

---
## 8. Modal y Botones
`Modal.jsx`: Ajustado a ancho flexible.
```
w-full max-w-md p-4 sm:p-6
```
`Button.jsx`: Responsive paddings.
```
px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base
```
Mantiene escala apropiada sin desbordes en pantallas pequeñas.

---
## 9. Eliminaciones Relevantes
Removidos:
- Wrappers internos duplicados (`p-4 sm:p-6` + `max-w-6xl`).
- Padding lateral extra en contenedores móviles de listas y tablas (`px-2`).
- Anchos rígidos (ej: `w-96`) en modales.

Persisten sólo donde tienen sentido:
- `overflow-x-auto` en tablas desktop para manejar casos extremos de columnas largas.

---
## 10. Problemas Originales vs Estado Actual
| Problema Original | Causa | Resolución Actual | Resultado |
|-------------------|-------|-------------------|-----------|
| Doble wrapper con distintos paddings | Mezcla histórica de estilos | Introducción de `LayoutWrapper` + limpieza en lists | Layout homogéneo |
| Desalineación móvil (cards más angostas) | Padding extra (`px-2`) en contenedores | Retiro de padding externo | Cards full-width real |
| Inconsistencia de breakpoints tabla/cards | Uso de `sm` en algunas vistas | Uniformado a `md` | Experiencia estable en tablets pequeñas |
| Modal fijo `w-96` | Ancho rígido heredado | Reemplazo por `w-full max-w-md` | Mejor escalado responsive |
| Buttons densos en mobile | Falta de ajuste tipográfico | Paddings/tamaños responsive | Legibilidad y accesibilidad |

---
## 11. Riesgos / Debilidades Actuales
- Duplicación residual de clases de texto y transición en cada página (`text-[#111827] dark:text-gray-100 transition-colors duration-300`).
- Uso de colores directos en vez de variables Tailwind configuradas (podría centralizarse en `tailwind.config.js`).
- `rounded-lg` inconsistente (no todas las páginas la requieren, pero se usa en varias). Decidir semántica: ¿panel vs full-view?
- `min-w-[680px]` repetido manualmente; sería mejor exponer una constante `TABLE_MIN_WIDTH`.

---
## 12. Recomendaciones de Mejora (Roadmap)
1. Abstracción LayoutWrapper avanzada:
   - Props: `gap="md|lg"`, `padding="base|compact"`, `centered` (boolean), `rounded`.
2. Grupo de filtros reutilizable (`FiltersGroup.jsx`):
   - Encapsular `ReviewFilter + SearchBar` + layout responsivo.
3. Centralización de constantes:
   - `TABLE_MIN_WIDTH`, `CARD_BASE_CLASSES`, `WRAPPER_BASE_CLASSES`.
4. Variables de color Tailwind:
   - Migrar `#1E3A8A`, `#93C5FD`, `#111827` a nombres en `tailwind.config.js` (`primary`, `primary-dark`, `text-base`).
5. Auditoría final de accesibilidad:
   - Verificar jerarquía de `h1/h2` y `aria-label` en íconos interactivos.
6. Testing visual (opcional):
   - Capturas por breakpoint (320, 375, 414, 640, 768, 1024) usando Playwright / Puppeteer.

---
## 13. Ejemplo de Unificación Futura (Propuesta de Código)
```jsx
// LayoutWrapper (propuesta extendida)
export const LayoutWrapper = ({
  children,
  as: Tag = 'div',
  padding = 'base', // base|compact|none
  gap = 'lg', // sm|md|lg
  rounded = true,
  className = '',
}) => {
  const paddingClasses = {
    none: 'p-0',
    compact: 'p-3 sm:p-4',
    base: 'p-4 sm:p-6'
  }[padding];
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  }[gap];
  return (
    <Tag className={`mx-auto w-full max-w-6xl flex flex-col ${paddingClasses} ${gapClasses} ${rounded ? 'rounded-lg' : ''} ${className}`}>
      {children}
    </Tag>
  );
};
```

---
## 14. Checklist de Conformidad Actual
- [x] Un único wrapper por página principal.
- [x] Lists internas sin duplicar paddings/anchos.
- [x] Cards móviles full-width sin padding exterior agregado.
- [x] Breakpoint único para vista tabla: `md`.
- [x] Modal flexible sin ancho rígido.
- [x] Botones con padding responsive.
- [x] Eliminados anchos fijos innecesarios.
- [x] LayoutWrapper implementado y usado en 8 páginas principales.
- [x] UsuariosList y TurnosList con root simplificado (w-full flex flex-col gap-6).
- [x] Contenedores móviles sin px-2 (mt-4 space-y-4 md:hidden).
- [x] Sin errores de compilación detectados.
- [x] Alineación visual verificada en componentes de cards.

---
## 15. Próximos Pasos Sugeridos
Orden recomendado de implementación futura:
1. Extraer constantes (`TABLE_MIN_WIDTH`, `WRAPPER_BASE_CLASSES`).
2. Extender `LayoutWrapper` con variantes.
3. Crear `FiltersGroup` reutilizable.
4. Migrar colores directos a Tailwind theme.
5. Añadir pruebas E2E visuales por breakpoint.
6. Documentar en README principal la guía de layout.

---
## 16. Conclusión
La estructura de contenedores está ahora coherente, con un único punto de control del layout por página. Todos los componentes han sido verificados y están correctamente alineados:

**Estado Final Confirmado (24-Nov-2025)**:
- ✅ 8 páginas principales usando `LayoutWrapper` (CreateUsers, CreateTurnos, TurnosDisponibles, MisTurnos, SolicitudesTurnos, UsuariosPendientes, EvaluarEntregas, Entregables).
- ✅ Componentes internos (UsuariosList, TurnosList) sin wrappers duplicados.
- ✅ Contenedores móviles sin padding lateral extra (eliminado `px-2`).
- ✅ Cards móviles (CardTurno, CardUsuario) ocupando 100% del ancho del LayoutWrapper.
- ✅ Breakpoint unificado `md` (768px) para switch tabla/cards.
- ✅ Sin errores de compilación.

Esto reduce complejidad, facilita mantenimiento y habilita evolución (theming, variantes de densidad) sin refactors costosos. Las recomendaciones listadas apuntan a consolidar aún más la escalabilidad y la consistencia semántica.

---
## 17. Referencias Rápidas
- Wrapper global: `LayoutWrapper`.
- Listas internas: raíz `w-full flex flex-col gap-6`.
- Tabla desktop: `overflow-x-auto` + `min-w-[680px]`.
- Mobile cards: `mt-4 space-y-4 md:hidden` (sin `px-2`).
- Card base (ejemplo): `p-3 sm:p-4 space-y-2 sm:space-y-3`.
- Modal: `w-full max-w-md p-4 sm:p-6`.
- Botón: `px-3 sm:px-4 py-1.5 sm:py-2`.

---
Fin del reporte.
