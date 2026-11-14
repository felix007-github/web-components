import {
  parse,
  parseFragment,
  type DefaultTreeAdapterTypes,
  type ParserError,
} from 'parse5';
import type {
  SourceAttribute,
  SourceDiagnostic,
  SourceDocument,
  SourceElementNode,
  SourceNode,
  SourceRange,
} from './model';

export type ParseSourceHtmlOptions = {
  mode?: 'document' | 'fragment';
};

type LocatedNode = DefaultTreeAdapterTypes.ChildNode & {
  sourceCodeLocation?: {
    startOffset: number;
    endOffset: number;
    startTag?: { startOffset: number; endOffset: number };
    endTag?: { startOffset: number; endOffset: number };
    attrs?: Record<string, { startOffset: number; endOffset: number }>;
  } | null;
};

class SourceKeyFactory {
  private readonly counts = new Map<string, number>();

  create(node: LocatedNode) {
    const location = node.sourceCodeLocation;
    let base: string;

    if ('tagName' in node) {
      const id = node.attrs.find((attribute) => attribute.name === 'id')?.value;
      base = id
        ? `element:id:${id}`
        : location
          ? `element:${node.tagName}@${location.startOffset}:${location.endOffset}`
          : `element:${node.tagName}:implicit`;
    } else if (node.nodeName === '#text') {
      base = location
        ? `text@${location.startOffset}:${location.endOffset}`
        : 'text:implicit';
    } else if (node.nodeName === '#comment') {
      base = location
        ? `comment@${location.startOffset}:${location.endOffset}`
        : 'comment:implicit';
    } else {
      base = location
        ? `doctype@${location.startOffset}:${location.endOffset}`
        : 'doctype:implicit';
    }

    const count = (this.counts.get(base) || 0) + 1;
    this.counts.set(base, count);
    return count === 1 ? base : `${base}#${count}`;
  }
}

function toSourceRange(location: { startOffset: number; endOffset: number } | undefined | null): SourceRange | undefined {
  return location
    ? { from: location.startOffset, to: location.endOffset }
    : undefined;
}

function toSourceAttributes(node: DefaultTreeAdapterTypes.Element): SourceAttribute[] {
  const locations = node.sourceCodeLocation?.attrs;
  return node.attrs.map((attribute) => ({
    name: attribute.name,
    value: attribute.value,
    namespace: attribute.namespace,
    prefix: attribute.prefix,
    sourceRange: toSourceRange(locations?.[attribute.name]),
  }));
}

function getElementChildren(node: DefaultTreeAdapterTypes.Element) {
  return node.nodeName === 'template'
    ? (node as DefaultTreeAdapterTypes.Template).content.childNodes
    : node.childNodes;
}

function toDiagnostic(error: ParserError): SourceDiagnostic {
  const range = typeof error.startOffset === 'number' && typeof error.endOffset === 'number'
    ? { from: error.startOffset, to: error.endOffset }
    : undefined;
  return {
    code: error.code,
    message: `HTML parser recovered from ${error.code}.`,
    range,
    severity: 'warning',
  };
}

export function parseSourceHtml(
  source: string,
  options: ParseSourceHtmlOptions = {},
): SourceDocument {
  const mode = options.mode || 'fragment';
  const diagnostics: SourceDiagnostic[] = [];
  const parserOptions = {
    sourceCodeLocationInfo: true,
    onParseError: (error: ParserError) => diagnostics.push(toDiagnostic(error)),
  };
  const parsedRoot = mode === 'document'
    ? parse(source, parserOptions)
    : parseFragment(source, parserOptions);
  const nodes = new Map<string, SourceNode>();
  const keyFactory = new SourceKeyFactory();
  const rootKey = 'source:root';

  const convertNode = (
    input: DefaultTreeAdapterTypes.ChildNode,
    originalParentKey: string,
  ): string => {
    const node = input as LocatedNode;
    const key = keyFactory.create(node);
    const sourceRange = toSourceRange(node.sourceCodeLocation);

    if ('tagName' in node) {
      const element: SourceElementNode = {
        key,
        kind: 'element',
        origin: sourceRange ? 'parsed' : 'implicit',
        originalParentKey,
        tagName: node.tagName,
        namespaceUri: node.namespaceURI,
        attributes: toSourceAttributes(node),
        sourceRange,
        startTagRange: toSourceRange(node.sourceCodeLocation?.startTag),
        endTagRange: toSourceRange(node.sourceCodeLocation?.endTag),
        childKeys: [],
        originalChildKeys: [],
      };
      nodes.set(key, element);
      const childKeys = getElementChildren(node).map((child) => (
        convertNode(child, key)
      ));
      nodes.set(key, {
        ...element,
        childKeys,
        originalChildKeys: [...childKeys],
      });
      return key;
    }

    if (node.nodeName === '#text') {
      nodes.set(key, {
        key,
        kind: 'text',
        origin: sourceRange ? 'parsed' : 'implicit',
        originalParentKey,
        sourceRange,
        value: node.value,
        originalValue: node.value,
      });
      return key;
    }

    if (node.nodeName === '#comment') {
      nodes.set(key, {
        key,
        kind: 'comment',
        origin: sourceRange ? 'parsed' : 'implicit',
        originalParentKey,
        sourceRange,
        value: node.data,
        originalValue: node.data,
      });
      return key;
    }

    nodes.set(key, {
      key,
      kind: 'doctype',
      origin: sourceRange ? 'parsed' : 'implicit',
      originalParentKey,
      sourceRange,
      name: node.name,
      publicId: node.publicId,
      systemId: node.systemId,
    });
    return key;
  };

  const childKeys = parsedRoot.childNodes.map((child) => convertNode(child, rootKey));
  nodes.set(rootKey, {
    key: rootKey,
    kind: 'root',
    mode,
    origin: 'parsed',
    sourceRange: { from: 0, to: source.length },
    childKeys,
    originalChildKeys: [...childKeys],
  });

  return {
    source,
    rootKey,
    nodes,
    diagnostics,
    revision: 0,
  };
}
