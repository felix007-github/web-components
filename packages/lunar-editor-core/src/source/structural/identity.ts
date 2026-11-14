/** Assign source identities within the affected PM range. */
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { isGeneratedContainerParagraph } from '../../schema/generated-container';
import { createInsertedSourceKey, type SourceDocument } from '../model';

export function createReservedSourceKey(
  document: SourceDocument,
  kind: string,
  reserved: Set<string>,
) {
  const key = createInsertedSourceKey(document, kind, reserved);
  reserved.add(key);
  return key;
}

export function planStructuralSourceKeys(
  doc: ProseMirrorNode,
  sourceDocument: SourceDocument,
  affectedFrom: number,
  affectedTo: number,
) {
  const transform = new Transform(doc);
  const seen = new Set<string>();
  const reserved = new Set<string>();

  doc.descendants((node, position) => {
    const overlapsAffectedRange = position < affectedTo && position + node.nodeSize > affectedFrom;
    if (!overlapsAffectedRange) {
      return false;
    }
    if (node.isText || isGeneratedContainerParagraph(node)) {
      return undefined;
    }
    if (!Object.prototype.hasOwnProperty.call(node.attrs || {}, 'sourceKey')) {
      return undefined;
    }

    const currentKey = typeof node.attrs.sourceKey === 'string' ? node.attrs.sourceKey : '';
    const canRetainKey =
      Boolean(currentKey) && sourceDocument.nodes.has(currentKey) && !seen.has(currentKey);
    if (canRetainKey) {
      seen.add(currentKey);
      return undefined;
    }

    const sourceKey = createReservedSourceKey(sourceDocument, node.type.name, reserved);
    const htmlAttrs = { ...(node.attrs.htmlAttrs || {}) };
    if (currentKey && seen.has(currentKey)) {
      delete htmlAttrs.id;
    }
    transform.setNodeMarkup(
      position,
      node.type,
      {
        ...node.attrs,
        htmlAttrs,
        sourceKey,
      },
      node.marks,
    );
    seen.add(sourceKey);
    return undefined;
  });

  return transform;
}
