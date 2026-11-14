import {
  findSourceParentKey,
  getSourceNode,
  isSourceParentNode,
  sameSourceKeys,
  type SourceAttribute,
  type SourceDocument,
  type SourceElementNode,
  type SourceNode,
} from './model';

export type SerializeSourceDocumentOptions = {
  elementAttribute?: {
    name: string;
    value: (element: SourceElementNode) => string;
  };
  omitElement?: (element: SourceElementNode) => boolean;
};

const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const rawTextElements = new Set([
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
  'script',
  'style',
  'xmp',
]);

function sourceSlice(document: SourceDocument, node: SourceNode) {
  return node.sourceRange
    ? document.source.slice(node.sourceRange.from, node.sourceRange.to)
    : undefined;
}

function isLocallyPristine(node: SourceNode, currentParentKey?: string) {
  if (node.origin === 'inserted') {
    return false;
  }
  if (node.kind !== 'root' && node.originalParentKey !== currentParentKey) {
    return false;
  }
  if (node.kind === 'text' || node.kind === 'comment') {
    return node.value === node.originalValue;
  }
  if (isSourceParentNode(node)) {
    return sameSourceKeys(node.childKeys, node.originalChildKeys);
  }
  return true;
}

function checkSourceNodePristine(
  document: SourceDocument,
  key: string,
  currentParentKey: string | undefined,
  memo: Map<string, boolean>,
  active: Set<string>,
): boolean {
  const known = memo.get(key);
  if (known !== undefined) {
    return known;
  }
  if (active.has(key)) {
    return false;
  }

  const node = getSourceNode(document, key);
  if (!isLocallyPristine(node, currentParentKey)) {
    memo.set(key, false);
    return false;
  }
  if (!isSourceParentNode(node)) {
    memo.set(key, true);
    return true;
  }

  active.add(key);
  const pristine = node.childKeys.every((childKey) => (
    checkSourceNodePristine(document, childKey, node.key, memo, active)
  ));
  active.delete(key);
  memo.set(key, pristine);
  return pristine;
}

export function isSourceNodePristine(document: SourceDocument, key: string) {
  const currentParentKey = key === document.rootKey
    ? undefined
    : findSourceParentKey(document, key);
  return checkSourceNodePristine(
    document,
    key,
    currentParentKey,
    new Map(),
    new Set(),
  );
}

function escapeText(value: string, parentTag?: string) {
  if (parentTag && rawTextElements.has(parentTag)) {
    return value;
  }
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

function serializeAttribute(attribute: SourceAttribute) {
  const name = attribute.prefix
    ? `${attribute.prefix}:${attribute.name}`
    : attribute.name;
  return `${name}="${escapeAttribute(attribute.value)}"`;
}

function serializeOpenTag(element: SourceElementNode) {
  const attributes = element.attributes.length
    ? ` ${element.attributes.map(serializeAttribute).join(' ')}`
    : '';
  return `<${element.tagName}${attributes}>`;
}

function addElementAttribute(
  openTag: string,
  attribute: NonNullable<SerializeSourceDocumentOptions['elementAttribute']>,
  element: SourceElementNode,
) {
  let offset = openTag.length - 1;
  if (openTag[offset - 1] === '/') {
    offset -= 1;
  }
  const serializedAttribute = ` ${attribute.name}="${escapeAttribute(attribute.value(element))}"`;
  return openTag.slice(0, offset) + serializedAttribute + openTag.slice(offset);
}

function serializeDoctype(node: Extract<SourceNode, { kind: 'doctype' }>) {
  if (node.publicId) {
    return `<!DOCTYPE ${node.name} PUBLIC "${node.publicId}" "${node.systemId}">`;
  }
  if (node.systemId) {
    return `<!DOCTYPE ${node.name} SYSTEM "${node.systemId}">`;
  }
  return `<!DOCTYPE ${node.name}>`;
}

function serializeNode(
  document: SourceDocument,
  key: string,
  pristineMemo: Map<string, boolean>,
  options: SerializeSourceDocumentOptions,
  parentTag?: string,
  parentKey?: string,
): string {
  const node = getSourceNode(document, key);
  if (node.kind === 'element' && options.omitElement?.(node)) {
    return '';
  }
  const needsElementTraversal = Boolean(
    (options.elementAttribute || options.omitElement) &&
      (node.kind === 'root' || node.kind === 'element'),
  );
  if (
    !needsElementTraversal &&
    checkSourceNodePristine(document, key, parentKey, pristineMemo, new Set())
  ) {
    const raw = sourceSlice(document, node);
    if (raw !== undefined) {
      return raw;
    }
  }

  if (node.kind === 'root') {
    return node.childKeys
      .map((childKey) => serializeNode(
        document,
        childKey,
        pristineMemo,
        options,
        undefined,
        node.key,
      ))
      .join('');
  }
  if (node.kind === 'text') {
    if (node.originalParentKey !== parentKey) {
      return escapeText(node.value, parentTag);
    }
    return escapeText(node.value, parentTag);
  }
  if (node.kind === 'comment') {
    return `<!--${node.value}-->`;
  }
  if (node.kind === 'doctype') {
    return serializeDoctype(node);
  }
  if (node.origin === 'implicit') {
    return node.childKeys
      .map((childKey) => serializeNode(
        document,
        childKey,
        pristineMemo,
        options,
        parentTag,
        node.key,
      ))
      .join('');
  }

  const baseOpenTag = node.origin === 'parsed' && node.startTagRange
    ? document.source.slice(node.startTagRange.from, node.startTagRange.to)
    : serializeOpenTag(node);
  const openTag = options.elementAttribute
    ? addElementAttribute(baseOpenTag, options.elementAttribute, node)
    : baseOpenTag;
  const children = node.childKeys
    .map((childKey) => serializeNode(
      document,
      childKey,
      pristineMemo,
      options,
      node.tagName,
      node.key,
    ))
    .join('');
  let closeTag = '';
  if (node.origin === 'parsed' && node.endTagRange) {
    closeTag = document.source.slice(node.endTagRange.from, node.endTagRange.to);
  } else if (node.origin === 'inserted' && !voidElements.has(node.tagName)) {
    closeTag = `</${node.tagName}>`;
  }
  return `${openTag}${children}${closeTag}`;
}

export function serializeSourceDocument(
  document: SourceDocument,
  options: SerializeSourceDocumentOptions = {},
) {
  return serializeNode(document, document.rootKey, new Map(), options);
}

/** Serialize one reachable source subtree while preserving pristine source. */
export function serializeSourceNode(
  document: SourceDocument,
  key: string,
  options: SerializeSourceDocumentOptions = {},
) {
  const parentKey = key === document.rootKey
    ? undefined
    : findSourceParentKey(document, key);
  const parent = parentKey ? getSourceNode(document, parentKey) : undefined;
  const parentTag = parent?.kind === 'element' ? parent.tagName : undefined;
  return serializeNode(
    document,
    key,
    new Map(),
    options,
    parentTag,
    parentKey,
  );
}
