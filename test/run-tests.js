/* eslint-env node */
/* global process */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const LOG_DIR = resolve(process.cwd(), 'test', 'logs');
mkdirSync(LOG_DIR, { recursive: true });

const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';
const args = ['vitest', 'run'];

const runner = spawn(command, args, { stdio: 'inherit' });

runner.on('close', (code) => {
  const message =
    code === 0
      ? "Pruebas finalizadas correctamente."
      : `Pruebas finalizadas con codigo ${code}.`;

  console.log(`${message} Revisa el log en test/logs/test-run.log`);
  process.exit(code ?? 1);
});
