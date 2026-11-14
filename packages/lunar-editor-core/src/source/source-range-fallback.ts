import type { Slice } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import { ReplaceStep, type Step } from 'prosemirror-transform';
import { projectLunarSourceDocument } from '../schema/index';
import { getSourceNode, type SourceDocument } from './model';
import {
  applySourceMutationBatch,
  createReplaceTextMutation,
  createSourceMutationBatch,
} from './mutation';
import {
  findLunarSourceElementRange,
  getLunarSourceTextSpansInRange,
  replaceLunarSourceMapSubtree,
  type LunarSourceMap,
  type LunarSourceTextSpan,
} from './source-map';
import {
  getSourceMutationSteps,
  SourceMutationStep,
} from './source-mutation-step';
import { collectSourceSubtreeKeys, createSourceSubtreeProjectionDocument } from './scoped-projection';

export type SourceRangeFallbackFailure = {
  code:
    | 'ambiguous-text-position'
    | 'multiple-document-steps'
    | 'non-text-replacement'
    | 'source-map-stale'
    | 'source-projection-mismatch'
    | 'source-text-mismatch'
    | 'unsupported-document-step'
    | 'unmapped-text-range';
  message: string;
};

export type SourceRangeFallbackResult =
  | { kind: 'compiled'; transaction: Transaction; operationId: string }
  | { kind: 'skipped'; transaction: Transaction }
  | ({ kind: 'unsupported'; transaction: Transaction } & SourceRangeFallbackFailure);

type DocumentStepRange = {
  oldFrom: number;
  oldTo: number;
  newFrom: number;
  newTo: number;
};

function getDocumentStepRanges(step: Step) {
  const ranges: DocumentStepRange[] = [];
  step.getMap().forEach((oldFrom, oldTo, newFrom, newTo) => {
    ranges.push({ oldFrom, oldTo, newFrom, newTo });
  });
  return ranges;
}

function getPlainText(slice: Slice) {
  if (slice.openStart || slice.openEnd) {
    return undefined;
  }
  let isPlainText = true;
  slice.content.descendants((node) => {
    if (!node.isText || node.marks.length) {
      isPlainText = false;
      return false;
    }
    return undefined;
  });
  if (!isPlainText) {
    return undefined;
  }
  const value = slice.content.textBetween(0, slice.content.size, '', '');
  return value.length === slice.content.size ? value : undefined;
}

function chooseTextSpan(
  sourceMap: LunarSourceMap,
  from: number,
  to: number,
): LunarSourceTextSpan | SourceRangeFallbackFailure {
  const candidates = getLunarSourceTextSpansInRange(sourceMap, from, to).filter((span) => (
    span.exact && span.pmFrom <= from && to <= span.pmTo
  ));
  if (!candidates.length) {
    return {
      code: 'unmapped-text-range',
      message: `No exact source text span contains ProseMirror range ${from}:${to}.`,
    };
  }

  const interiorCandidates = from === to
    ? candidates.filter((span) => span.pmFrom < from && from < span.pmTo)
    : candidates;
  const preferred = interiorCandidates.length ? interiorCandidates : candidates;
  const sourceKeys = new Set(preferred.map((span) => span.sourceKey));
  if (sourceKeys.size > 1) {
    return {
      code: 'ambiguous-text-position',
      message: `ProseMirror position ${from} belongs to multiple source text nodes.`,
    };
  }

  return [...preferred].sort((left, right) => (
    left.pmTo - left.pmFrom - (right.pmTo - right.pmFrom)
  ))[0];
}

function isCompileFailure(
  value: LunarSourceTextSpan | SourceRangeFallbackFailure,
): value is SourceRangeFallbackFailure {
  return 'code' in value;
}

function retainEmptyTextAnchor(
  sourceMap: LunarSourceMap,
  document: SourceDocument,
  sourceKey: string,
  sourceOffset: number,
  pmPosition: number,
): LunarSourceMap {
  const sourceNode = getSourceNode(document, sourceKey);
  if (
    sourceNode.kind !== 'text' ||
    sourceNode.value.length ||
    sourceMap.textSpans.some((span) => span.sourceKey === sourceKey)
  ) {
    return sourceMap;
  }
  return {
    ...sourceMap,
    textSpans: [
      ...sourceMap.textSpans,
      {
        sourceKey,
        sourceFrom: sourceOffset,
        sourceTo: sourceOffset,
        pmFrom: pmPosition,
        pmTo: pmPosition,
        exact: true,
      },
    ].sort((left, right) => (
      left.pmFrom - right.pmFrom ||
      left.pmTo - right.pmTo ||
      left.sourceFrom - right.sourceFrom
    )),
  };
}

/**
 * Narrow compatibility path for plain-text edits that cannot safely own a
 * SourceUnit (for example text separated by a source-only HTML comment or
 * direct text inside a review wrapper). It never maintains a second, partial
 * projection state. A source-backed block is projected with its parser context
 * and must equal the resulting PM subtree. If no local scope is sufficient,
 * the complete source projection remains the final correctness check.
 */
export function compileSourceRangeFallback(
  transaction: Transaction,
  sourceDocument: SourceDocument,
  sourceMap: LunarSourceMap,
): SourceRangeFallbackResult {
  if (!transaction.docChanged || getSourceMutationSteps(transaction.steps).length) {
    return { kind: 'skipped', transaction };
  }
  if (sourceMap.sourceRevision !== sourceDocument.revision) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'source-map-stale',
      message: 'The ProseMirror source map does not match the current source revision.',
    };
  }

  const documentSteps = transaction.steps
    .map((step) => ({ step, ranges: getDocumentStepRanges(step) }))
    .filter(({ ranges }) => ranges.length);
  if (documentSteps.length !== 1) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'multiple-document-steps',
      message: `Expected one document-changing step but found ${documentSteps.length}.`,
    };
  }

  const [{ step, ranges }] = documentSteps;
  if (!(step instanceof ReplaceStep) || ranges.length !== 1) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'unsupported-document-step',
      message: `Source range fallback does not support ${step.constructor.name}.`,
    };
  }

  const insertedText = getPlainText(step.slice);
  if (insertedText === undefined) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'non-text-replacement',
      message: 'The replacement slice contains non-text content.',
    };
  }

  const [range] = ranges;
  const span = chooseTextSpan(sourceMap, range.oldFrom, range.oldTo);
  if (isCompileFailure(span)) {
    return { kind: 'unsupported', transaction, ...span };
  }

  const sourceFrom = span.sourceFrom + range.oldFrom - span.pmFrom;
  const sourceTo = span.sourceFrom + range.oldTo - span.pmFrom;
  const sourceNode = getSourceNode(sourceDocument, span.sourceKey);
  const pmText = transaction.before.textBetween(range.oldFrom, range.oldTo, '', '');
  if (
    sourceNode.kind !== 'text' ||
    sourceNode.value.slice(sourceFrom, sourceTo) !== pmText ||
    transaction.doc.textBetween(range.newFrom, range.newTo, '', '') !== insertedText
  ) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'source-text-mismatch',
      message: `ProseMirror text does not match source text ${span.sourceKey}.`,
    };
  }

  const mutation = createReplaceTextMutation(
    sourceDocument,
    span.sourceKey,
    sourceFrom,
    sourceTo,
    insertedText,
  );
  const forward = createSourceMutationBatch([mutation]);
  const applied = applySourceMutationBatch(sourceDocument, forward);
  const localSourceMap = projectTextScope(
    transaction, applied.document, sourceMap, span.sourceKey, range,
    sourceFrom + insertedText.length,
  );
  if (localSourceMap) {
    transaction.step(new SourceMutationStep(forward, applied.inverse, localSourceMap, sourceMap));
    return { kind: 'compiled', transaction, operationId: forward.operationId };
  }
  const projection = projectLunarSourceDocument(applied.document, transaction.doc.type.schema);
  if (!projection.doc.eq(transaction.doc)) {
    return {
      kind: 'unsupported',
      transaction,
      code: 'source-projection-mismatch',
      message: 'The source range mutation does not reproduce the resulting ProseMirror document.',
    };
  }
  const nextSourceMap = retainEmptyTextAnchor(
    projection.sourceMap,
    applied.document,
    span.sourceKey,
    sourceFrom + insertedText.length,
    range.newFrom,
  );

  transaction.step(new SourceMutationStep(
    forward,
    applied.inverse,
    nextSourceMap,
    sourceMap,
  ));
  return {
    kind: 'compiled',
    transaction,
    operationId: forward.operationId,
  };
}

function projectTextScope(
  transaction: Transaction,
  document: SourceDocument,
  sourceMap: LunarSourceMap,
  textKey: string,
  range: DocumentStepRange,
  sourceOffset: number,
): LunarSourceMap | undefined {
  const resolved = transaction.before.resolve(range.oldFrom);
  for (let depth = resolved.depth; depth > 0; depth--) {
    const before = resolved.node(depth);
    const sourceKey = before.attrs?.sourceKey;
    // Inline scopes can change whitespace handling in their surrounding block.
    if (!before.isBlock || typeof sourceKey !== 'string' || !sourceKey) continue;
    if (range.oldTo > resolved.end(depth)) continue;
    const keys = collectSourceSubtreeKeys(document, [sourceKey]);
    if (!keys.has(textKey)) continue;
    const scopedDocument = createSourceSubtreeProjectionDocument(document, sourceKey);
    if (!scopedDocument) continue;
    const projection = projectLunarSourceDocument(scopedDocument, transaction.doc.type.schema);
    const projectedRange = findLunarSourceElementRange(projection.sourceMap, sourceKey);
    if (!projectedRange) continue;
    const position = transaction.mapping.map(resolved.before(depth), 1);
    const current = transaction.doc.nodeAt(position);
    const projected = projection.doc.nodeAt(projectedRange.pmFrom);
    if (!current || !projected || !current.eq(projected)) continue;
    const offset = position - projectedRange.pmFrom;
    const projectedMap = retainEmptyTextAnchor(
      projection.sourceMap, document, textKey, sourceOffset, range.newFrom - offset,
    );
    return replaceLunarSourceMapSubtree(
      sourceMap, transaction.mapping, transaction.doc, document, projectedMap,
      keys, keys, offset, { deferUnchangedMapping: true },
    );
  }
  return undefined;
}
