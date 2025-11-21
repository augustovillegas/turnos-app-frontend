#!/usr/bin/env node
import 'dotenv/config';
import axios from 'axios';

const baseURL = (process.env.TEST_E2E_API_BASE_URL || process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const roleEnv = {
  email: process.env.TEST_E2E_SUPERADMIN_EMAIL,
  password: process.env.TEST_E2E_SUPERADMIN_PASSWORD,
};

const http = axios.create({ baseURL, timeout: 20000, validateStatus: () => true });

const login = async () => {
  const res = await http.post('/auth/login', { email: roleEnv.email, password: roleEnv.password });
  const token = res.data?.token;
  if (!token) throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.data)}`);
  http.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const tryCreate = async (label, payload) => {
  const res = await http.post('/turnos', payload);
  const out = { label, status: res.status, data: res.data };
  console.log(`[probe] ${label}:`, JSON.stringify(out, null, 2));
};

const main = async () => {
  console.log('[probe] baseURL =', baseURL);
  await login();

  const startIso = '2025-03-01T12:00:00.000Z';
  const endIso = '2025-03-01T13:00:00.000Z';
  const toHM = (iso) => new Date(iso).toISOString().slice(11, 16);
  const durationMinutes = Math.max(0, Math.round((new Date(endIso) - new Date(startIso)) / 60000));

  const epochRoom = Math.floor(Date.now() / 60000);
  const base = {
    review: 9,
    reviewNumber: 9,
    fecha: '2025-03-01',
    horario: '09:00 - 10:00',
    sala: `Turno probe ${Date.now()}`,
    room: epochRoom,
    zoomLink: `https://example.com/probe-${Date.now()}`,
    estado: 'Disponible',
    start: startIso,
    end: endIso,
    startTime: toHM(startIso),
    endTime: toHM(endIso),
    duracion: durationMinutes,
    titulo: 'Turno Probe',
    descripcion: 'Script de diagnostico',
    modulo: 'HTML-CSS',
    comentarios: 'creado por probe',
  };

  // Intenta enviar 'room' como entero pequeño
  await tryCreate('room-as-int', { ...base, room: 101 });
  // Intenta enviar sin 'sala' para ver si acepta solo room
  await tryCreate('only-room', { review: 3, room: 102, fecha: '2025-03-03', date: '2025-03-03', start: startIso, end: endIso });
  // Intenta enviar campo 'roomNumber'
  await tryCreate('roomNumber-alias', { ...base, roomNumber: 103 });
  // Intenta omitir room y usar sala numerica
  await tryCreate('sala-numeric', { ...base, sala: '104', room: undefined });
  // Intenta envio minimo con solo review y room
  await tryCreate('minimal-review-room', { review: 5, room: 105, date: '2025-03-04' });
};

main().catch((e) => {
  console.error('[probe] error:', e?.response?.status, e?.response?.data || e.message);
  process.exit(1);
});
