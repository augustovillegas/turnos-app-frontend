#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [,, jsonPath, htmlPath] = process.argv;
if (!jsonPath || !htmlPath) {
  console.error('Uso: node renderHtmlReport.mjs <results.json> <output.html>');
  process.exit(1);
}

const safeRead = (p) => {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
};

const raw = safeRead(jsonPath);
if (!raw) {
  console.error('No se pudo leer el archivo JSON de resultados:', jsonPath);
  process.exit(1);
}

let data;
try { data = JSON.parse(raw); } catch (e) {
  console.error('JSON inválido:', e.message);
  process.exit(1);
}

// Vitest JSON structure: data.testResults[] con .status, .name, .startTime, .endTime, .assertionResults[]
const testFiles = Array.isArray(data?.testResults) ? data.testResults : [];
const total = testFiles.length;
const passed = testFiles.filter(f => f.status === 'passed').length;
const failed = testFiles.filter(f => f.status === 'failed').length;

const rows = testFiles.map(file => {
  const fileName = path.basename(file.name || 'unknown');
  const status = file.status || 'unknown';
  const statusClass = status === 'passed' ? 'pass' : 'fail';
  const duration = file.endTime && file.startTime 
    ? ((file.endTime - file.startTime) / 1000).toFixed(2) + 's'
    : 'N/A';
  const testCount = file.assertionResults?.length || 0;
  const passedTests = file.assertionResults?.filter(t => t.status === 'passed').length || 0;
  const failedTests = file.assertionResults?.filter(t => t.status === 'failed').length || 0;

  return `<tr><td>${fileName}</td><td>${testCount} (✓${passedTests} ✗${failedTests})</td><td class="${statusClass}">${status}</td><td>${duration}</td></tr>`;
}).join('');

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Reporte Tests E2E</title><style>
body{font-family:Segoe UI,Arial,sans-serif;background:#f8f9fa;color:#222;margin:20px;}
header{margin-bottom:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #444;padding:6px;font-size:12px;}th{background:#222;color:#fff;}
.pass{color:#0a0;} .fail{color:#c00;} footer{margin-top:30px;font-size:11px;color:#555;}
</style></head><body><header><h1>Reporte de Tests E2E</h1><p>Total archivos: ${total} | Pasaron: <span class="pass">${passed}</span> | Fallaron: <span class="fail">${failed}</span></p><p>Tests totales: ${data.numTotalTests || 0} | Pasaron: <span class="pass">${data.numPassedTests || 0}</span> | Fallaron: <span class="fail">${data.numFailedTests || 0}</span></p></header>
<table><thead><tr><th>Archivo</th><th>Tests</th><th>Estado</th><th>Duración</th></tr></thead><tbody>${rows}</tbody></table>
<footer>Generado: ${new Date().toISOString()} | Fuente: ${path.basename(jsonPath)}</footer></body></html>`;

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Reporte HTML generado en', htmlPath);
