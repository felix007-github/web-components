import type { Node as ProseMirrorNode } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import {
  getSourceNode,
  isSourceParentNode,
  type SourceDocument,
} from './model';
import type { LunarSourceMap } from './source-map';
import {
  compileSourceStructuralTransaction,
  type StructuralTransactionCompileResult,
} from './structural-compiler';

const sourceUnitNodeTypes = new Set([
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'heading_4',
  'heading_5',
  'heading_6',
  'list_item',
  'table_cell',
  'table_header',
]);

const sourceUnitTags = new Set([
  'p',
  'para',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'td',
  'th',
  'span',
]);

export type LunarSourceUnit = {
  sourceKey: string;
  nodeType: string;
  pmFrom: number;
  pmTo: number;
};

export type SourceUnitTransactionCompileFailure = {
  code: 'source-unit-not-applicable' | 'source-unit-not-canonicalizable';
  message: string;
};

export type SourceUnitTransactionCompileResult =
  | StructuralTransactionCompileResult
  | ({
      kind: 'unsupported';
      transaction: Transaction;
    } & SourceUnitTransactionCompileFailure);

export type SourceUnitTransactionCompileOptions = {
  operationId?: string;
};

function findSourceUnitAtPosition(
  doc: ProseMirrorNode,
  position: number
): LunarSourceUnit | undefined {
  const safePosition = Math.max(0, Math.min(position, doc.content.size));
  const directNode = doc.nodeAt(safePosition);
  const directSourceKey = directNode?.attrs?.sourceKey;
  if (
    directNode &&
    (sourceUnitNodeTypes.has(directNode.type.name) ||
      directNode.type.spec.sourceUnit === true) &&
    typeof directSourceKey === 'string' &&
    directSourceKey
  ) {
    return {
      sourceKey: directSourceKey,
      nodeType: directNode.type.name,
      pmFrom: safePosition,
      pmTo: safePosition + directNode.nodeSize,
    };
  }

  const resolved = doc.resolve(safePosition);
  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const node = resolved.node(depth);
    if (node.type.spec.sourceUnitBoundary === true) return undefined;
    const sourceKey = node.attrs?.sourceKey;
    if (
      (sourceUnitNodeTypes.has(node.type.name) ||
        node.type.spec.sourceUnit === true) &&
      typeof sourceKey === 'string' &&
      sourceKey
    ) {
      const pmFrom = resolved.before(depth);
      return {
        sourceKey,
        nodeType: node.type.name,
        pmFrom,
        pmTo: pmFrom + node.nodeSize,
      };
    }
  }
  return undefined;
}

function collectRangeSourceUnits(
  doc: ProseMirrorNode,
  from: number,
  to: number,
  units: Map<string, LunarSourceUnit>
) {
  const positions = from === to ? [from] : [from, Math.max(from, to - 1)];
  for (const position of positions) {
    const unit = findSourceUnitAtPosition(doc, position);
    if (!unit) {
      return false;
    }
    units.set(unit.sourceKey, unit);
  }
  return true;
}

export function findChangedLunarSourceUnit(
  transaction: Transaction
): LunarSourceUnit | undefined {
  const units = new Map<string, LunarSourceUnit>();
  let hasMappedChange = false;
  let allRangesAreInsideSourceUnits = true;

  transaction.steps.forEach((step, index) => {
    const before = transaction.docs[index] || transaction.before;
    const after = transaction.docs[index + 1] || transaction.doc;
    step.getMap().forEach((oldFrom, oldTo, newFrom, newTo) => {
      hasMappedChange = true;
      allRangesAreInsideSourceUnits =
        collectRangeSourceUnits(before, oldFrom, oldTo, units) &&
        collectRangeSourceUnits(after, newFrom, newTo, units) &&
        allRangesAreInsideSourceUnits;
    });
  });

  if (!hasMappedChange || !allRangesAreInsideSourceUnits || units.size !== 1) {
    return undefined;
  }
  return units.values().next().value;
}

function canCanonicalizeSourceUnit(
  document: SourceDocument,
  sourceKey: string
) {
  const root = document.nodes.get(sourceKey);
  if (root?.kind !== 'element' || !sourceUnitTags.has(root.tagName)) {
    return false;
  }

  const visited = new Set<string>();
  const pending = [sourceKey];
  while (pending.length) {
    const key = pending.pop()!;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    const node = getSourceNode(document, key);
    if (node.kind === 'comment' || node.kind === 'doctype') {
      return false;
    }
    if (isSourceParentNode(node)) {
      pending.push(...node.childKeys);
    }
  }
  return true;
}

export function compileSourceUnitTransaction(
  transaction: Transaction,
  sourceDocument: SourceDocument,
  sourceMap: LunarSourceMap,
  options: SourceUnitTransactionCompileOptions = {}
): SourceUnitTransactionCompileResult {
  const sourceUnit = findChangedLunarSourceUnit(transaction);
  if (!sourceUnit || !sourceDocument.nodes.has(sourceUnit.sourceKey)) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'source-unit-not-applicable',
      message: 'The transaction is not contained by one supported SourceUnit.',
    };
  }
  if (!canCanonicalizeSourceUnit(sourceDocument, sourceUnit.sourceKey)) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'source-unit-not-canonicalizable',
      message: `SourceUnit ${sourceUnit.sourceKey} contains source-only nodes.`,
    };
  }

  return compileSourceStructuralTransaction(
    transaction,
    sourceDocument,
    sourceMap,
    {
      canonicalizeSourceUnitKey: sourceUnit.sourceKey,
      operationId: options.operationId,
    }
  );
}
