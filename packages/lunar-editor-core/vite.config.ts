import { defineConfig } from 'vite';
import { isAbsolute } from 'node:path';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

function entries(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? (entry.name === '__tests__' ? [] : entries(file)) : file.endsWith('.ts') && !file.endsWith('.d.ts') ? [file] : [];
  });
}

export default defineConfig({
  plugins: [
    {
      name: 'framework-independent-lunar-editor-core',
      generateBundle() {
        for (const id of this.getModuleIds()) {
          if (
            /(?:^|[/\\])(?:react|react-dom|vue|@stencil)(?:[/\\]|$)/.test(id) ||
            /[/\\]app[/\\]src[/\\]/.test(id) ||
            /^@[^/]+\/(?:html-editor(?:-react)?|lunar-editor-react)(?:\/|$)/.test(id)
          ) {
            this.error(`lunar-editor-core must not import a UI framework: ${id}`);
          }
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: !process.argv.includes('--watch'),
    sourcemap: true,
    lib: {
      entry: Object.fromEntries(entries('src').map(file => [relative('src', file).replaceAll('\\', '/').slice(0, -3), file])),
    },
    rollupOptions: {
      external: id => !id.startsWith('.') && !isAbsolute(id) && !id.startsWith('\0'),
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
    },
  },
});
