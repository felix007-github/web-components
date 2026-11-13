# Getting Started

## Project Setup

This is a Web Component library built with Stencil.js and documented with VitePress.

### Prerequisites

- Node.js 20+
- pnpm 10+

## Development Workflow

### 1. Install Dependencies

Run the following command from the workspace root:

```bash
pnpm install
```

### 2. Build the Component Library

The documentation site depends on the build output of `@lpcp/components`:

```bash
pnpm --filter @lpcp/components build
```

This generates:

- ES Module output
- CommonJS output
- Vue framework wrappers
- React framework wrappers
- Custom element definitions
- CSS stylesheets

### 3. Start the Development Server

Start the documentation development server:

```bash
pnpm dev:docs 
pnpm --filter docs dev
```

### 4. Build the Static Site

Generate the production-ready static site:

```bash
pnpm build:docs
pnpm --filter docs build
```

The output files are generated in the `docs/dist` directory.

## One-Command Development

Run the following command from the workspace root to start all development services automatically:

```bash
pnpm dev
```

This starts the following services through Turborepo:

- The component library in watch mode
- The documentation development server

## Project Structure

```text
.
├── packages/
│   ├── components/    # Main component library (Stencil)
│   │   ├── src/
│   │   │   ├── components/          # Component source code
│   │   │   │   ├── wt-button/
│   │   │   │   ├── wt-input/
│   │   │   │   └── wt-icon/
│   │   │   │   └── xxx/
│   │   │   ├── assets/styles/       # Design tokens and global styles
│   │   │   └── utils/
│   │   ├── dist/                    # Compiled output (all formats)
│   │   ├── react/                   # React wrapper output
│   │   ├── vue/                     # Vue wrapper output
│   │   └── package.json
│   │
│   └── icons/         # Icon library (Stencil)
│       ├── src/components/          # 260+ SVG icons
│       ├── dist/                    # Compiled output
│       └── package.json
│
├── docs/              # VitePress documentation site
│   ├── .vitepress/
│   │   ├── config.ts               # VitePress configuration
│   │   └── theme/                  # Custom theme
│   ├── components/                 # Component documentation
│   │   ├── button.md
│   │   ├── input.md
│   │   ├── icon.md
│   │   └── index.md
│   ├── guide/                      # Guide documents
│   │   └── getting-started.md
│   ├── index.md                    # Home page
│   └── package.json
│
├── playground/       # Playground for development and demos
│   ├── react/
│   ├── vue/
│   └── package.json
│
└── package.json      # Workspace root configuration
```

## Development Guide

### Create a New Component

1. Create a new directory under `packages/components/src/components/`
2. Create the `.tsx` and `.scss` files
3. Write the Stencil component code
4. Run `pnpm --filter @lpcp/components build` to compile

### Write Documentation

1. Create a new `.md` file under `docs/components/`
2. Use the `:::demo` block to demonstrate component usage
3. Vue syntax and live preview are supported

### Use Components

#### In a Vue Project

```javascript
import { VtButton, VtInput } from '@lpcp/components/vue'
```

#### In a React Project

```javascript
import { VtButton, VtInput } from '@lpcp/components/react'
```

## FAQ

### Q: Components are missing or not rendering

A: You need to build the component library first:

```bash
pnpm --filter @lpcp/components build
```

### Q: Styles are not loading correctly

A: Make sure the CSS is imported correctly. In Vue projects, styles are imported automatically when you import components.

### Q: How do I add new design tokens?

A: Edit `packages/components/src/assets/styles/root_token.scss`, then rebuild the component library.

## Raw Editor Integration (Monaco As A Third-Party Dependency)

`@lpcp/raw-editor` uses `monaco-editor` and `@lpcp/xmllint-wasm` as `peerDependencies`,
so they must be installed and initialized by the host application.

### 1. Install Dependencies

```bash
pnpm add @lpcp/raw-editor @lpcp/xmllint-wasm monaco-editor
```

### 2. Initialize the Monaco Worker in the Application Entry

Run the following before rendering any `wt-raw-editor`:

```ts
import { setupMonacoEnvironment } from '@lpcp/raw-editor/core';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

setupMonacoEnvironment({
	getWorker(_workerId, label) {
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		return new editorWorker();
	},
});

import 'monaco-editor/min/vs/editor/editor.main.css';
```

### 3. If MonacoEnvironment Already Exists

If the host application has already configured `globalThis.MonacoEnvironment`, `setupMonacoEnvironment` will not overwrite it by default.
If you need to override it, pass:

```ts
setupMonacoEnvironment({
	getWorker: (...args) => {
		// your worker resolver
		throw new Error('not implemented');
	},
	force: true,
});
```

## Resources

- [Stencil Documentation](https://stenciljs.com/)
- [VitePress Documentation](https://vitepress.dev/)
- [Material Design Icons](https://fonts.google.com/icons)
