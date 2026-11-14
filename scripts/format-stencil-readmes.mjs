import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';

const generatedMarker = '<!-- Auto Generated Below -->';

async function findReadmes(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) return findReadmes(file);
      return entry.isFile() && entry.name.toLowerCase() === 'readme.md' ? [file] : [];
    }),
  );
  return files.flat();
}

let generated = 0;
let changed = 0;
for (const file of await findReadmes(resolve('src'))) {
  const original = await readFile(file, 'utf8');
  if (!original.includes(generatedMarker)) continue;
  generated++;
  const options = await resolveConfig(file);
  const formatted = await format(original, { ...options, filepath: file });
  if (formatted !== original) {
    await writeFile(file, formatted);
    changed++;
  }
}

console.log(`Stencil README formatting: ${generated} generated files checked, ${changed} updated.`);
