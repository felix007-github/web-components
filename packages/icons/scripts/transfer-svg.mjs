import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { optimize } from 'svgo';
import { join } from 'node:path';
import { URL, fileURLToPath } from 'node:url';

const SVG_EXT = '.svg';

const format = (svgFile) => {
  return optimize(svgFile, {
    plugins: [
      {
        name: 'convertColors',
        params: { currentColor: /^(?!url|none)./ },
      },
      {
        name: 'cleanupListOfValues',
        active: true,
      },
      {
        name: 'removeStyleElement',
        active: true,
      },
      {
        name: 'removeViewBox',
        active: false,
      },
      {
        name: 'removeDimensions',
        active: true,
      },
    ],
  });
};

const normalizeIconName = (name) => {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^[-_]+|[-_]+$)/g, '');
};

const toPascalCase = (value) => {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join('');
};

const uniqueName = (baseName, usedNames, index) => {
  const fallback = baseName || `icon-${index + 1}`;
  if (!usedNames.has(fallback)) {
    usedNames.add(fallback);
    return fallback;
  }

  let counter = 2;
  let candidate = `${fallback}-${counter}`;
  while (usedNames.has(candidate)) {
    counter += 1;
    candidate = `${fallback}-${counter}`;
  }
  usedNames.add(candidate);
  return candidate;
};

const getSvgEntries = (dir) => {
  const files = readdirSync(dir, 'utf-8')
    .filter((file) => file.endsWith(SVG_EXT))
    .sort();

  const usedNames = new Set();
  return files.map((fileName, index) => {
    const safeName = uniqueName(normalizeIconName(fileName.slice(0, -SVG_EXT.length)), usedNames, index);
    return {
      fileName,
      safeName,
    };
  });
};

const ensureOutputDir = (dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const cleanupStaleGeneratedComponents = (componentsDir, activeNames) => {
  ensureOutputDir(componentsDir);
  const activeFiles = new Set(activeNames.map((name) => `${name}.tsx`));
  const files = readdirSync(componentsDir, 'utf-8');

  files
    .filter((file) => file.endsWith('.tsx') && !activeFiles.has(file))
    .forEach((file) => {
      try {
        rmSync(join(componentsDir, file), { force: true });
      } catch (error) {
        if (!['ENOENT', 'EPERM', 'EBUSY'].includes(error?.code)) {
          throw error;
        }
      }
    });
};

const renderCode = (tagName, className, svgMarkup) => {
  return `import { Component, Host, h } from '@stencil/core';
  
  @Component({
    tag: '${tagName}'
  })
  export class ${className} {
    render() {
      return <Host class="wt-svg">${svgMarkup}</Host>;
    }
  }
  `;
};

// 所有 icon 标签
export const swcIconTemplate = (entry, outDir) => {
  const entries = getSvgEntries(entry);
  const icon = entries
    .map(({ safeName }) => `<wt-icon-${safeName} style="margin-right: 10px;"></wt-icon-${safeName}>\n`)
    .join('');

  writeFileSync(join(outDir, 'wt-icon.md'), icon);
}

/**
 * 编译 svg 图标为 class 组件
 * @param {*} entry 解析入口目录
 * @param {*} outDir 输出目录
 */
const renderCompFile = (entry, outDir) => {
  const entries = getSvgEntries(entry);
  const componentsDir = join(outDir, 'components');
  ensureOutputDir(componentsDir);

  const componentsList = [];
  entries.forEach(({ fileName, safeName }) => {
    const svgFileContent = readFileSync(join(entry, fileName), 'utf-8');
    const optimizedSvg = format(svgFileContent).data;
    const tagName = `wt-icon-${safeName}`;
    const className = `VtIcon${toPascalCase(safeName) || 'Generated'}`;
    const template = renderCode(tagName, className, optimizedSvg);

    componentsList.push(safeName);
    writeFileSync(join(componentsDir, `${safeName}.tsx`), template);
  });

  cleanupStaleGeneratedComponents(componentsDir, componentsList);

  const listContent = componentsList.map((name) => `\n'${name}'`).join(',');
  writeFileSync(join(outDir, 'index.ts'), `export const icons = [${listContent}\n];`);
}

const __dirname = new URL('..', import.meta.url);
const root = fileURLToPath(__dirname);

const entryDir = join(root, 'svg');
const outputDir = join(root, 'src');

renderCompFile(entryDir, outputDir)

