/** Preserve text and node selection intent across structural normalization. */
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { NodeSelection, TextSelection, type Transaction } from 'prosemirror-state';

type IntendedNodeSelection = {
  from: number;
  nodeType: string;
  sourceKey?: string;
};

type IntendedTextSelectionPoint = {
  fallbackPosition: number;
  offset: number;
  sourceKey?: string;
};

type IntendedTextSelection = {
  anchor: IntendedTextSelectionPoint;
  head: IntendedTextSelectionPoint;
};

function findNodeSelectionPosition(doc: ProseMirrorNode, intended: IntendedNodeSelection) {
  if (intended.sourceKey) {
    let position: number | undefined;
    doc.descendants((node, offset) => {
      if (position !== undefined) return false;
      if (node.type.name === intended.nodeType && node.attrs?.sourceKey === intended.sourceKey) {
        position = offset;
        return false;
      }
      return undefined;
    });
    if (position !== undefined) {
      return position;
    }
  }

  const node = doc.nodeAt(intended.from);
  return node?.type.name === intended.nodeType ? intended.from : undefined;
}

export function restoreNodeSelection(
  transaction: Transaction,
  intended: IntendedNodeSelection | undefined,
) {
  if (!intended) {
    return;
  }
  const position = findNodeSelectionPosition(transaction.doc, intended);
  const node = position === undefined ? undefined : transaction.doc.nodeAt(position);
  if (position !== undefined && node && NodeSelection.isSelectable(node)) {
    transaction.setSelection(NodeSelection.create(transaction.doc, position));
  }
}

function captureTextSelectionPoint(
  doc: ProseMirrorNode,
  position: number,
): IntendedTextSelectionPoint {
  const fallbackPosition = Math.max(0, Math.min(position, doc.content.size));
  const resolved = doc.resolve(fallbackPosition);
  const inlineBefore = resolved.nodeBefore;
  const inlineSourceKey = inlineBefore?.attrs?.sourceKey;
  if (
    inlineBefore?.isInline &&
    inlineBefore.content.size > 0 &&
    typeof inlineSourceKey === 'string' &&
    inlineSourceKey
  ) {
    return {
      fallbackPosition,
      offset: inlineBefore.content.size,
      sourceKey: inlineSourceKey,
    };
  }
  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const sourceKey = resolved.node(depth).attrs?.sourceKey;
    if (typeof sourceKey === 'string' && sourceKey) {
      return {
        fallbackPosition,
        offset: fallbackPosition - resolved.start(depth),
        sourceKey,
      };
    }
  }
  return {
    fallbackPosition,
    offset: 0,
  };
}

export function captureTextSelection(
  doc: ProseMirrorNode,
  selection: TextSelection,
): IntendedTextSelection {
  return {
    anchor: captureTextSelectionPoint(doc, selection.anchor),
    head: captureTextSelectionPoint(doc, selection.head),
  };
}

function findTextSelectionPosition(doc: ProseMirrorNode, intended: IntendedTextSelectionPoint) {
  if (intended.sourceKey) {
    let position: number | undefined;
    doc.descendants((node, offset) => {
      if (position !== undefined) return false;
      if (node.attrs?.sourceKey === intended.sourceKey) {
        const contentFrom = offset + 1;
        position = contentFrom + Math.min(intended.offset, node.content.size);
        return false;
      }
      return undefined;
    });
    if (position !== undefined) {
      return position;
    }
  }
  return Math.max(0, Math.min(intended.fallbackPosition, doc.content.size));
}

export function restoreTextSelection(
  transaction: Transaction,
  intended: IntendedTextSelection | undefined,
) {
  if (!intended) {
    return;
  }
  const anchor = transaction.doc.resolve(
    findTextSelectionPosition(transaction.doc, intended.anchor),
  );
  const head = transaction.doc.resolve(findTextSelectionPosition(transaction.doc, intended.head));
  transaction.setSelection(TextSelection.between(anchor, head, anchor.pos <= head.pos ? 1 : -1));
}
