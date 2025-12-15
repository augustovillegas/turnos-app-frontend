// Script para probar el flujo de edición de turno
import 'dotenv/config';

// Simular el flujo completo
const testEditFlow = () => {
  console.log('=== TEST: Flujo de edición de turno ===\n');

  // 1. Turno existente del backend (simulado)
  const turnoExistente = {
    id: '123',
    titulo: 'Clase de React',
    modulo: 'React',
    descripcion: 'Repaso de hooks',
    review: 2,
    fecha: '15/12/2025',
    horario: '10:00 - 11:00',
    sala: 101,
    zoomLink: 'https://zoom.us/j/123',
    comentarios: 'Comentario inicial',
    estado: 'Disponible'
  };

  console.log('1. Turno existente del backend:', turnoExistente);

  // 2. formValuesFromTurno (simulado - versión actualizada sin titulo/modulo/descripcion)
  const valoresFormulario = {
    review: String(turnoExistente.review),
    fecha: '2025-12-15',
    horaInicio: '10:00',
    horaFin: '11:00',
    sala: String(turnoExistente.sala),
    zoomLink: turnoExistente.zoomLink,
    comentarios: turnoExistente.comentarios,
    estado: turnoExistente.estado
    // NO incluye titulo, modulo, descripcion
  };

  console.log('\n2. Valores del formulario (sin campos académicos):', valoresFormulario);
  console.log('   - Tiene titulo?', 'titulo' in valoresFormulario);
  console.log('   - Tiene modulo?', 'modulo' in valoresFormulario);
  console.log('   - Tiene descripcion?', 'descripcion' in valoresFormulario);

  // 3. Usuario edita solo la hora
  const valoresEditados = {
    ...valoresFormulario,
    horaInicio: '11:00',
    horaFin: '12:00'
  };

  console.log('\n3. Usuario edita la hora:', { horaInicio: valoresEditados.horaInicio, horaFin: valoresEditados.horaFin });

  // 4. buildTurnoPayloadFromForm (simulado - modo edición)
  const isCreating = false;
  const payload = {
    review: Number(valoresEditados.review),
    fecha: '15/12/2025',
    horario: '11:00 - 12:00',
    sala: Number(valoresEditados.sala),
    zoomLink: valoresEditados.zoomLink.trim(),
    comentarios: valoresEditados.comentarios?.trim() ?? '',
    // En modo edición NO incluye titulo, modulo, descripcion
  };

  console.log('\n4. Payload del builder (isCreating=false):', payload);
  console.log('   - Tiene titulo?', 'titulo' in payload);
  console.log('   - Tiene modulo?', 'modulo' in payload);
  console.log('   - Tiene descripcion?', 'descripcion' in payload);

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
    horario: requestPayload.horario
  });

  // 6. Filtro crítico (nuevo)
  const cleanedPayload = { ...requestPayload };
  if (cleanedPayload.titulo === '' || cleanedPayload.titulo === null) {
    delete cleanedPayload.titulo;
  }
  if (cleanedPayload.descripcion === '' || cleanedPayload.descripcion === null) {
    delete cleanedPayload.descripcion;
  }
  if (cleanedPayload.modulo === '' || cleanedPayload.modulo === null) {
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

  // 7. mapTurnoPayload (simulado)
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
  mappedPayload.horario = cleanedPayload.horario;
  mappedPayload.sala = cleanedPayload.sala;

  console.log('\n7. Mapped payload (lo que va al API):', mappedPayload);
  console.log('   - Tiene titulo?', 'titulo' in mappedPayload);
  console.log('   - Tiene modulo?', 'modulo' in mappedPayload);
  console.log('   - Tiene descripcion?', 'descripcion' in mappedPayload);

  // Verificación final
  console.log('\n=== RESULTADO ===');
  if ('titulo' in mappedPayload && 'modulo' in mappedPayload && 'descripcion' in mappedPayload) {
    console.log('✅ ÉXITO: Los campos académicos se preservaron correctamente');
    console.log('   titulo:', mappedPayload.titulo);
    console.log('   modulo:', mappedPayload.modulo);
    console.log('   descripcion:', mappedPayload.descripcion);
  } else {
    console.log('❌ ERROR: Los campos académicos no están en el payload');
  }

  console.log('\n¿El backend recibiría campos vacíos?', 
    (mappedPayload.titulo === '' || mappedPayload.modulo === '' || mappedPayload.descripcion === '') 
      ? '❌ SÍ - PROBLEMA!' 
      : '✅ NO - Correcto'
  );
};

testEditFlow();
