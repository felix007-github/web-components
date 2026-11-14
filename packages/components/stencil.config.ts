import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'mache-hangar-components',
  srcIndexHtml: 'public/index.html',
  globalStyle: 'src/assets/styles/index.scss',
  hydratedFlag: { name: 'wt-component', selector: 'class' },
  plugins: [sass({ includePaths: ['src'] })],
  outputTargets: [
    reactOutputTarget({
      outDir: 'output/generated/react/generated',
      stencilPackageName: '@mache-hangar/components',
    }),
    vueOutputTarget({
      componentCorePackage: '@mache-hangar/components',
      proxiesFile: 'output/generated/vue/generated/components.ts',
      includeImportCustomElements: true,
      customElementsDir: 'dist/components',
      componentModels: [
        {
          elements: ['wt-input'],
          event: 'updateModelValue',
          targetAttr: 'modelValue',
          eventAttr: 'detail',
        },
        {
          elements: ['wt-checkbox'],
          event: 'updateModelValue',
          targetAttr: 'modelValue',
          eventAttr: 'detail',
        },
        {
          elements: ['wt-modal'],
          event: 'updateModelValue',
          targetAttr: 'open',
          eventAttr: 'detail',
        },
        {
          elements: ['wt-radio'],
          event: 'updateModelValue',
          targetAttr: 'modelValue',
          eventAttr: 'detail',
        },
        {
          elements: ['wt-switch'],
          event: 'updateModelValue',
          targetAttr: 'modelValue',
          eventAttr: 'detail',
        },
      ],
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      copy: [
        { src: '../public/style.css', dest: 'style.css' },
        { src: '../public/favicon.png', dest: 'favicon.png' },
      ],
      serviceWorker: null, // disable service workers
    },
  ],
  devServer: {
    reloadStrategy: 'hmr', // 尝试使用热模块替换 (Hot Module Replacement)
    openBrowser: false, // 启动时自动打开浏览器
  },
  extras: {
    addGlobalStyleToComponents: false,
  },
  testing: {
    browserHeadless: 'shell',
  },
};
