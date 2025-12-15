// Test del escenario problemático: turno SIN campos académicos
import 'dotenv/config';

const testProblematicScenario = () => {
  console.log('=== TEST: Escenario problemático (turno sin campos académicos) ===\n');

  // 1. Turno del backend SIN titulo, modulo, descripcion (el caso problemático)
  const turnoExistente = {
    id: '456',
    review: 3,
    fecha: '16/12/2025',
    horario: '14:00 - 15:00',
    sala: 202,
    zoomLink: 'https://zoom.us/j/456',
    comentarios: 'Turno sin datos académicos',
    estado: 'Disponible'
    // NO tiene titulo, modulo, descripcion
  };

  console.log('1. Turno existente del backend (SIN campos académicos):', turnoExistente);
  console.log('   - Tiene titulo?', 'titulo' in turnoExistente);
  console.log('   - Tiene modulo?', 'modulo' in turnoExistente);
  console.log('   - Tiene descripcion?', 'descripcion' in turnoExistente);

  // 2. formValuesFromTurno (versión actualizada)
  const valoresFormulario = {
    review: String(turnoExistente.review),
    fecha: '2025-12-16',
    horaInicio: '14:00',
    horaFin: '15:00',
    sala: String(turnoExistente.sala),
    zoomLink: turnoExistente.zoomLink,
    comentarios: turnoExistente.comentarios,
    estado: turnoExistente.estado
    // NO incluye titulo, modulo, descripcion (ni siquiera como "")
  };

  console.log('\n2. Valores del formulario:', valoresFormulario);
  console.log('   - Tiene titulo?', 'titulo' in valoresFormulario);
  console.log('   - titulo value:', valoresFormulario.titulo);

  // 3. Usuario edita el comentario
  const valoresEditados = {
    ...valoresFormulario,
    comentarios: 'Comentario actualizado'
  };

  console.log('\n3. Usuario edita comentario:', valoresEditados.comentarios);

  // 4. buildTurnoPayloadFromForm (modo edición)
  const payload = {
    review: Number(valoresEditados.review),
    fecha: '16/12/2025',
    horario: '14:00 - 15:00',
    sala: Number(valoresEditados.sala),
    zoomLink: valoresEditados.zoomLink.trim(),
    comentarios: valoresEditados.comentarios?.trim() ?? '',
    // NO incluye titulo, modulo, descripcion
  };

  console.log('\n4. Payload del builder:', payload);
  console.log('   - Tiene titulo?', 'titulo' in payload);
  console.log('   - titulo value:', payload.titulo);

  // 5. AppContext merge
  const mergeField = (field) => {
    const incoming = payload?.[field];
    if (incoming === undefined) return turnoExistente?.[field];
    if (typeof incoming === 'string') {
      const trimmed = incoming.trim();
      return trimmed === '' ? turnoExistente?.[field] : trimmed;
    }
    return incoming;
  };

  const requestPayload = {
    ...turnoExistente,
    ...payload,
    titulo: mergeField('titulo'),
    descripcion: mergeField('descripcion'),
    modulo: mergeField('modulo'),
  };

  console.log('\n5. Request payload después del merge:', {
    titulo: requestPayload.titulo,
    modulo: requestPayload.modulo,
    descripcion: requestPayload.descripcion,
    hasTitulo: 'titulo' in requestPayload
  });

  // 6. Filtro crítico
  const cleanedPayload = { ...requestPayload };
  if (cleanedPayload.titulo === '' || cleanedPayload.titulo === null || cleanedPayload.titulo === undefined) {
    delete cleanedPayload.titulo;
  }
  if (cleanedPayload.descripcion === '' || cleanedPayload.descripcion === null || cleanedPayload.descripcion === undefined) {
    delete cleanedPayload.descripcion;
  }
  if (cleanedPayload.modulo === '' || cleanedPayload.modulo === null || cleanedPayload.modulo === undefined) {
    delete cleanedPayload.modulo;
  }

  console.log('\n6. Cleaned payload (después del filtro):', {
    titulo: cleanedPayload.titulo,
    modulo: cleanedPayload.modulo,
    descripcion: cleanedPayload.descripcion,
    hasTitulo: 'titulo' in cleanedPayload,
    hasModulo: 'modulo' in cleanedPayload,
    hasDescripcion: 'descripcion' in cleanedPayload
  });

  // 7. mapTurnoPayload
  const mappedPayload = {};
  if (cleanedPayload.titulo !== undefined) {
    mappedPayload.titulo = cleanedPayload.titulo;
  }
  if (cleanedPayload.descripcion !== undefined) {
    mappedPayload.descripcion = cleanedPayload.descripcion;
  }
  if (cleanedPayload.modulo !== undefined) {
    mappedPayload.modulo = cleanedPayload.modulo;
  }
  mappedPayload.review = cleanedPayload.review;
  mappedPayload.comentarios = cleanedPayload.comentarios;

  console.log('\n7. Mapped payload (lo que va al API):', mappedPayload);
  console.log('   - Tiene titulo?', 'titulo' in mappedPayload);
  console.log('   - Tiene modulo?', 'modulo' in mappedPayload);
  console.log('   - Tiene descripcion?', 'descripcion' in mappedPayload);

  // Verificación final
  console.log('\n=== RESULTADO ===');
  const hasCamposVacios = 
    ('titulo' in mappedPayload && mappedPayload.titulo === '') ||
    ('modulo' in mappedPayload && mappedPayload.modulo === '') ||
    ('descripcion' in mappedPayload && mappedPayload.descripcion === '');

  if (hasCamposVacios) {
    console.log('❌ ERROR: El backend recibiría campos académicos VACÍOS');
    console.log('   Esto causaría el error de validación!');
  } else {
    console.log('✅ ÉXITO: No se envían campos académicos vacíos');
    console.log('   El backend no recibirá campos que causen validación');
  }

  const tieneCamposAcademicos = 
    'titulo' in mappedPayload || 
    'modulo' in mappedPayload || 
    'descripcion' in mappedPayload;

  if (!tieneCamposAcademicos) {
    console.log('✅ CORRECTO: No se envían campos académicos cuando no existen');
  } else {
    console.log('⚠️  INFO: Se envían campos académicos:', {
      titulo: mappedPayload.titulo,
      modulo: mappedPayload.modulo,
      descripcion: mappedPayload.descripcion
    });
  }
};

testProblematicScenario();
