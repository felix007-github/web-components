import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { Mapping, StepMap } from 'prosemirror-transform';
import {
  getSourceNode,
  isSourceParentNode,
  type SourceDocument,
  type SourceTextNode,
} from './model';
import type { SourceDomTextBinding } from './dom-projection';

export type LunarSourceElementRange = {
  sourceKey: string;
  nodeType: string;
  pmFrom: number;
  pmTo: number;
  positionRevision?: number;
};

export type LunarSourceTextSpan = {
  sourceKey: string;
  sourceFrom: number;
  sourceTo: number;
  pmFrom: number;
  pmTo: number;
  exact: boolean;
  positionRevision?: number;
};

export type LunarSourcePositionMap = {
  ranges: readonly number[];
};

export type LunarSourceMapSubtreeReplacement = {
  replacedSourceKeys: readonly string[];
  elements: readonly LunarSourceElementRange[];
  textSpans: readonly LunarSourceTextSpan[];
  diagnostics: readonly LunarSourceMapDiagnostic[];
};

export type LunarSourceMapDiagnostic = {
  code: 'invalid-text-binding' | 'unmapped-text-boundary';
  sourceKey: string;
  message: string;
};

export type LunarSourceMap = {
  sourceRevision: number;
  mapRevision: number;
  elements: readonly LunarSourceElementRange[];
  textSpans: readonly LunarSourceTextSpan[];
  diagnostics: readonly LunarSourceMapDiagnostic[];
  positionMaps?: readonly LunarSourcePositionMap[];
  subtreeReplacements?: readonly LunarSourceMapSubtreeReplacement[];
};

export type SourceTextPositionReference = {
  sourceKey: string;
  sourceOffset: number;
  position: {
    node: Text;
    offset: number;
    pos?: number;
  };
};

export type SourceTextPositionReferences = {
  findPositions: Array<SourceTextPositionReference['position']>;
  references: readonly SourceTextPositionReference[];
  diagnostics: readonly LunarSourceMapDiagnostic[];
};

function requireSourceTextNode(document: SourceDocument, sourceKey: string) {
  const node = getSourceNode(document, sourceKey);
  return node.kind === 'text' ? node : undefined;
}

export function createSourceTextPositionReferences(
  document: SourceDocument,
  bindings: readonly SourceDomTextBinding[],
): SourceTextPositionReferences {
  const references: SourceTextPositionReference[] = [];
  const diagnostics: LunarSourceMapDiagnostic[] = [];

  for (const binding of bindings) {
    const sourceText = requireSourceTextNode(document, binding.sourceKey);
    if (!sourceText || sourceText.value !== binding.node.data) {
      diagnostics.push({
        code: 'invalid-text-binding',
        sourceKey: binding.sourceKey,
        message: `DOM text no longer matches source text ${binding.sourceKey}.`,
      });
      continue;
    }
    references.push({
      sourceKey: binding.sourceKey,
      sourceOffset: 0,
      position: { node: binding.node, offset: 0 },
    });
  }

  return {
    // ProseMirror scans the complete findPositions array at every DOM parsing
    // point. Large legal documents can contain tens of thousands of whitespace
    // boundaries, turning initialization into quadratic work. Text positions
    // are aligned locally against the parsed document below instead.
    findPositions: [],
    references,
    diagnostics,
  };
}

function collectElementRanges(doc: ProseMirrorNode) {
  const elements: LunarSourceElementRange[] = [];
  doc.descendants((node, position) => {
    const sourceKey = node.attrs?.sourceKey;
    if (typeof sourceKey === 'string' && sourceKey) {
      elements.push({
        sourceKey,
        nodeType: node.type.name,
        pmFrom: position,
        pmTo: position + node.nodeSize,
      });
    }
  });
  return elements;
}

function mapElementRanges(
  elements: readonly LunarSourceElementRange[],
  mapping: Mapping,
) {
  return elements.flatMap((element) => {
    // Element boundaries use inward association: content inserted immediately
    // before/after the node must stay outside its mapped range.
    const from = mapping.mapResult(element.pmFrom, 1);
    const to = mapping.mapResult(element.pmTo, -1);
    if (from.deletedAcross || to.deletedAcross || to.pos <= from.pos) {
      return [];
    }
    return [{
      ...element,
      pmFrom: from.pos,
      pmTo: to.pos,
    }];
  });
}

function serializePositionMaps(mapping: Mapping) {
  return mapping.maps.flatMap((stepMap) => {
    const ranges: number[] = [];
    stepMap.forEach((oldFrom, oldTo, newFrom, newTo) => {
      const oldSize = oldTo - oldFrom;
      const newSize = newTo - newFrom;
      if (oldSize !== newSize) {
        ranges.push(oldFrom, oldSize, newSize);
      }
    });
    return ranges.length ? [{ ranges }] : [];
  });
}

type PendingPositionMapping = {
  mapping: Mapping;
  changedFrom: number;
  changedTo: number;
  offsetAfter: number;
};

const pendingMappings = new WeakMap<readonly LunarSourcePositionMap[], Map<number, PendingPositionMapping>>();

function createPendingPositionMapping(
  positionMaps: readonly LunarSourcePositionMap[],
  fromRevision: number,
) {
  if (fromRevision >= positionMaps.length) {
    return undefined;
  }
  let mappings = pendingMappings.get(positionMaps);
  if (!mappings) {
    mappings = new Map();
    pendingMappings.set(positionMaps, mappings);
  }
  const cached = mappings.get(fromRevision);
  if (cached) return cached;
  const mapping = new Mapping();
  let changedFrom = Infinity;
  let changedTo = -Infinity;
  let offsetAfter = 0;
  positionMaps.slice(fromRevision).forEach((positionMap) => {
    const step = new StepMap([...positionMap.ranges]);
    const inverse = mapping.invert();
    step.forEach((oldStart, oldEnd, newStart, newEnd) => {
      changedFrom = Math.min(changedFrom, inverse.map(oldStart, -1));
      changedTo = Math.max(changedTo, inverse.map(oldEnd, 1));
      offsetAfter += newEnd - newStart - (oldEnd - oldStart);
    });
    mapping.appendMap(step);
  });
  const pending = { mapping, changedFrom, changedTo, offsetAfter };
  mappings.set(fromRevision, pending);
  return pending;
}

function mapPendingPosition(pending: PendingPositionMapping, position: number, assoc: number) {
  // Most positions in a large document are outside every edit. They need
  // only a constant offset, not one MapResult allocation per earlier edit.
  if (position < pending.changedFrom || position > pending.changedTo) {
    return {
      pos: position < pending.changedFrom ? position : position + pending.offsetAfter,
      deleted: false,
      deletedAcross: false,
    };
  }
  return pending.mapping.mapResult(position, assoc);
}

function withoutPositionRevision<T extends { positionRevision?: number }>(value: T) {
  if (value.positionRevision === undefined) return value;
  const { positionRevision: _positionRevision, ...positioned } = value;
  return positioned as T;
}

function resolveElementRange(
  sourceMap: LunarSourceMap,
  element: LunarSourceElementRange,
) {
  const positionMaps = sourceMap.positionMaps || [];
  const mapping = createPendingPositionMapping(
    positionMaps,
    element.positionRevision || 0,
  );
  if (!mapping) {
    return withoutPositionRevision(element);
  }
  const from = mapPendingPosition(mapping, element.pmFrom, 1);
  const to = mapPendingPosition(mapping, element.pmTo, -1);
  if (from.deletedAcross || to.deletedAcross || to.pos <= from.pos) {
    return undefined;
  }
  return {
    sourceKey: element.sourceKey,
    nodeType: element.nodeType,
    pmFrom: from.pos,
    pmTo: to.pos,
  };
}

function resolveTextSpan(
  sourceMap: LunarSourceMap,
  span: LunarSourceTextSpan,
) {
  const positionMaps = sourceMap.positionMaps || [];
  const mapping = createPendingPositionMapping(
    positionMaps,
    span.positionRevision || 0,
  );
  if (!mapping) {
    return withoutPositionRevision(span);
  }
  const from = mapPendingPosition(mapping, span.pmFrom, 1);
  const to = mapPendingPosition(mapping, span.pmTo, -1);
  if (to.pos < from.pos) {
    return undefined;
  }
  const oldLength = span.pmTo - span.pmFrom;
  const newLength = to.pos - from.pos;
  return {
    sourceKey: span.sourceKey,
    sourceFrom: span.sourceFrom,
    sourceTo: span.sourceTo,
    pmFrom: from.pos,
    pmTo: to.pos,
    exact:
      span.exact &&
      !from.deleted &&
      !to.deleted &&
      oldLength === newLength,
  };
}

export function findLunarSourceElementRange(
  sourceMap: LunarSourceMap,
  sourceKey: string,
) {
  const replacements = sourceMap.subtreeReplacements || [];
  for (let index = replacements.length - 1; index >= 0; index -= 1) {
    const replacement = replacements[index];
    if (replacement.replacedSourceKeys.includes(sourceKey)) {
      const element = replacement.elements.find(
        (candidate) => candidate.sourceKey === sourceKey,
      );
      return element ? resolveElementRange(sourceMap, element) : undefined;
    }
  }
  const element = sourceMap.elements.find((candidate) => candidate.sourceKey === sourceKey);
  return element ? resolveElementRange(sourceMap, element) : undefined;
}

function collectStoredElements(sourceMap: LunarSourceMap) {
  const elements = new Map(
    sourceMap.elements.map((element) => [element.sourceKey, element]),
  );
  (sourceMap.subtreeReplacements || []).forEach((replacement) => {
    replacement.replacedSourceKeys.forEach((sourceKey) => elements.delete(sourceKey));
    replacement.elements.forEach((element) => elements.set(element.sourceKey, element));
  });
  return Array.from(elements.values());
}

function collectStoredTextSpans(sourceMap: LunarSourceMap) {
  const spansBySourceKey = new Map<string, LunarSourceTextSpan[]>();
  const addSpans = (spans: readonly LunarSourceTextSpan[]) => {
    spans.forEach((span) => {
      const current = spansBySourceKey.get(span.sourceKey) || [];
      current.push(span);
      spansBySourceKey.set(span.sourceKey, current);
    });
  };
  addSpans(sourceMap.textSpans);
  (sourceMap.subtreeReplacements || []).forEach((replacement) => {
    replacement.replacedSourceKeys.forEach((sourceKey) => spansBySourceKey.delete(sourceKey));
    addSpans(replacement.textSpans);
  });
  return Array.from(spansBySourceKey.values()).flat();
}

function collectStoredDiagnostics(sourceMap: LunarSourceMap) {
  const diagnosticsBySourceKey = new Map<string, LunarSourceMapDiagnostic[]>();
  const addDiagnostics = (diagnostics: readonly LunarSourceMapDiagnostic[]) => {
    diagnostics.forEach((diagnostic) => {
      const current = diagnosticsBySourceKey.get(diagnostic.sourceKey) || [];
      current.push(diagnostic);
      diagnosticsBySourceKey.set(diagnostic.sourceKey, current);
    });
  };
  addDiagnostics(sourceMap.diagnostics);
  (sourceMap.subtreeReplacements || []).forEach((replacement) => {
    replacement.replacedSourceKeys.forEach(
      (sourceKey) => diagnosticsBySourceKey.delete(sourceKey),
    );
    addDiagnostics(replacement.diagnostics);
  });
  return Array.from(diagnosticsBySourceKey.values()).flat();
}

export function getLunarSourceElementRanges(sourceMap: LunarSourceMap) {
  return collectStoredElements(sourceMap)
    .flatMap((element) => resolveElementRange(sourceMap, element) || [])
    .sort((left, right) => (
      left.pmFrom - right.pmFrom ||
      right.pmTo - left.pmTo ||
      left.sourceKey.localeCompare(right.sourceKey)
    ));
}

export function getLunarSourceTextSpans(sourceMap: LunarSourceMap) {
  return collectStoredTextSpans(sourceMap)
    .flatMap((span) => resolveTextSpan(sourceMap, span) || [])
    .sort((left, right) => (
      left.pmFrom - right.pmFrom ||
      left.pmTo - right.pmTo ||
      left.sourceFrom - right.sourceFrom
    ));
}

type TextSpanIntervalIndex = {
  spans: readonly LunarSourceTextSpan[];
  maxEnds: readonly number[];
};

const textSpanIndexes = new WeakMap<readonly LunarSourceTextSpan[], Map<number, TextSpanIntervalIndex>>();

function indexTextSpans(spans: readonly LunarSourceTextSpan[]) {
  const cached = textSpanIndexes.get(spans);
  if (cached) return cached;
  const revisions = new Map<number, LunarSourceTextSpan[]>();
  spans.forEach(span => {
    const revision = span.positionRevision || 0;
    const group = revisions.get(revision) || [];
    group.push(span);
    revisions.set(revision, group);
  });
  const indexes = new Map<number, TextSpanIntervalIndex>();
  revisions.forEach((group, revision) => {
    group.sort((left, right) => left.pmFrom - right.pmFrom);
    let maxEnd = -Infinity;
    const maxEnds = group.map(span => maxEnd = Math.max(maxEnd, span.pmTo));
    indexes.set(revision, { spans: group, maxEnds });
  });
  textSpanIndexes.set(spans, indexes);
  return indexes;
}

/** Search immutable span arrays by interval instead of collecting every source
 * run for each selection update. Base arrays stay shared across local edits;
 * only the small replacement arrays need new indexes. */
export function getLunarSourceTextSpansInRange(sourceMap: LunarSourceMap, from: number, to: number) {
  const bounds = new Map<number, { from: number; to: number }>();
  const positionMaps = sourceMap.positionMaps || [];
  const supersededKeys = new Set<string>();
  const matches: LunarSourceTextSpan[] = [];
  const collect = (spans: readonly LunarSourceTextSpan[]) => {
    indexTextSpans(spans).forEach((index, revision) => {
      let bound = bounds.get(revision);
      if (!bound) {
        const inverse = createPendingPositionMapping(positionMaps, revision)?.mapping.invert();
        bound = inverse ? { from: inverse.map(from, -1), to: inverse.map(to, 1) } : { from, to };
        bounds.set(revision, bound);
      }
      let low = 0;
      let high = index.spans.length;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (index.maxEnds[middle] < bound.from) low = middle + 1;
        else high = middle;
      }
      for (let cursor = low; cursor < index.spans.length; cursor++) {
        const span = index.spans[cursor];
        if (span.pmFrom > bound.to) break;
        if (span.pmTo < bound.from || supersededKeys.has(span.sourceKey)) continue;
        const resolved = resolveTextSpan(sourceMap, span);
        if (resolved && resolved.pmFrom <= to && resolved.pmTo >= from) matches.push(resolved);
      }
    });
  };
  const replacements = sourceMap.subtreeReplacements || [];
  for (let index = replacements.length - 1; index >= 0; index--) {
    collect(replacements[index].textSpans);
    replacements[index].replacedSourceKeys.forEach(key => supersededKeys.add(key));
  }
  collect(sourceMap.textSpans);
  return matches.sort((left, right) => left.pmFrom - right.pmFrom || left.pmTo - right.pmTo || left.sourceFrom - right.sourceFrom);
}

function materializeLunarSourceMap(sourceMap: LunarSourceMap): LunarSourceMap {
  if (!sourceMap.positionMaps?.length && !sourceMap.subtreeReplacements?.length) {
    return sourceMap;
  }
  return {
    ...sourceMap,
    elements: getLunarSourceElementRanges(sourceMap),
    textSpans: getLunarSourceTextSpans(sourceMap),
    diagnostics: collectStoredDiagnostics(sourceMap),
    positionMaps: [],
    subtreeReplacements: [],
  };
}

type PmTextSegment = {
  pmFrom: number;
  value: string;
};

type PmTextCharacter = {
  pmPosition: number;
  value: string;
};

function collectPmTextSegmentsBySourceParent(doc: ProseMirrorNode) {
  const segments = new Map<string, PmTextSegment[]>();

  const visit = (
    node: ProseMirrorNode,
    contentStart: number,
    inheritedSourceKey?: string,
  ) => {
    const ownSourceKey = typeof node.attrs?.sourceKey === 'string' && node.attrs.sourceKey
      ? node.attrs.sourceKey
      : undefined;
    const sourceKey = ownSourceKey || inheritedSourceKey;

    node.forEach((child, offset) => {
      const childPosition = contentStart + offset;
      if (child.isText) {
        if (sourceKey && child.text) {
          const current = segments.get(sourceKey) || [];
          current.push({ pmFrom: childPosition, value: child.text });
          segments.set(sourceKey, current);
        }
        return;
      }
      visit(child, childPosition + 1, sourceKey);
    });
  };

  visit(doc, 0);
  return segments;
}

function collectSourceTextsByParent(
  sourceDocument: SourceDocument,
  mappedSourceKeys: ReadonlySet<string>,
) {
  const texts = new Map<string, SourceTextNode[]>();
  const visited = new Set<string>();
  const pending = [sourceDocument.rootKey];
  while (pending.length) {
    const key = pending.pop()!;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    const node = getSourceNode(sourceDocument, key);
    if (!isSourceParentNode(node)) {
      continue;
    }
    const children = node.childKeys.map((childKey) => (
      getSourceNode(sourceDocument, childKey)
    ));
    const directTexts = children.filter((child): child is SourceTextNode => (
      child.kind === 'text' && mappedSourceKeys.has(child.key)
    ));
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const child = children[index];
      if (isSourceParentNode(child)) {
        pending.push(child.key);
      }
    }
    if (directTexts.length) {
      texts.set(node.key, directTexts);
    }
  }
  return texts;
}

function flattenPmTextCharacters(segments: readonly PmTextSegment[]) {
  const characters: PmTextCharacter[] = [];
  for (const segment of segments) {
    for (let offset = 0; offset < segment.value.length; offset += 1) {
      characters.push({
        pmPosition: segment.pmFrom + offset,
        value: segment.value[offset],
      });
    }
  }
  return characters;
}

function getPmCursorPosition(
  characters: readonly PmTextCharacter[],
  index: number,
  fallback: number,
) {
  if (index < characters.length) {
    return characters[index].pmPosition;
  }
  if (characters.length) {
    return characters[characters.length - 1].pmPosition + 1;
  }
  return fallback;
}

function appendExactSpans(
  spans: LunarSourceTextSpan[],
  sourceKey: string,
  sourceFrom: number,
  length: number,
  characters: readonly PmTextCharacter[],
  pmIndex: number,
) {
  let runFrom = 0;
  for (let offset = 1; offset <= length; offset += 1) {
    const previous = characters[pmIndex + offset - 1];
    const current = characters[pmIndex + offset];
    if (offset < length && current.pmPosition === previous.pmPosition + 1) {
      continue;
    }
    spans.push({
      sourceKey,
      sourceFrom: sourceFrom + runFrom,
      sourceTo: sourceFrom + offset,
      pmFrom: characters[pmIndex + runFrom].pmPosition,
      pmTo: previous.pmPosition + 1,
      exact: true,
    });
    runFrom = offset;
  }
}

function alignParentText(
  sourceTexts: readonly SourceTextNode[],
  pmSegments: readonly PmTextSegment[],
  fallbackPosition: number,
  diagnostics: LunarSourceMapDiagnostic[],
) {
  const spans: LunarSourceTextSpan[] = [];
  const pmCharacters = flattenPmTextCharacters(pmSegments);
  const pmValue = pmCharacters.map((character) => character.value).join('');
  let pmIndex = 0;

  for (const sourceText of sourceTexts) {
    const tokens = Array.from(sourceText.value.matchAll(/\s+|\S+/g));
    let hasUnmappedContent = false;

    for (const tokenMatch of tokens) {
      const token = tokenMatch[0];
      const sourceFrom = tokenMatch.index;
      const sourceTo = sourceFrom + token.length;

      if (/^\s+$/.test(token)) {
        const pmFromIndex = pmIndex;
        while (pmIndex < pmCharacters.length && /\s/.test(pmCharacters[pmIndex].value)) {
          pmIndex += 1;
        }
        const projectedWhitespace = pmValue.slice(pmFromIndex, pmIndex);
        if (projectedWhitespace === token && token.length > 0) {
          appendExactSpans(
            spans,
            sourceText.key,
            sourceFrom,
            token.length,
            pmCharacters,
            pmFromIndex,
          );
        } else {
          spans.push({
            sourceKey: sourceText.key,
            sourceFrom,
            sourceTo,
            pmFrom: getPmCursorPosition(pmCharacters, pmFromIndex, fallbackPosition),
            pmTo: getPmCursorPosition(pmCharacters, pmIndex, fallbackPosition),
            exact: false,
          });
        }
        continue;
      }

      const matchIndex = pmValue.indexOf(token, pmIndex);
      if (matchIndex < 0) {
        const position = getPmCursorPosition(pmCharacters, pmIndex, fallbackPosition);
        spans.push({
          sourceKey: sourceText.key,
          sourceFrom,
          sourceTo,
          pmFrom: position,
          pmTo: position,
          exact: false,
        });
        hasUnmappedContent = true;
        continue;
      }

      appendExactSpans(
        spans,
        sourceText.key,
        sourceFrom,
        token.length,
        pmCharacters,
        matchIndex,
      );
      pmIndex = matchIndex + token.length;
    }

    if (hasUnmappedContent) {
      diagnostics.push({
        code: 'unmapped-text-boundary',
        sourceKey: sourceText.key,
        message: `ProseMirror omitted text content for ${sourceText.key}.`,
      });
    }
  }

  return spans;
}

function collectTextSpans(
  sourceDocument: SourceDocument,
  doc: ProseMirrorNode,
  references: readonly SourceTextPositionReference[],
  elementRanges: readonly LunarSourceElementRange[],
  diagnostics: LunarSourceMapDiagnostic[],
) {
  const mappedSourceKeys = new Set(references.map((reference) => reference.sourceKey));
  const sourceTextsByParent = collectSourceTextsByParent(sourceDocument, mappedSourceKeys);
  const pmTextsByParent = collectPmTextSegmentsBySourceParent(doc);
  const elementRangeBySourceKey = new Map(
    elementRanges.map((range) => [range.sourceKey, range]),
  );
  const spans: LunarSourceTextSpan[] = [];

  for (const [parentKey, sourceTexts] of sourceTextsByParent) {
    const pmSegments = pmTextsByParent.get(parentKey) || [];
    const parentRange = elementRangeBySourceKey.get(parentKey);
    spans.push(...alignParentText(
      sourceTexts,
      pmSegments,
      parentRange ? parentRange.pmFrom + 1 : 0,
      diagnostics,
    ));
  }
  return spans;
}

export function createLunarSourceMap(
  sourceDocument: SourceDocument,
  doc: ProseMirrorNode,
  positions: SourceTextPositionReferences,
): LunarSourceMap {
  const diagnostics = [...positions.diagnostics];
  const elements = collectElementRanges(doc);
  return {
    sourceRevision: sourceDocument.revision,
    mapRevision: 0,
    elements,
    textSpans: collectTextSpans(
      sourceDocument,
      doc,
      positions.references,
      elements,
      diagnostics,
    ),
    diagnostics,
    positionMaps: [],
    subtreeReplacements: [],
  };
}

export function mapLunarSourceMap(
  sourceMap: LunarSourceMap,
  mapping: Mapping,
): LunarSourceMap {
  const materialized = materializeLunarSourceMap(sourceMap);
  const textSpans = materialized.textSpans.flatMap((span) => {
    const from = mapping.mapResult(span.pmFrom, 1);
    const to = mapping.mapResult(span.pmTo, -1);
    if (to.pos < from.pos) {
      return [];
    }
    const oldLength = span.pmTo - span.pmFrom;
    const newLength = to.pos - from.pos;
    return [{
      ...span,
      pmFrom: from.pos,
      pmTo: to.pos,
      exact:
        span.exact &&
        !from.deleted &&
        !to.deleted &&
        oldLength === newLength,
    }];
  });

  return {
    ...materialized,
    mapRevision: sourceMap.mapRevision + 1,
    elements: mapElementRanges(materialized.elements, mapping),
    textSpans,
    positionMaps: [],
  };
}

function validateProjectionSpan(
  document: SourceDocument,
  doc: ProseMirrorNode,
  span: Pick<
    LunarSourceTextSpan,
    'sourceKey' | 'sourceFrom' | 'sourceTo' | 'pmFrom' | 'pmTo'
  >,
) {
  const sourceNode = requireSourceTextNode(document, span.sourceKey);
  if (!sourceNode) {
    return false;
  }
  const sourceValue = sourceNode.value.slice(span.sourceFrom, span.sourceTo);
  const positionsAreValid = (
    span.pmFrom >= 0 &&
    span.pmTo >= span.pmFrom &&
    span.pmTo <= doc.content.size
  );
  return (
    positionsAreValid &&
    span.pmTo - span.pmFrom === span.sourceTo - span.sourceFrom &&
    doc.textBetween(span.pmFrom, span.pmTo, '', '') === sourceValue
  );
}

export function replaceLunarSourceMapSubtree(
  sourceMap: LunarSourceMap,
  mapping: Mapping,
  doc: ProseMirrorNode,
  document: SourceDocument,
  projection: LunarSourceMap,
  previousSourceKeys: ReadonlySet<string>,
  nextSourceKeys: ReadonlySet<string>,
  positionOffset: number,
  options: { deferUnchangedMapping?: boolean } = {},
) {
  if (options.deferUnchangedMapping) {
    const incrementalBase = (sourceMap.subtreeReplacements?.length || 0) >= 64
      ? materializeLunarSourceMap(sourceMap)
      : sourceMap;
    const positionMaps = [
      ...(incrementalBase.positionMaps || []),
      ...serializePositionMaps(mapping),
    ];
    const positionRevision = positionMaps.length;
    const replacedSourceKeys = new Set([
      ...previousSourceKeys,
      ...nextSourceKeys,
    ]);
    const projectedElements = projection.elements
      .filter((element) => nextSourceKeys.has(element.sourceKey))
      .map((element) => ({
        ...element,
        pmFrom: element.pmFrom + positionOffset,
        pmTo: element.pmTo + positionOffset,
        positionRevision,
      }));
    const projectedSpans = projection.textSpans
      .filter((span) => nextSourceKeys.has(span.sourceKey))
      .map((span) => {
        const positioned = {
          ...span,
          pmFrom: span.pmFrom + positionOffset,
          pmTo: span.pmTo + positionOffset,
          positionRevision,
        };
        return {
          ...positioned,
          exact: validateProjectionSpan(document, doc, positioned),
        };
      });
    return {
      ...incrementalBase,
      sourceRevision: document.revision,
      mapRevision: sourceMap.mapRevision + 1,
      subtreeReplacements: [
        ...(incrementalBase.subtreeReplacements || []),
        {
          replacedSourceKeys: Array.from(replacedSourceKeys),
          elements: projectedElements,
          textSpans: projectedSpans,
          diagnostics: projection.diagnostics.filter(
            (diagnostic) => nextSourceKeys.has(diagnostic.sourceKey),
          ),
        },
      ],
      positionMaps,
    };
  }

  const mapped = mapLunarSourceMap(sourceMap, mapping);
  const replacedSourceKeys = new Set([
    ...previousSourceKeys,
    ...nextSourceKeys,
  ]);
  const projectedElements = projection.elements
    .filter((element) => nextSourceKeys.has(element.sourceKey))
    .map((element) => ({
      ...element,
      pmFrom: element.pmFrom + positionOffset,
      pmTo: element.pmTo + positionOffset,
    }));
  const elements = [
    ...mapped.elements.filter((element) => !replacedSourceKeys.has(element.sourceKey)),
    ...projectedElements,
  ].sort((left, right) => (
    left.pmFrom - right.pmFrom ||
    right.pmTo - left.pmTo ||
    left.sourceKey.localeCompare(right.sourceKey)
  ));
  const projectedSpans = projection.textSpans
    .filter((span) => nextSourceKeys.has(span.sourceKey))
    .map((span) => {
      const positioned = {
        ...span,
        pmFrom: span.pmFrom + positionOffset,
        pmTo: span.pmTo + positionOffset,
      };
      return {
        ...positioned,
        exact: validateProjectionSpan(document, doc, positioned),
      };
    });
  const textSpans = [
    ...mapped.textSpans.filter((span) => !replacedSourceKeys.has(span.sourceKey)),
    ...projectedSpans,
  ].sort((left, right) => (
    left.pmFrom - right.pmFrom ||
    left.pmTo - right.pmTo ||
    left.sourceFrom - right.sourceFrom
  ));
  const diagnostics = [
    ...mapped.diagnostics.filter((diagnostic) => !replacedSourceKeys.has(diagnostic.sourceKey)),
    ...projection.diagnostics.filter((diagnostic) => nextSourceKeys.has(diagnostic.sourceKey)),
  ];

  return {
    ...mapped,
    sourceRevision: document.revision,
    elements,
    textSpans,
    diagnostics,
  };
}

export function findSourceTextLocation(
  sourceMap: LunarSourceMap,
  pmPosition: number,
  bias: -1 | 1 = 1,
) {
  const candidates = getLunarSourceTextSpans(sourceMap).filter((candidate) => (
    candidate.pmFrom <= pmPosition && pmPosition <= candidate.pmTo
  ));
  const span = candidates.find((candidate) => (
    candidate.exact && (
      bias < 0
        ? candidate.pmFrom < pmPosition && pmPosition <= candidate.pmTo
        : candidate.pmFrom <= pmPosition && pmPosition < candidate.pmTo
    )
  )) || candidates.find((candidate) => !candidate.exact) || candidates[0];
  if (!span) {
    return undefined;
  }
  return {
    sourceKey: span.sourceKey,
    sourceFrom: span.sourceFrom,
    sourceTo: span.sourceTo,
    sourceOffset: span.exact
      ? span.sourceFrom + pmPosition - span.pmFrom
      : undefined,
    exact: span.exact,
  };
}

/** Resolve an exact SourceTextNode offset back to a ProseMirror position. */
export function findLunarPmTextPosition(
  sourceMap: LunarSourceMap,
  sourceKey: string,
  sourceOffset: number,
  bias: -1 | 1 = 1,
) {
  const candidates = getLunarSourceTextSpans(sourceMap).filter((candidate) => (
    candidate.sourceKey === sourceKey &&
    candidate.exact &&
    candidate.sourceFrom <= sourceOffset &&
    sourceOffset <= candidate.sourceTo
  ));
  const span = candidates.find((candidate) => (
    bias < 0
      ? candidate.sourceFrom < sourceOffset && sourceOffset <= candidate.sourceTo
      : candidate.sourceFrom <= sourceOffset && sourceOffset < candidate.sourceTo
  )) || candidates[0];
  return span
    ? span.pmFrom + sourceOffset - span.sourceFrom
    : undefined;
}
