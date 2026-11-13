const fs = require('fs');
const path = require('path');

const task = process.argv[2];

function prepareOutputDirs() {
  ['output/react', 'output/react-cjs', 'output/vue', 'output/vue-cjs'].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

function syncComponentAssets() {
  const candidates = ['src/images', 'src/assets/images'];
  const sourceDir = candidates.find((candidate) => fs.existsSync(candidate));
  const targetDirs = ['dist/lpcp-components/assets', 'dist/components/assets', 'dist/esm/assets'];

  if (!sourceDir) {
    return;
  }

  for (const targetDir of targetDirs) {
    fs.mkdirSync(targetDir, { recursive: true });

    for (const name of fs.readdirSync(sourceDir)) {
      fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name));
    }
  }
}

function clean() {
  ['src/components.d.ts', 'dist', 'loader', 'output/react', 'output/react-cjs', 'output/vue', 'output/vue-cjs', 'www'].forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

const handlers = {
  'prepare-output-dirs': prepareOutputDirs,
  'sync-component-assets': syncComponentAssets,
  clean,
};

if (!handlers[task]) {
  console.error('Unknown task. Use one of: prepare-output-dirs, sync-component-assets, clean');
  process.exit(1);
}

handlers[task]();