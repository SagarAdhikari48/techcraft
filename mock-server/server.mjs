import { spawn } from 'node:child_process';

const port = process.env.PORT || 3000;

const server = spawn(
  'npx',
  [
    'json-server',
    '--watch',
    'mock-server/db.json',
    '--routes',
    'mock-server/routes.json',
    '--host',
    '0.0.0.0',
    '--port',
    String(port)
  ],
  {
    stdio: 'inherit',
    shell: true
  }
);

server.on('close', (code) => {
  process.exit(code ?? 0);
});