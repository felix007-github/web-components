/** Locate source-backed blocks, their stable parent and replacement boundaries. */
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import { findSourceParentKey, type SourceDocument } from '../model';
import { findLunarSourceElementRange, type LunarSourceMap } from '../source-map';
import type { StructuralTransactionCompileFailure } from './types';

type ChildPosition = {
  index: number;
  node: ProseMirrorNode;
  from: number;
  to: number;
};

function collectChangedOldPositions(transaction: Transaction) {
  const positions = new Set<number>();
  transaction.steps.forEach((step) => {
    step.getMap().forEach((oldFrom, oldTo) => {
      const samples =
        oldFrom < oldTo
          ? [oldFrom - 1, oldFrom, oldFrom + 1, oldTo - 1, oldTo, oldTo + 1]
          : [oldFrom - 1, oldFrom, oldFrom + 1];
      samples.forEach((position) => {
        positions.add(Math.max(0, Math.min(position, transaction.before.content.size)));
      });
    });
  });
  return Array.from(positions);
}

function findClosestSourceBlockKey(doc: ProseMirrorNode, position: number) {
  const resolved = doc.resolve(position);
  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const node = resolved.node(depth);
    const sourceKey = node.attrs?.sourceKey;
    if (node.isBlock && typeof sourceKey === 'string' && sourceKey) {
      return sourceKey;
    }
  }
  return undefined;
}

function findProjectedNodeBySourceKey(doc: ProseMirrorNode, sourceKey: string) {
  let result: ProseMirrorNode | undefined;
  doc.descendants((node) => {
    if (result) return false;
    if (node.attrs?.sourceKey === sourceKey) {
      result = node;
      return false;
    }
    return undefined;
  });
  return result;
}

function getSourceAncestorPath(document: SourceDocument, key: string) {
  const path = [key];
  let current = key;
  while (current !== document.rootKey) {
    const parent = findSourceParentKey(document, current);
    if (!parent) {
      return [];
    }
    path.unshift(parent);
    current = parent;
  }
  return path;
}

function sameOwnBlockContent(before: ProseMirrorNode, after: ProseMirrorNode): boolean {
  if (before === after) {
    return true;
  }
  if (!before.sameMarkup(after)) {
    return false;
  }
  if (before.isLeaf || after.isLeaf) {
    return before.eq(after);
  }
  // Nested source blocks are handled by their own affected ranges (including
  // blocks between the sampled boundaries of a deletion). Retain generated
  // paragraphs, which represent this block's own inline content.
  const isOwnContent = (node: ProseMirrorNode) => !node.isBlock || !node.attrs?.sourceKey;
  const beforeChildren = before.content.content.filter(isOwnContent);
  const afterChildren = after.content.content.filter(isOwnContent);
  if (beforeChildren.length !== afterChildren.length) {
    return false;
  }
  for (let index = 0; index < beforeChildren.length; index += 1) {
    if (!sameOwnBlockContent(beforeChildren[index], afterChildren[index])) {
      return false;
    }
  }
  return true;
}

function removeUnchangedAffectedAncestors(
  transaction: Transaction,
  document: SourceDocument,
  affectedKeys: readonly string[],
) {
  // Boundary samples may resolve to an unchanged wrapper around the actual edit.
  return affectedKeys.filter((key) => {
    const isAncestorOfAffectedNode = affectedKeys.some(
      (candidate) => candidate !== key && getSourceAncestorPath(document, candidate).includes(key),
    );
    if (!isAncestorOfAffectedNode) {
      return true;
    }

    const beforeNode = findProjectedNodeBySourceKey(transaction.before, key);
    const afterNode = findProjectedNodeBySourceKey(transaction.doc, key);
    // Matching wrapper attributes alone do not mean it is unchanged: a batch
    // can edit the ancestor's own text as well as a nested affected block.
    return !beforeNode || !afterNode || !sameOwnBlockContent(beforeNode, afterNode);
  });
}

function findStableParentKey(document: SourceDocument, affectedKeys: readonly string[]) {
  const parentPaths = affectedKeys.map((key) => {
    const parent = findSourceParentKey(document, key);
    return parent ? getSourceAncestorPath(document, parent) : [];
  });
  if (parentPaths.some((path) => !path.length)) {
    return undefined;
  }
  const shortestLength = Math.min(...parentPaths.map((path) => path.length));
  let stableParent = document.rootKey;
  for (let index = 0; index < shortestLength; index += 1) {
    const candidate = parentPaths[0][index];
    if (parentPaths.every((path) => path[index] === candidate)) {
      stableParent = candidate;
    } else {
      break;
    }
  }
  return stableParent;
}

function findDirectChildUnderParent(
  document: SourceDocument,
  parentKey: string,
  descendantKey: string,
) {
  let current = descendantKey;
  while (current !== parentKey) {
    const parent = findSourceParentKey(document, current);
    if (!parent) {
      return undefined;
    }
    if (parent === parentKey) {
      return current;
    }
    current = parent;
  }
  return undefined;
}

export function findProjectedParent(
  doc: ProseMirrorNode,
  sourceDocument: SourceDocument,
  parentKey: string,
) {
  if (parentKey === sourceDocument.rootKey) {
    return { node: doc, contentFrom: 0 };
  }
  let result: { node: ProseMirrorNode; contentFrom: number } | undefined;
  doc.descendants((node, position) => {
    if (result) return false;
    if (node.attrs?.sourceKey === parentKey) {
      result = { node, contentFrom: position + 1 };
      return false;
    }
    return undefined;
  });
  return result;
}

export function collectDirectChildPositions(parent: ProseMirrorNode, contentFrom: number) {
  const children: ChildPosition[] = [];
  parent.forEach((node, offset, index) => {
    const from = contentFrom + offset;
    children.push({ index, node, from, to: from + node.nodeSize });
  });
  return children;
}

export function selectReplacementChildren(
  children: readonly ChildPosition[],
  newFrom: number,
  newTo: number,
  affectedKeys: ReadonlySet<string>,
) {
  const selectedIndexes = children
    .filter(
      (child) =>
        (child.from < newTo && child.to > newFrom) || affectedKeys.has(child.node.attrs?.sourceKey),
    )
    .map((child) => child.index);
  if (!selectedIndexes.length) {
    return [];
  }
  const first = Math.min(...selectedIndexes);
  const last = Math.max(...selectedIndexes);
  return children.slice(first, last + 1).map((child) => child.node);
}

export function getContiguousChildRange(
  children: readonly ChildPosition[],
  sourceKeys: ReadonlySet<string>,
) {
  const indexes = children
    .filter((child) => sourceKeys.has(child.node.attrs?.sourceKey))
    .map((child) => child.index);
  if (!indexes.length) {
    return undefined;
  }
  const first = Math.min(...indexes);
  const last = Math.max(...indexes);
  return {
    from: children[first].from,
    to: children[last].to,
    nodes: children.slice(first, last + 1).map((child) => child.node),
  };
}

type StructuralRangePlan = {
  kind: 'planned';
  stableParentKey: string;
  directAffectedKeys: Set<string>;
  newFrom: number;
  newTo: number;
};

export function planStructuralRange(
  transaction: Transaction,
  sourceDocument: SourceDocument,
  sourceMap: LunarSourceMap,
  canonicalizeSourceUnitKey?: string,
):
  | StructuralRangePlan
  | ({ kind: 'unsupported'; transaction: Transaction } & StructuralTransactionCompileFailure) {
  const affectedSourceKeys = canonicalizeSourceUnitKey
    ? new Set([canonicalizeSourceUnitKey])
    : new Set(
        removeUnchangedAffectedAncestors(
          transaction,
          sourceDocument,
          Array.from(
            new Set(
              collectChangedOldPositions(transaction)
                .map((position) => findClosestSourceBlockKey(transaction.before, position))
                .filter((key): key is string => Boolean(key && sourceDocument.nodes.has(key))),
            ),
          ),
        ),
      );
  if (!affectedSourceKeys.size) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-range-not-found',
      message: 'No source-backed block contains the structural transaction.',
    };
  }

  const stableParentKey = findStableParentKey(sourceDocument, Array.from(affectedSourceKeys));
  if (!stableParentKey) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-parent-not-found',
      message: 'The affected source blocks have no stable common parent.',
    };
  }

  const directAffectedKeys = new Set(
    Array.from(affectedSourceKeys)
      .map((key) => findDirectChildUnderParent(sourceDocument, stableParentKey, key))
      .filter((key): key is string => Boolean(key)),
  );
  const oldRanges = Array.from(directAffectedKeys)
    .map((key) => findLunarSourceElementRange(sourceMap, key))
    .filter((range): range is NonNullable<typeof range> => Boolean(range));
  if (!oldRanges.length) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-range-not-found',
      message: 'The stable source children have no ProseMirror ranges.',
    };
  }

  const oldFrom = Math.min(...oldRanges.map((range) => range.pmFrom));
  const oldTo = Math.max(...oldRanges.map((range) => range.pmTo));
  const newFrom = transaction.mapping.map(oldFrom, -1);
  const newTo = transaction.mapping.map(oldTo, 1);
  return { kind: 'planned', stableParentKey, directAffectedKeys, newFrom, newTo };
}
