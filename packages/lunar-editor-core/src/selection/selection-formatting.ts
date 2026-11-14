import { closeHistory } from 'prosemirror-history';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import {
  TextSelection,
  type EditorState,
  type Transaction,
} from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { SourceTextRangeAnchor } from '../utils/types';
import {
  applyLunarInlineFormattingEdit,
  getLunarInlineFormattingTagsAt,
  isLunarInlineFormattingRangeSupported,
  type LunarInlineFormattingTagName,
} from '../formatting/index';
import { getLunarSourceTextSpansInRange } from '../source/source-map';
import {
  getLunarSourceState,
  type LunarSourceState,
} from '../source/source-map-plugin';
import { getSourceMutationSteps } from '../source/source-mutation-step';
import { compileSourceStructuralTransaction } from '../source/structural-compiler';
import { compileSourceUnitTransaction } from '../source/source-unit-compiler';

export const LUNAR_SELECTION_FORMATTING_TAG_NAMES = [
  'b',
  'i',
  'u',
  's',
  'sup',
  'sub',
] as const satisfies readonly LunarInlineFormattingTagName[];

export type LunarSelectionFormattingTagName =
  (typeof LUNAR_SELECTION_FORMATTING_TAG_NAMES)[number];
export type LunarSelectionFormattingValue = 'active' | 'inactive' | 'mixed';

export type LunarSelectionFormattingState = {
  available: boolean;
  tags: Record<LunarSelectionFormattingTagName, LunarSelectionFormattingValue>;
};

export const EMPTY_LUNAR_SELECTION_FORMATTING_STATE: LunarSelectionFormattingState =
  {
    available: false,
    tags: {
      b: 'inactive',
      i: 'inactive',
      u: 'inactive',
      s: 'inactive',
      sup: 'inactive',
      sub: 'inactive',
    },
  };

export const LUNAR_INLINE_FORMATTING_TRANSACTION_META =
  'lunar-inline-formatting';

export type LunarInlineFormattingTransactionMeta = {
  tagName: LunarInlineFormattingTagName;
  action: 'add' | 'remove';
  sourceOperationId: string;
};

export type ToggleLunarInlineFormattingResult =
  | {
      kind: 'applied';
      transaction: Transaction;
      action: 'add' | 'remove';
    }
  | {
      kind: 'rejected';
      message: string;
    };

type ResolvedSelectionRange = {
  target: SourceTextRangeAnchor;
  pmFrom: number;
  pmTo: number;
  activeTags: ReadonlySet<LunarInlineFormattingTagName>;
};

type SelectionTextRange = Omit<ResolvedSelectionRange, 'activeTags'>;

type SelectionTargetResult =
  | { ok: true; ranges: readonly SelectionTextRange[] }
  | { ok: false; message: string };

type ResolvedSelectionRangesResult =
  | {
      ok: true;
      sourceState: LunarSourceState;
      ranges: readonly ResolvedSelectionRange[];
    }
  | { ok: false; message: string };

function reject(message: string): ToggleLunarInlineFormattingResult {
  return { kind: 'rejected', message };
}

function findPmPositionAtTextOffset(
  doc: ProseMirrorNode,
  textOffset: number,
  association: -1 | 1
) {
  let consumed = 0;
  let position: number | undefined;
  doc.descendants((node, nodePosition) => {
    if (position !== undefined || !node.isText) {
      return position === undefined;
    }
    const length = node.text?.length || 0;
    const end = consumed + length;
    const ownsBoundary =
      textOffset === consumed
        ? association > 0
        : textOffset === end
        ? association < 0
        : textOffset > consumed && textOffset < end;
    if (ownsBoundary) {
      position = nodePosition + textOffset - consumed;
      return false;
    }
    consumed = end;
    return true;
  });
  return position;
}

function collectSelectionTargets(
  state: EditorState,
  sourceState: LunarSourceState
): SelectionTargetResult {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || selection.empty) {
    return {
      ok: false,
      message: 'Select text before formatting.',
    };
  }

  // Formatting changes individual text runs, not the surrounding blocks.
  // Unlike AI replacement, it does not require sibling SourceUnits.
  const ranges: SelectionTextRange[] = [];
  for (const span of getLunarSourceTextSpansInRange(
    sourceState.sourceMap,
    selection.from,
    selection.to
  )) {
    const pmFrom = Math.max(selection.from, span.pmFrom);
    const pmTo = Math.min(selection.to, span.pmTo);
    // Inexact whitespace spans can overlap inline wrappers. Only exact runs
    // may become edits; the coverage checks below reject unmapped visible text.
    if (!span.exact || pmFrom >= pmTo) {
      continue;
    }
    const sourceNode = sourceState.document.nodes.get(span.sourceKey);
    if (
      span.pmTo - span.pmFrom !== span.sourceTo - span.sourceFrom ||
      sourceNode?.kind !== 'text'
    ) {
      return {
        ok: false,
        message: 'The selected text does not have an exact editor mapping.',
      };
    }
    const from = span.sourceFrom + pmFrom - span.pmFrom;
    const to = span.sourceFrom + pmTo - span.pmFrom;
    const target = {
      sourceKey: span.sourceKey,
      from,
      to,
      expectedText: sourceNode.value.slice(from, to),
    };
    const previous = ranges.at(-1);
    if (previous && previous.pmTo > pmFrom) {
      return {
        ok: false,
        message: 'The selected text has overlapping source mappings.',
      };
    }
    if (
      state.doc
        .textBetween(previous?.pmTo ?? selection.from, pmFrom, '', '')
        .trim()
    ) {
      return {
        ok: false,
        message: 'The selected text is not fully mapped to editor source.',
      };
    }
    if (
      previous?.target.sourceKey === target.sourceKey &&
      previous.target.to === from &&
      previous.pmTo === pmFrom
    ) {
      previous.target.to = to;
      previous.target.expectedText += target.expectedText;
      previous.pmTo = pmTo;
    } else {
      ranges.push({ target, pmFrom, pmTo });
    }
  }

  // Never silently format only part of a selection containing unmapped text.
  if (
    state.doc
      .textBetween(ranges.at(-1)?.pmTo ?? selection.from, selection.to, '', '')
      .trim()
  ) {
    return {
      ok: false,
      message: 'The selected text is not fully mapped to editor source.',
    };
  }
  const nonEmptyRanges = ranges.flatMap(({ target, pmFrom, pmTo }) => {
    const leadingSpaces = target.expectedText.match(/^ +/)?.[0].length || 0;
    const trailingSpaces = target.expectedText.match(/ +$/)?.[0].length || 0;
    const from = target.from + leadingSpaces;
    const to = target.to - trailingSpaces;
    return from < to
      ? [
          {
            pmFrom: pmFrom + leadingSpaces,
            pmTo: pmTo - trailingSpaces,
            target: {
              ...target,
              from,
              to,
              expectedText: target.expectedText.slice(
                leadingSpaces,
                target.expectedText.length - trailingSpaces
              ),
            },
          },
        ]
      : [];
  });
  if (!nonEmptyRanges.length) {
    return {
      ok: false as const,
      message: 'Select non-empty text before formatting.',
    };
  }
  return { ok: true, ranges: nonEmptyRanges };
}

const selectionRanges = new WeakMap<
  EditorState,
  ResolvedSelectionRangesResult
>();

function resolveSelectionRanges(
  state: EditorState
): ResolvedSelectionRangesResult {
  const cached = selectionRanges.get(state);
  if (cached) return cached;
  const result = computeSelectionRanges(state);
  selectionRanges.set(state, result);
  return result;
}

function computeSelectionRanges(
  state: EditorState
): ResolvedSelectionRangesResult {
  const sourceState = getLunarSourceState(state);
  if (
    !sourceState ||
    sourceState.status !== 'synchronized' ||
    sourceState.sourceMap.sourceRevision !== sourceState.document.revision
  ) {
    return {
      ok: false as const,
      message: 'Inline formatting requires synchronized editor source.',
    };
  }
  const collected = collectSelectionTargets(state, sourceState);
  if (collected.ok === false) {
    return { ok: false, message: collected.message };
  }

  const ranges: ResolvedSelectionRange[] = [];
  for (const { target, pmFrom, pmTo } of collected.ranges) {
    const sourceNode = sourceState.document.nodes.get(target.sourceKey);
    if (
      !sourceNode ||
      sourceNode.kind !== 'text' ||
      target.from < 0 ||
      target.from >= target.to ||
      target.to > sourceNode.value.length ||
      sourceNode.value.slice(target.from, target.to) !== target.expectedText
    ) {
      return {
        ok: false as const,
        message:
          'The selected source text is no longer an exact formatting target.',
      };
    }
    if (
      pmFrom >= pmTo ||
      state.doc.textBetween(pmFrom, pmTo, '', '') !== target.expectedText
    ) {
      return {
        ok: false as const,
        message: 'The selected text does not have an exact editor mapping.',
      };
    }
    if (!isLunarInlineFormattingRangeSupported(state, pmFrom, pmTo)) {
      return {
        ok: false as const,
        message: 'Inline formatting is unavailable for this selection.',
      };
    }
    ranges.push({
      target,
      pmFrom,
      pmTo,
      activeTags: getLunarInlineFormattingTagsAt(state, pmFrom),
    });
  }
  return { ok: true as const, sourceState, ranges };
}

export function getLunarSelectionFormattingState(
  state: EditorState | undefined
): LunarSelectionFormattingState {
  if (!state || state.selection.empty) {
    return EMPTY_LUNAR_SELECTION_FORMATTING_STATE;
  }
  const resolved = resolveSelectionRanges(state);
  if (!resolved.ok) {
    return EMPTY_LUNAR_SELECTION_FORMATTING_STATE;
  }

  const tags = Object.fromEntries(
    LUNAR_SELECTION_FORMATTING_TAG_NAMES.map((tagName) => {
      const activeCount = resolved.ranges.filter((range) =>
        range.activeTags.has(tagName)
      ).length;
      const value: LunarSelectionFormattingValue =
        activeCount === 0
          ? 'inactive'
          : activeCount === resolved.ranges.length
          ? 'active'
          : 'mixed';
      return [tagName, value];
    })
  ) as LunarSelectionFormattingState['tags'];
  return { available: true, tags };
}

export function createToggleLunarInlineFormattingTransaction(
  state: EditorState,
  tagName: LunarInlineFormattingTagName
): ToggleLunarInlineFormattingResult {
  const resolved = resolveSelectionRanges(state);
  if (resolved.ok === false) {
    return reject(resolved.message);
  }

  const action = resolved.ranges.every((range) => range.activeTags.has(tagName))
    ? 'remove'
    : 'add';
  const oppositeTag: LunarInlineFormattingTagName | undefined =
    tagName === 'sup' ? 'sub' : tagName === 'sub' ? 'sup' : undefined;
  const edits = resolved.ranges.flatMap((range) => {
    const active = range.activeTags.has(tagName);
    if (action === 'add' && active) {
      return [];
    }
    const addTags: LunarInlineFormattingTagName[] =
      action === 'add' ? [tagName] : [];
    const removeTags: LunarInlineFormattingTagName[] =
      action === 'remove'
        ? [tagName]
        : oppositeTag && range.activeTags.has(oppositeTag)
        ? [oppositeTag]
        : [];
    return [
      {
        range,
        addTags,
        removeTags,
      },
    ];
  });
  if (!edits.length) {
    return reject(
      'The selected text already has the requested formatting state.'
    );
  }

  const selectedTextBefore = state.doc.textBetween(
    0,
    state.selection.from,
    '',
    ''
  ).length;
  const selectedTextLength = state.doc.textBetween(
    state.selection.from,
    state.selection.to,
    '',
    ''
  ).length;
  const transaction = closeHistory(state.tr);
  for (const edit of [...edits].sort(
    (left, right) =>
      right.range.pmFrom - left.range.pmFrom ||
      right.range.pmTo - left.range.pmTo
  )) {
    const applied = applyLunarInlineFormattingEdit(state, transaction, {
      from: edit.range.pmFrom,
      to: edit.range.pmTo,
      expectedText: edit.range.target.expectedText,
      addTags: edit.addTags,
      removeTags: edit.removeTags,
    });
    if (applied.kind !== 'applied') {
      return reject(applied.message);
    }
  }
  const selectionFrom = findPmPositionAtTextOffset(
    transaction.doc,
    selectedTextBefore,
    1
  );
  const selectionTo = findPmPositionAtTextOffset(
    transaction.doc,
    selectedTextBefore + selectedTextLength,
    -1
  );
  if (
    selectionFrom !== undefined &&
    selectionTo !== undefined &&
    selectionFrom < selectionTo
  ) {
    transaction.setSelection(
      TextSelection.create(
        transaction.doc,
        state.selection.anchor <= state.selection.head
          ? selectionFrom
          : selectionTo,
        state.selection.anchor <= state.selection.head
          ? selectionTo
          : selectionFrom
      )
    );
  }

  const sourceOperationId = ['inline-format', tagName, Date.now()].join(':');
  const sourceUnitCompiled = compileSourceUnitTransaction(
    transaction,
    resolved.sourceState.document,
    resolved.sourceState.sourceMap,
    { operationId: sourceOperationId }
  );
  const compiled =
    sourceUnitCompiled.kind === 'compiled'
      ? sourceUnitCompiled
      : compileSourceStructuralTransaction(
          transaction,
          resolved.sourceState.document,
          resolved.sourceState.sourceMap,
          { operationId: sourceOperationId }
        );
  if (compiled.kind !== 'compiled') {
    return reject(compiled.message);
  }
  if (!getSourceMutationSteps(compiled.transaction.steps).length) {
    return reject('The source compiler did not record the formatting change.');
  }
  compiled.transaction.setMeta(LUNAR_INLINE_FORMATTING_TRANSACTION_META, {
    tagName,
    action,
    sourceOperationId,
  } satisfies LunarInlineFormattingTransactionMeta);

  return { kind: 'applied', transaction: compiled.transaction, action };
}

export function toggleLunarInlineFormatting(
  view: EditorView,
  tagName: LunarInlineFormattingTagName
) {
  const result = createToggleLunarInlineFormattingTransaction(
    view.state,
    tagName
  );
  if (result.kind === 'applied') {
    view.dispatch(result.transaction);
  }
  return result;
}

export function toggleLunarInlineFormattingCommand(
  tagName: LunarInlineFormattingTagName
) {
  return (
    state: EditorState,
    dispatch?: (transaction: Transaction) => void
  ) => {
    const result = createToggleLunarInlineFormattingTransaction(state, tagName);
    if (result.kind !== 'applied') {
      return false;
    }
    dispatch?.(result.transaction);
    return true;
  };
}
