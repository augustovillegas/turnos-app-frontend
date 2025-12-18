## Objetivo
Que `SearchBar` NO imponga layout (centrado, márgenes, max-width) desde adentro,
y que se adapte al contenedor donde la pongas (grid, flex, header, sidebar, etc.).

---

## Problema actual (por qué se siente “forzada”)
Dentro de `SearchBar` hay clases que suelen “mandar” más que el contenedor:
- `flex justify-center`  → la centra siempre
- `mb-4`                 → agrega espacio aunque el layout no lo quiera
- `max-w-md`             → limita el ancho aunque el contenedor sea más grande

Eso rompe integraciones típicas como: grillas (`grid-cols-*`), toolbars (`flex`), columnas, etc.

---

## Regla de oro
✅ `SearchBar` debe:
- Renderizar `w-full` para ocupar el ancho disponible
- NO setear márgenes externos ni centrado por defecto
- NO limitarse con `max-w-*` salvo que el padre lo pida
- Exponer props para que el padre decida (layout-agnostic)

---

## Configuración recomendada en SearchBar (props de layout)
Agregá (o usá) props como:

- `centered` (default `false`)
- `withBottomSpacing` (default `false`)
- `maxWidthClassName` (default `""` o `"max-w-none"`)
- `className` (wrapper externo)
- `containerClassName` (contenedor interno)
- `inputClassName` (solo input)

### Defaults correctos (para que se adapte)
- `centered = false`
- `withBottomSpacing = false`
- `maxWidthClassName = ""` (o `max-w-none`)

---

## Cómo usar SearchBar para que se adapte al contenedor (casos comunes)

### 1) Dentro de un grid (ej. PanelFiltro)
<SearchBar
  data={data}
  fields={searchFields}
  onSearch={handleSearch}
  centered={false}
  withBottomSpacing={false}
  maxWidthClassName=""
/>

✅ Resultado: ocupa el ancho de su columna (`lg:col-span-*`) y no se centra.

---

### 2) Dentro de un flex toolbar (izquierda, que estire)
<div className="flex items-center gap-3">
  <div className="flex-1">
    <SearchBar
      data={data}
      fields={fields}
      onSearch={onSearch}
      centered={false}
      withBottomSpacing={false}
      maxWidthClassName=""
    />
  </div>
  <Button>Acción</Button>
</div>

✅ Resultado: SearchBar se estira en `flex-1`.

---

### 3) Forzar un ancho específico (sin que SearchBar lo decida)
<div className="w-[420px]">
  <SearchBar
    data={data}
    fields={fields}
    onSearch={onSearch}
    centered={false}
    withBottomSpacing={false}
    maxWidthClassName=""
  />
</div>

✅ Resultado: el ancho manda el padre.

---

### 4) Si querés el “comportamiento viejo” (centrada y con max width)
<SearchBar
  data={data}
  fields={fields}
  onSearch={onSearch}
  centered={true}
  withBottomSpacing={true}
  maxWidthClassName="max-w-md"
/>

✅ Resultado: centrada y limitada, pero ahora ES una decisión del padre.

---

## Checklist rápido (para verificar que quedó integrable)
- [ ] `SearchBar` no tiene `mb-*` hardcodeado por defecto
- [ ] `SearchBar` no tiene `justify-center` por defecto
- [ ] `SearchBar` no tiene `max-w-*` por defecto
- [ ] El input sigue siendo `w-full`
- [ ] Todo layout externo se decide desde el contenedor padre (grid/flex/etc.)

---

## Recomendación final (muy importante)
Si `SearchBar` ya se usa en muchas pantallas y no querés romper nada:
- Mantené compatibilidad: dejá props para layout
- Pero cambiá la forma de uso en PanelFiltro (y donde haga falta) pasando:
  centered={false}, withBottomSpacing={false}, maxWidthClassName=""
