/* eslint-env node */
/* global process */
import spawn from 'cross-spawn';
import { createWriteStream, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const LOG_DIR = resolve(process.cwd(), 'test', 'logs');
const LOG_FILE = resolve(LOG_DIR, 'test-run.log');
mkdirSync(LOG_DIR, { recursive: true });

const isWindows = process.platform === 'win32';
const vitestBin = resolve(
  process.cwd(),
  'node_modules',
  '.bin',
  isWindows ? 'vitest.cmd' : 'vitest'
);
const command = vitestBin;
const args = ['run', ...process.argv.slice(2)];

const logStream = createWriteStream(LOG_FILE, { flags: 'a' });
const logHeader = `\n=== Nueva ejecucion de pruebas: ${new Date().toISOString()} ===\n`;
logStream.write(logHeader);

const runner = spawn(command, args, { stdio: ['inherit', 'pipe', 'pipe'] });

runner.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  logStream.write(chunk);
});

runner.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  logStream.write(chunk);
});

runner.on('close', (code) => {
  const message =
    code === 0
      ? 'Pruebas finalizadas correctamente.'
      : `Pruebas finalizadas con codigo ${code}.`;

  const logFooter = `${new Date().toISOString()} | ${message}`;
  logStream.write(`${logFooter}\n`);
  logStream.end();

  console.log(`${message} Revisa el log en test/logs/test-run.log`);
  process.exit(code ?? 1);
});
