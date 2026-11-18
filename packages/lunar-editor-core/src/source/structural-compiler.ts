/** Coordinate structural compilation; stage helpers live in ./structural. */
import { NodeSelection, TextSelection, type Transaction } from 'prosemirror-state';
import { isGeneratedContainerParagraph } from '../schema/generated-container';
import { getSourceParentNode, type SourceDocument } from './model';
import { applySourceMutationBatchWithCleanup, createReplaceNodesMutation, createSourceMutationBatch } from './mutation';
import { replaceLunarSourceMapSubtree, type LunarSourceMap } from './source-map';
import { SourceMutationStep } from './source-mutation-step';
import { collectSourceSubtreeKeys } from './scoped-projection';
import { planStructuralSourceKeys } from './structural/identity';
import { collectRetainedSourceKeys, importStructuralChildren } from './structural/import';
import { projectStructuralScope } from './structural/projection';
import { planStructuralRange, findProjectedParent, collectDirectChildPositions, selectReplacementChildren } from './structural/range';
import { captureTextSelection, restoreNodeSelection, restoreTextSelection } from './structural/selection';
import type { StructuralTransactionCompileOptions, StructuralTransactionCompileResult } from './structural/types';
export type { StructuralTransactionCompileFailure, StructuralTransactionCompileOptions, StructuralTransactionCompileResult } from './structural/types';

export function compileSourceStructuralTransaction(
  transaction: Transaction,
  sourceDocument: SourceDocument,
  sourceMap: LunarSourceMap,
  options: StructuralTransactionCompileOptions = {},
): StructuralTransactionCompileResult {
  const range = planStructuralRange(transaction, sourceDocument, sourceMap, options.canonicalizeSourceUnitKey);
  if (range.kind === 'unsupported') return range;
  const { stableParentKey, directAffectedKeys, newFrom, newTo } = range;
  const identityTransform = planStructuralSourceKeys(transaction.doc, sourceDocument, newFrom, newTo);
  const intendedNodeSelection =
    transaction.selection instanceof NodeSelection
      ? {
          from: transaction.selection.from,
          nodeType: transaction.selection.node.type.name,
          sourceKey: identityTransform.doc.nodeAt(transaction.selection.from)?.attrs?.sourceKey || undefined,
        }
      : undefined;
  // Capture intent before source projection can replace a subtree. Mapping
  // through that replacement loses positions inside surviving source nodes.
  const mappedTextSelection = transaction.selection instanceof TextSelection ? transaction.selection.map(identityTransform.doc, identityTransform.mapping) : undefined;
  const intendedTextSelection = mappedTextSelection instanceof TextSelection ? captureTextSelection(identityTransform.doc, mappedTextSelection) : undefined;
  const normalizedDoc = identityTransform.doc;
  const projectedParent = findProjectedParent(normalizedDoc, sourceDocument, stableParentKey);
  if (!projectedParent) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-parent-not-found',
      message: `Stable source parent ${stableParentKey} is not present after the transaction.`,
    };
  }

  const projectedParentChildren = collectDirectChildPositions(projectedParent.node, projectedParent.contentFrom);
  const projectedDirectSourceKeys = new Set(
    projectedParentChildren.map(child => child.node.attrs?.sourceKey).filter((key): key is string => typeof key === 'string' && Boolean(key)),
  );
  const rebuildGeneratedContainerParent =
    projectedParentChildren.some(child => isGeneratedContainerParagraph(child.node)) && Array.from(directAffectedKeys).some(key => !projectedDirectSourceKeys.has(key));
  const replacementChildren = rebuildGeneratedContainerParent
    ? projectedParentChildren.map(child => child.node)
    : selectReplacementChildren(projectedParentChildren, newFrom, newTo, directAffectedKeys);
  const sourceParent = getSourceParentNode(sourceDocument, stableParentKey);
  const imported = importStructuralChildren(
    sourceDocument,
    replacementChildren,
    stableParentKey,
    options.canonicalizeSourceUnitKey,
    rebuildGeneratedContainerParent ? sourceParent.childKeys : [],
    collectRetainedSourceKeys(replacementChildren, transaction.before, sourceMap, options.canonicalizeSourceUnitKey),
  );
  const affectedIndexes = rebuildGeneratedContainerParent
    ? sourceParent.childKeys.map((_key, index) => index)
    : Array.from(directAffectedKeys)
        .map(key => sourceParent.childKeys.indexOf(key))
        .filter(index => index >= 0);
  if (!affectedIndexes.length) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-range-not-found',
      message: 'The affected source children are no longer attached to their stable parent.',
    };
  }
  const firstIndex = Math.min(...affectedIndexes);
  const lastIndex = Math.max(...affectedIndexes);
  const nextParent = {
    ...sourceParent,
    childKeys: [...sourceParent.childKeys.slice(0, firstIndex), ...imported.childKeys, ...sourceParent.childKeys.slice(lastIndex + 1)],
  };
  imported.replacements.set(stableParentKey, nextParent);
  const previousSubtreeKeys = collectSourceSubtreeKeys(sourceDocument, directAffectedKeys);
  const replaceNodes = createReplaceNodesMutation(
    sourceDocument,
    Array.from(imported.replacements, ([key, value]) => ({ key, value })),
  );
  const applied = applySourceMutationBatchWithCleanup(sourceDocument, createSourceMutationBatch([replaceNodes], options.operationId));
  const { forward } = applied;
  const nextSubtreeKeys = collectSourceSubtreeKeys(applied.document, imported.childKeys);
  const scoped = projectStructuralScope(identityTransform, applied.document, stableParentKey, directAffectedKeys, imported.childKeys, rebuildGeneratedContainerParent);
  if (!scoped) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'structural-projection-mismatch',
      message: 'The reconstructed source subtree does not match the affected ProseMirror range.',
    };
  }

  identityTransform.steps.forEach(step => transaction.step(step));
  const nextSourceMap = replaceLunarSourceMapSubtree(
    sourceMap,
    transaction.mapping,
    transaction.doc,
    applied.document,
    scoped.projection.sourceMap,
    previousSubtreeKeys,
    nextSubtreeKeys,
    scoped.positionOffset,
    { deferUnchangedMapping: true },
  );
  transaction.step(new SourceMutationStep(forward, applied.inverse, nextSourceMap, sourceMap));
  restoreNodeSelection(transaction, intendedNodeSelection);
  restoreTextSelection(transaction, intendedTextSelection);
  return {
    kind: 'compiled',
    transaction,
    operationId: forward.operationId,
  };
}
