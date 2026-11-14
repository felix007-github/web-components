import type { NodeSpec, DOMOutputSpec } from '@mache-hangar/lunar-editor-core/pm';
import { getDomSourceKey } from '@mache-hangar/lunar-editor-core/source/dom-projection';
import { readHtmlAttributes } from '@mache-hangar/lunar-editor-core/schema/dom-attributes';
export function parseMathAttrs(element: HTMLElement) {
  const htmlAttrs = readHtmlAttributes(element);
  delete htmlAttrs['data-type'];
  delete htmlAttrs['data-display'];
  delete htmlAttrs['data-latex'];

  return {
    htmlAttrs,
    latex: element.dataset.latex || '',
    sourceKey: getDomSourceKey(element) || null,
  };
}

export const mathNodes: Record<string, NodeSpec> = {
  math_block: {
    attrs: {
      htmlAttrs: { default: {} },
      latex: { default: '' },
      sourceKey: { default: null },
    },
    atom: true,
    group: 'block',
    isolating: true,
    parseDOM: [
      {
        tag: 'p[data-type="math"][data-display="block"]',
        priority: 100,
        getAttrs: (element) => parseMathAttrs(element as HTMLElement),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      'p',
      {
        ...node.attrs.htmlAttrs,
        'data-type': 'math',
        'data-display': 'block',
        'data-latex': node.attrs.latex || '',
      },
    ],
  },
  math_inline: {
    attrs: {
      htmlAttrs: { default: {} },
      latex: { default: '' },
      sourceKey: { default: null },
    },
    atom: true,
    group: 'inline',
    inline: true,
    isolating: true,
    parseDOM: [
      {
        tag: 'span[data-type="math"][data-display="inline"]',
        priority: 100,
        getAttrs: (element) => parseMathAttrs(element as HTMLElement),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      'span',
      {
        ...node.attrs.htmlAttrs,
        'data-type': 'math',
        'data-display': 'inline',
        'data-latex': node.attrs.latex || '',
      },
    ],
  },
};
