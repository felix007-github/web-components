import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/loader/**',
      '**/output/**',
      '**/www/**',
      '**/.turbo/**',
      '**/.stencil/**',
      '**/.pnpm-store/**',
      '**/.codex-temp/**',
      '**/coverage/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/components.d.ts',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // TypeScript 已经处理未定义变量/未使用变量，避免规则重复报错
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        // Stencil 的 h 是 JSX 工厂函数，源码里不显式出现
        { argsIgnorePattern: '^_', varsIgnorePattern: '^(_|h)$', caughtErrors: 'none', ignoreRestSiblings: true },
      ],
      // 组件库里有大量 any / ts-ignore，先不强制
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': ['warn', { allowShortCircuit: true, allowTaggedTemplates: true }],
      'no-useless-assignment': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      // 自定义元素（wt-*）的属性必须原样保留，Vue 模板不要自动改成驼峰/短横线
      'vue/attribute-hyphenation': 'off',
      // 自定义元素用命名插槽传内容（slot="cardId"），这不是 Vue 2 的废弃语法
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['**/*.cjs', 'scripts/**/*.js', 'scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  prettier,
);
