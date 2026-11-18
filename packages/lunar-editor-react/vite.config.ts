import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'native-react-editor-boundary',
      resolveId(id) {
        if (id.startsWith('prosemirror-')) {
          this.error('Import ProseMirror APIs from @mache-hangar/lunar-editor-core/pm; lunar-editor-core owns the engine dependency.');
        }
      },
      generateBundle() {
        for (const id of this.getModuleIds()) {
          if (id.includes('@stencil/') || /[/\\]app[/\\]src[/\\]/.test(id) || /(?:^|[/\\])html-editor[/\\](?:src|dist)/.test(id)) {
            this.error(`lunar-editor-react must not import the legacy html-editor: ${id}`);
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
      entry: {
        'index': 'src/index.ts',
        'rich-editor': 'src/rich-editor.tsx',
        'code-editor': 'src/code-editor.tsx',
        'extensions/math/index': 'src/extensions/math/index.ts',
        'extensions/table/index': 'src/extensions/table/index.ts',
        'extensions/table-ui/index': 'src/extensions/table-ui/index.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => entryName + (format === 'es' ? '.js' : '.cjs'),
    },
    rollupOptions: {
      external: id => /^(react(?:-dom)?(?:\/|$)|@mache-hangar\/(?:lunar-editor-core|components)(?:\/|$)|antd(?:\/|$)|mathlive(?:\/|$))/.test(id),
    },
  },
});
