import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTurno, updateTurno, getTurnoById, deleteTurno } from '../../src/services/turnosService.js';

const RUN_REMOTE = process.env.RUN_REMOTE_TESTS === 'true';

describe.skipIf(!RUN_REMOTE)('Turno Edit - Preservación de campos académicos', () => {
  let createdTurnoId = null;

  beforeAll(async () => {
    // Crear un turno con todos los campos académicos
    const newTurno = {
      titulo: 'Clase Original de Testing',
      descripcion: 'Descripción original para testing',
      modulo: 'Módulo de Testing',
      review: 1,
      fecha: '20/12/2025',
      horario: '10:00 - 11:00',
      sala: 999,
      room: 999,
      zoomLink: 'https://zoom.us/j/test123',
      comentarios: 'Comentario inicial',
      estado: 'Disponible',
      start: new Date('2025-12-20T10:00:00').toISOString(),
      end: new Date('2025-12-20T11:00:00').toISOString(),
    };

    const created = await createTurno(newTurno);
    createdTurnoId = created.id || created._id;
    console.log('[TEST] Turno creado con ID:', createdTurnoId);
  });

  afterAll(async () => {
    if (createdTurnoId) {
      try {
        await deleteTurno(createdTurnoId);
        console.log('[TEST] Turno limpiado:', createdTurnoId);
      } catch (err) {
        console.warn('[TEST] No se pudo limpiar el turno:', err.message);
      }
    }
  });

  it('preserva campos académicos (titulo, modulo, descripcion) al editar otros campos', async () => {
    // 1. Obtener el turno original
    const original = await getTurnoById(createdTurnoId);
    expect(original).toBeDefined();
    expect(original.titulo).toBe('Clase Original de Testing');
    expect(original.modulo).toBe('Módulo de Testing');
    expect(original.descripcion).toBe('Descripción original para testing');

    console.log('[TEST] Turno original:', {
      titulo: original.titulo,
      modulo: original.modulo,
      descripcion: original.descripcion,
      sala: original.sala || original.room
    });

    // 2. Actualizar SOLO la sala y comentarios (simulando edición desde el form)
    const updatePayload = {
      review: 1,
      fecha: '20/12/2025',
      horario: '10:00 - 11:00',
      sala: 888,
      room: 888,
      zoomLink: 'https://zoom.us/j/test123',
      comentarios: 'Comentario actualizado desde test',
      start: new Date('2025-12-20T10:00:00').toISOString(),
      end: new Date('2025-12-20T11:00:00').toISOString(),
      // NO incluir titulo, modulo, descripcion (como lo hace el form en modo edición)
    };

    console.log('[TEST] Payload de actualización (sin campos académicos):', {
      hasTitulo: 'titulo' in updatePayload,
      hasModulo: 'modulo' in updatePayload,
      hasDescripcion: 'descripcion' in updatePayload,
      sala: updatePayload.sala,
      comentarios: updatePayload.comentarios
    });

    const updated = await updateTurno(createdTurnoId, updatePayload);
    expect(updated).toBeDefined();

    // 3. Verificar que los campos académicos se PRESERVARON
    const verificado = await getTurnoById(createdTurnoId);
    
    console.log('[TEST] Turno después de actualizar:', {
      titulo: verificado.titulo,
      modulo: verificado.modulo,
      descripcion: verificado.descripcion,
      sala: verificado.sala || verificado.room,
      comentarios: verificado.comentarios
    });

    // ASERCIONES CRÍTICAS: Los campos académicos NO deben haberse borrado
    expect(verificado.titulo).toBe('Clase Original de Testing');
    expect(verificado.modulo).toBe('Módulo de Testing');
    expect(verificado.descripcion).toBe('Descripción original para testing');
    
    // Verificar que los campos editados SÍ se actualizaron
    expect(verificado.sala || verificado.room).toBe(888);
    expect(verificado.comentarios).toContain('actualizado desde test');
  });

  it('no envía campos académicos vacíos que causen error de validación', async () => {
    // Simular payload con campos vacíos (el caso problemático original)
    const problematicPayload = {
      titulo: '', // <-- String vacío que causaba el error
      modulo: '',
      descripcion: '',
      review: 1,
      fecha: '20/12/2025',
      horario: '10:00 - 11:00',
      sala: 777,
      room: 777,
      zoomLink: 'https://zoom.us/j/test456',
      comentarios: 'Test de campos vacíos',
      start: new Date('2025-12-20T10:00:00').toISOString(),
      end: new Date('2025-12-20T11:00:00').toISOString(),
    };

    // Con el fix, esto NO debería causar error
    // El filtro elimina los campos vacíos antes de enviarlos al backend
    const updated = await updateTurno(createdTurnoId, problematicPayload);
    expect(updated).toBeDefined();

    // Verificar que los campos académicos originales se mantuvieron
    const verificado = await getTurnoById(createdTurnoId);
    expect(verificado.titulo).toBe('Clase Original de Testing');
    expect(verificado.modulo).toBe('Módulo de Testing');
    expect(verificado.descripcion).toBe('Descripción original para testing');
    
    // Y que la sala SÍ se actualizó
    expect(verificado.sala || verificado.room).toBe(777);
  });
});
