/** Serialize changed PM children and import them while retaining untouched source. */
import { Fragment, type Node as ProseMirrorNode } from 'prosemirror-model';
import { serializeLunarFragment } from '../../schema/index';
import { isGeneratedContainerParagraph } from '../../schema/generated-container';
import {
  getSourceNode,
  getSourceParentNode,
  type SourceAttribute,
  type SourceDocument,
  type SourceElementNode,
  type SourceNode,
} from '../model';
import { parseSourceHtml } from '../parser';
import { findLunarSourceElementRange, type LunarSourceMap } from '../source-map';
import { createReservedSourceKey } from './identity';

function findTemporarySourceAttribute(nodes: readonly ProseMirrorNode[]) {
  let suffix = 0;
  let name = 'data-lunar-structural-source-ref';
  const hasAttribute = (attributeName: string) =>
    nodes.some((root) => {
      let found = false;
      root.descendants((node) => {
        if (node.attrs?.htmlAttrs?.[attributeName] !== undefined) {
          found = true;
          return false;
        }
        return undefined;
      });
      return found || root.attrs?.htmlAttrs?.[attributeName] !== undefined;
    });
  while (hasAttribute(name)) {
    suffix += 1;
    name = `data-lunar-structural-source-ref-${suffix}`;
  }
  return name;
}

function addTemporarySourceAttributes(
  node: ProseMirrorNode,
  attributeName: string,
): ProseMirrorNode {
  if (node.isText) {
    return node;
  }
  const content = node.childCount
    ? Fragment.fromArray(
        Array.from({ length: node.childCount }, (_, index) =>
          addTemporarySourceAttributes(node.child(index), attributeName),
        ),
      )
    : node.content;
  const sourceKey = node.attrs?.sourceKey;
  const attrs =
    typeof sourceKey === 'string' && sourceKey && !isGeneratedContainerParagraph(node)
      ? {
          ...node.attrs,
          htmlAttrs: {
            ...(node.attrs.htmlAttrs || {}),
            [attributeName]: encodeURIComponent(sourceKey),
          },
        }
      : node.attrs;
  return node.type.create(attrs, content, node.marks);
}

function sameAttributes(left: readonly SourceAttribute[], right: readonly SourceAttribute[]) {
  return (
    left.length === right.length &&
    left.every((attribute, index) => {
      const current = right[index];
      return (
        attribute.name === current.name &&
        attribute.value === current.value &&
        attribute.namespace === current.namespace &&
        attribute.prefix === current.prefix
      );
    })
  );
}

function withoutAttributeRanges(attributes: readonly SourceAttribute[]) {
  return attributes.map(({ sourceRange: _sourceRange, ...attribute }) => attribute);
}

function sourceNodesEqual(left: SourceNode | undefined, right: SourceNode) {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

export function collectRetainedSourceKeys(
  nodes: readonly ProseMirrorNode[],
  before: ProseMirrorNode,
  sourceMap: LunarSourceMap,
  canonicalizeSourceUnitKey?: string,
) {
  const retained = new Set<string>();
  const visit = (node: ProseMirrorNode) => {
    const key = node.attrs?.sourceKey;
    if (canonicalizeSourceUnitKey && key === canonicalizeSourceUnitKey) return;
    if (typeof key === 'string' && key) {
      const range = findLunarSourceElementRange(sourceMap, key);
      const previous = range && before.nodeAt(range.pmFrom);
      if (previous?.eq(node)) {
        retained.add(key);
        return;
      }
    }
    node.forEach(visit);
  };
  nodes.forEach(visit);
  return retained;
}

export function importStructuralChildren(
  sourceDocument: SourceDocument,
  nodes: readonly ProseMirrorNode[],
  parentKey: string,
  canonicalizeSourceUnitKey?: string,
  existingChildKeys: readonly string[] = [],
  retainedSourceKeys: ReadonlySet<string> = new Set(),
) {
  const attributeName = findTemporarySourceAttribute(nodes);
  const keyedNodes = nodes.map((node) => addTemporarySourceAttributes(node, attributeName));
  const html = serializeLunarFragment(Fragment.fromArray(keyedNodes), {
    purpose: 'mutation',
  });
  const imported = parseSourceHtml(html);
  const reserved = new Set<string>();
  const replacements = new Map<string, SourceNode | undefined>();

  const createKey = (kind: string) => createReservedSourceKey(sourceDocument, kind, reserved);

  const convert = (
    importedKey: string,
    nextParentKey: string,
    existingCandidateKey?: string,
    canonicalizeParent = false,
  ): string => {
    const importedNode = getSourceNode(imported, importedKey);
    if (importedNode.kind === 'text') {
      const existingCandidate = existingCandidateKey
        ? sourceDocument.nodes.get(existingCandidateKey)
        : undefined;
      if (
        !canonicalizeParent &&
        existingCandidate?.kind === 'text' &&
        existingCandidate.value === importedNode.value
      ) {
        return existingCandidate.key;
      }
      const key = createKey('text');
      replacements.set(key, {
        key,
        kind: 'text',
        origin: 'inserted',
        originalParentKey: nextParentKey,
        value: importedNode.value,
        originalValue: importedNode.value,
      });
      return key;
    }

    if (importedNode.kind !== 'element') {
      const key = createKey(importedNode.kind);
      replacements.set(key, {
        ...importedNode,
        key,
        origin: 'inserted',
        originalParentKey: nextParentKey,
        sourceRange: undefined,
      });
      return key;
    }

    const sourceKeyAttribute = importedNode.attributes.find(
      (attribute) => attribute.name === attributeName,
    );
    const desiredKey = sourceKeyAttribute
      ? decodeURIComponent(sourceKeyAttribute.value)
      : createKey(importedNode.tagName);
    reserved.add(desiredKey);
    // Boundary sampling can include an unchanged neighbor. Reusing its Source
    // subtree preserves comments and entities absent from the PM projection.
    if (!canonicalizeParent && retainedSourceKeys.has(desiredKey)) return desiredKey;
    const canonicalizeSubtree = canonicalizeParent || desiredKey === canonicalizeSourceUnitKey;
    const cleanAttributes = withoutAttributeRanges(
      importedNode.attributes.filter((attribute) => attribute.name !== attributeName),
    );
    const existing = sourceDocument.nodes.get(desiredKey);
    const reusable =
      existing?.kind === 'element' && existing.tagName === importedNode.tagName
        ? existing
        : undefined;
    const existingChildKeys = reusable?.childKeys || [];
    const childKeys = importedNode.childKeys.map((childKey, index) =>
      convert(childKey, desiredKey, existingChildKeys[index], canonicalizeSubtree),
    );
    const nextNode: SourceElementNode =
      !canonicalizeSubtree && reusable && sameAttributes(reusable.attributes, cleanAttributes)
        ? { ...reusable, childKeys }
        : {
            key: desiredKey,
            kind: 'element',
            origin: 'inserted',
            originalParentKey: nextParentKey,
            tagName: importedNode.tagName,
            namespaceUri: importedNode.namespaceUri,
            attributes: cleanAttributes,
            childKeys,
            originalChildKeys: [...childKeys],
          };
    if (!sourceNodesEqual(sourceDocument.nodes.get(desiredKey), nextNode)) {
      replacements.set(desiredKey, nextNode);
    }
    return desiredKey;
  };

  const root = getSourceParentNode(imported, imported.rootKey);
  return {
    childKeys: root.childKeys.map((key, index) =>
      convert(key, parentKey, existingChildKeys[index]),
    ),
    replacements,
  };
}
