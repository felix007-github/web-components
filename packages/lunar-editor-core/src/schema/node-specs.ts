import {
  registerEditorSchema,
  composeEditorSchemaConfigurations,
  validateEditorExtensions,
  type EditorSchemaConfiguration,
  type EditorExtension,
} from '../extensions';
import { type DOMOutputSpec, type NodeSpec, Schema } from 'prosemirror-model';
import { getDomSourceKey } from '../source/dom-projection';
import { parseAttrs, readHtmlAttributes } from './dom-attributes';
import {
  HTML_SPECIALIZED_TAGS,
  htmlElementTag,
  isHtmlBlockElement,
  isHtmlBlockVoidTag,
  isHtmlInlineElement,
  isHtmlInlineVoidTag,
  isHtmlRawTag,
} from './html-content-model';
import { sourceWhitespaceBlocks } from './source-whitespace';

function elementSpec(tagName: string, content = 'inline*'): NodeSpec {
  const getAttributes = parseAttrs();
  return {
    attrs: {
      htmlAttrs: { default: {} },
      sourceKey: { default: null },
    },
    content,
    group: 'block',
    parseDOM: [
      {
        tag: tagName,
        priority: 60,
        preserveWhitespace: true,
        getAttrs: (element) =>
          sourceWhitespaceBlocks.has(element as HTMLElement)
            ? getAttributes(element as HTMLElement)
            : false,
      },
      { tag: tagName, getAttrs: getAttributes },
    ],
    toDOM: (node): DOMOutputSpec => [tagName, node.attrs.htmlAttrs, 0],
  };
}

function aliasedTextBlockSpec(tagNames: string[]): NodeSpec {
  const defaultTag = tagNames[0];
  const getAttributes = parseAttrs();
  const readAttributes = (element: HTMLElement) => ({
    ...getAttributes(element),
    localName: htmlElementTag(element),
  });

  return {
    attrs: {
      htmlAttrs: { default: {} },
      localName: { default: defaultTag },
      sourceKey: { default: null },
    },
    content: 'inline*',
    group: 'block',
    parseDOM: tagNames.flatMap((tagName) => [
      {
        tag: tagName,
        priority: 60,
        preserveWhitespace: true,
        getAttrs: (element: HTMLElement) =>
          sourceWhitespaceBlocks.has(element) ? readAttributes(element) : false,
      },
      {
        tag: tagName,
        getAttrs: (element: HTMLElement) => readAttributes(element),
      },
    ]),
    toDOM: (node): DOMOutputSpec => [
      tagNames.includes(node.attrs.localName)
        ? node.attrs.localName
        : defaultTag,
      node.attrs.htmlAttrs,
      0,
    ],
  };
}

function containerSpec(tagName: string, content = 'block*'): NodeSpec {
  return elementSpec(tagName, content);
}

function leafSpec(tagName: string, inline = false): NodeSpec {
  return {
    attrs: {
      htmlAttrs: { default: {} },
      sourceKey: { default: null },
    },
    group: inline ? 'inline' : 'block',
    inline,
    atom: true,
    parseDOM: [{ tag: tagName, getAttrs: parseAttrs() }],
    toDOM: (node): DOMOutputSpec => [tagName, node.attrs.htmlAttrs],
  };
}

function fallbackAttrs(element: HTMLElement) {
  return {
    htmlAttrs: readHtmlAttributes(element),
    localName: htmlElementTag(element),
    sourceKey: getDomSourceKey(element) || null,
  };
}

function fallbackContentSpec(group: 'block' | 'inline'): NodeSpec {
  const inline = group === 'inline';
  return {
    attrs: {
      htmlAttrs: { default: {} },
      localName: { default: inline ? 'span' : 'div' },
      sourceKey: { default: null },
    },
    content: inline ? 'inline*' : 'block*',
    group,
    inline,
    parseDOM: [
      {
        tag: '*',
        priority: 1,
        getAttrs: (element) => {
          const htmlElement = element as HTMLElement;
          const tag = htmlElementTag(htmlElement);
          if (
            HTML_SPECIALIZED_TAGS.has(tag) ||
            isHtmlRawTag(tag) ||
            isHtmlInlineVoidTag(tag) ||
            isHtmlBlockVoidTag(tag) ||
            (inline
              ? !isHtmlInlineElement(htmlElement)
              : !isHtmlBlockElement(htmlElement))
          ) {
            return false;
          }
          return fallbackAttrs(htmlElement);
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      node.attrs.localName || (inline ? 'span' : 'div'),
      node.attrs.htmlAttrs,
      0,
    ],
  };
}

function fallbackLeafSpec(group: 'block' | 'inline'): NodeSpec {
  const inline = group === 'inline';
  return {
    attrs: {
      htmlAttrs: { default: {} },
      localName: { default: inline ? 'span' : 'div' },
      sourceKey: { default: null },
    },
    group,
    inline,
    atom: true,
    parseDOM: [
      {
        tag: '*',
        priority: 2,
        getAttrs: (element) => {
          const htmlElement = element as HTMLElement;
          const tag = htmlElementTag(htmlElement);
          if (
            HTML_SPECIALIZED_TAGS.has(tag) ||
            isHtmlRawTag(tag) ||
            (inline ? !isHtmlInlineVoidTag(tag) : !isHtmlBlockVoidTag(tag))
          ) {
            return false;
          }
          return fallbackAttrs(htmlElement);
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      node.attrs.localName || (inline ? 'span' : 'div'),
      node.attrs.htmlAttrs,
    ],
  };
}

const documentNodes: Record<string, NodeSpec> = {
  doc: { content: 'block*' },
  text: { group: 'inline' },
};

const textBlockNodes: Record<string, NodeSpec> = {
  paragraph: aliasedTextBlockSpec(['p', 'para']),
  heading_1: elementSpec('h1'),
  heading_2: elementSpec('h2'),
  heading_3: elementSpec('h3'),
  heading_4: elementSpec('h4'),
  heading_5: elementSpec('h5'),
  heading_6: elementSpec('h6'),
  blockquote: containerSpec('blockquote'),
  code_block: {
    ...elementSpec('pre', 'text*'),
    code: true,
    marks: '',
    parseDOM: [
      { tag: 'pre', preserveWhitespace: 'full', getAttrs: parseAttrs() },
    ],
  },
};

const inlineAndLeafNodes: Record<string, NodeSpec> = {
  horizontal_rule: leafSpec('hr'),
  hard_break: leafSpec('br', true),
  image: leafSpec('img', true),
  cnode_inline_void: fallbackLeafSpec('inline'),
  cnode_inline: fallbackContentSpec('inline'),
};

const containerNodes: Record<string, NodeSpec> = {
  preserved_div: containerSpec('div'),
  preserved_section: containerSpec('section'),
  cnode_block: fallbackContentSpec('block'),
  list_item: {
    ...containerSpec('li', 'block*'),
    defining: true,
  },
};

const tableNodes: Record<string, NodeSpec> = {
  table: containerSpec(
    'table',
    'caption? colgroup* table_head? table_body* table_foot? table_row*'
  ),
  caption: containerSpec('caption'),
  colgroup: containerSpec('colgroup', 'col*'),
  col: leafSpec('col'),
  table_head: containerSpec('thead', 'table_row+'),
  table_body: containerSpec('tbody', 'table_row+'),
  table_foot: containerSpec('tfoot', 'table_row+'),
  table_row: containerSpec('tr', '(table_header | table_cell)+'),
  table_header: containerSpec('th', 'block+'),
  table_cell: containerSpec('td', 'block+'),
};

const nodes: Record<string, NodeSpec> = {
  ...documentNodes,
  ...textBlockNodes,
  ...inlineAndLeafNodes,
  ...containerNodes,
  ...tableNodes,
};

export function createEditorSchema(
  configuration: EditorSchemaConfiguration = {},
  extensions: readonly EditorExtension[] = []
) {
  validateEditorExtensions(extensions);
  const combined = composeEditorSchemaConfigurations([
    ...extensions,
    configuration,
  ]);
  const schema = new Schema({ nodes: { ...nodes, ...combined.nodes } });
  registerEditorSchema(schema, combined);
  return schema;
}
export const lunarSchema = createEditorSchema();
