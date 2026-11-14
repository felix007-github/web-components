import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'mache-hangar-icons',
  hydratedFlag: { name: 'wt-icon', selector: 'class' },
  extras: {
    // fixes VitePress doc build
    enableImportInjection: true,
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      generateTypeDeclarations: false,
      customElementsExportBehavior: 'auto-define-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  devServer: {
    reloadStrategy: 'hmr',
    openBrowser: false,
  },
  testing: {
    modulePathIgnorePatterns: ['<rootDir>/svg/'],
    browserHeadless: 'shell',
  },
};
