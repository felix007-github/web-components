import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const require = createRequire(resolve('package.json'));
const { name } = JSON.parse(readFileSync('package.json', 'utf8'));
const children = new Set();
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
}

function run(script, args) {
  const child = spawn(process.execPath, [script, ...args], {
    stdio: 'inherit',
  });
  children.add(child);
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => {
    children.delete(child);
    if (!stopping) stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

if (name === '@mache-hangar/lunar-editor-react') {
  const { buildStyles } = await import(
    '../packages/lunar-editor-react/scripts/build-styles.cjs'
  );
  buildStyles();
  run(resolve(dirname(require.resolve('sass')), 'sass.js'), [
    '--watch',
    '--no-source-map',
    '--style=compressed',
    '--load-path=node_modules',
    'styles/global.scss:dist/styles.css',
    'styles/math.scss:dist/extensions/math.css',
    'styles/table.scss:dist/extensions/table.css',
  ]);
}
run(resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), [
  'build',
  '--watch',
]);
run(require.resolve('typescript/bin/tsc'), [
  '-p',
  'tsconfig.json',
  '--watch',
  '--preserveWatchOutput',
]);
