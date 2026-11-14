import {
  Fragment,
  type Node as ProseMirrorNode,
  type NodeType,
  type ResolvedPos,
} from 'prosemirror-model';
import type { EditorState, Transaction } from 'prosemirror-state';
import {
  LUNAR_INLINE_FORMATTING_TAG_NAMES,
  type LunarInlineFormattingTagName,
} from './types';

const inlineFormattingTagNames = new Set<string>(
  LUNAR_INLINE_FORMATTING_TAG_NAMES,
);
const splitSafeInlineTagNames = new Set<string>([
  ...LUNAR_INLINE_FORMATTING_TAG_NAMES,
  'span',
  'strong',
  'em',
  'strike',
]);
const formattingSourceUnitNodeTypes = new Set([
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

export type LunarInlineFormattingEdit = {
  from: number;
  to: number;
  expectedText: string;
  addTags: readonly LunarInlineFormattingTagName[];
  removeTags: readonly LunarInlineFormattingTagName[];
};

export type LunarInlineFormattingResult =
  | {
      kind: 'applied';
      selectionFrom: number;
      selectionTo: number;
    }
  | {
      kind: 'rejected';
      code: 'invalid-target-range' | 'unsupported-operation';
      message: string;
    };

type SplitFormattingContent = {
  before: ProseMirrorNode[];
  selected: ProseMirrorNode[];
  after: ProseMirrorNode[];
  /** Text target offsets relative to the start of `selected`. */
  selectedFrom: number;
  selectedTo: number;
};

function reject(
  code: Extract<LunarInlineFormattingResult, { kind: 'rejected' }>['code'],
  message: string,
): LunarInlineFormattingResult {
  return { kind: 'rejected', code, message };
}

function formattingNodesSize(nodes: readonly ProseMirrorNode[]) {
  return nodes.reduce((size, node) => size + node.nodeSize, 0);
}

function createFormattingWrapper(
  inlineElement: NodeType,
  tagName: LunarInlineFormattingTagName,
  content: readonly ProseMirrorNode[],
) {
  return inlineElement.create({
    htmlAttrs: {},
    localName: tagName,
    sourceKey: null,
  }, Fragment.fromArray([...content]));
}

function wrapFormattingContent(
  content: readonly ProseMirrorNode[],
  addTags: readonly LunarInlineFormattingTagName[],
  inlineElement: NodeType,
) {
  let wrapped = [...content];
  for (let index = addTags.length - 1; index >= 0; index -= 1) {
    wrapped = [createFormattingWrapper(
      inlineElement,
      addTags[index],
      wrapped,
    )];
  }
  return wrapped;
}

function cloneFormattingSegment(
  node: ProseMirrorNode,
  content: readonly ProseMirrorNode[],
) {
  if (!content.length) {
    return [];
  }
  const attrs = Object.prototype.hasOwnProperty.call(node.attrs, 'sourceKey')
    ? { ...node.attrs, sourceKey: null }
    : node.attrs;
  return [node.type.create(
    attrs,
    Fragment.fromArray([...content]),
    node.marks,
  )];
}

/**
 * Split the one ancestor branch containing an exact text range. Removed
 * wrappers stay around the unselected sides, while unrelated inline wrappers
 * are cloned around every branch and therefore remain intact.
 */
function splitFormattingAncestor(
  node: ProseMirrorNode,
  nodeStart: number,
  from: number,
  to: number,
  removeTags: ReadonlySet<string>,
  addTags: readonly LunarInlineFormattingTagName[],
  inlineElement: NodeType,
): SplitFormattingContent | undefined {
  if (node.isText) {
    const localFrom = from - nodeStart;
    const localTo = to - nodeStart;
    if (
      localFrom < 0 ||
      localTo > node.nodeSize ||
      localFrom >= localTo
    ) {
      return undefined;
    }
    // The DOM parser drops collapsible U+0020 at a newly split inline edge.
    // Move only those spaces outside the wrapper; semantic whitespace stays.
    const beforeWhitespaceMatch = node.text
      ?.slice(0, localFrom).match(/ +$/);
    const afterWhitespaceMatch = node.text
      ?.slice(localTo).match(/^ +/);
    const beforeWhitespaceLength = beforeWhitespaceMatch?.[0].length || 0;
    const afterWhitespaceLength = afterWhitespaceMatch?.[0].length || 0;
    const beforeEnd = localFrom - beforeWhitespaceLength;
    const afterStart = localTo + afterWhitespaceLength;
    const before = beforeEnd > 0 ? [node.cut(0, beforeEnd)] : [];
    const selectedText = wrapFormattingContent(
      [node.cut(localFrom, localTo)],
      addTags,
      inlineElement,
    );
    const selected = [
      ...(beforeWhitespaceLength
        ? [node.cut(beforeEnd, localFrom)]
        : []),
      ...selectedText,
      ...(afterWhitespaceLength
        ? [node.cut(localTo, afterStart)]
        : []),
    ];
    const after = afterStart < node.nodeSize
      ? [node.cut(afterStart, node.nodeSize)]
      : [];
    const selectedFrom = beforeWhitespaceLength + addTags.length;
    return {
      before,
      selected,
      after,
      selectedFrom,
      selectedTo: selectedFrom + localTo - localFrom,
    };
  }

  const contentStart = nodeStart + 1;
  let selectedChildIndex = -1;
  let selectedChildSplit: SplitFormattingContent | undefined;
  node.forEach((child, childOffset, childIndex) => {
    if (selectedChildSplit) {
      return;
    }
    const childStart = contentStart + childOffset;
    const childEnd = childStart + child.nodeSize;
    if (from >= childStart && to <= childEnd) {
      const split = splitFormattingAncestor(
        child,
        childStart,
        from,
        to,
        removeTags,
        addTags,
        inlineElement,
      );
      if (split) {
        selectedChildIndex = childIndex;
        selectedChildSplit = split;
      }
    }
  });
  if (!selectedChildSplit || selectedChildIndex < 0) {
    return undefined;
  }

  const children = [...node.content.content];
  const beforeChildren = [
    ...children.slice(0, selectedChildIndex),
    ...selectedChildSplit.before,
  ];
  const afterChildren = [
    ...selectedChildSplit.after,
    ...children.slice(selectedChildIndex + 1),
  ];
  const localName = node.type === inlineElement &&
    typeof node.attrs.localName === 'string'
    ? node.attrs.localName.toLowerCase()
    : undefined;
  const removesCurrentWrapper = Boolean(localName && removeTags.has(localName));
  return {
    before: cloneFormattingSegment(node, beforeChildren),
    selected: removesCurrentWrapper
      ? selectedChildSplit.selected
      : cloneFormattingSegment(node, selectedChildSplit.selected),
    after: cloneFormattingSegment(node, afterChildren),
    selectedFrom: selectedChildSplit.selectedFrom +
      (removesCurrentWrapper ? 0 : 1),
    selectedTo: selectedChildSplit.selectedTo +
      (removesCurrentWrapper ? 0 : 1),
  };
}

function rebuildFormattingAncestorBranch(
  resolvedFrom: ResolvedPos,
  topmostDepth: number,
  sourceUnitDepth: number,
  replacement: readonly ProseMirrorNode[],
  selectedFrom: number,
  selectedTo: number,
) {
  let branch = [...replacement];
  let branchSelectedFrom = selectedFrom;
  let branchSelectedTo = selectedTo;
  for (let depth = topmostDepth - 1; depth >= sourceUnitDepth; depth -= 1) {
    const ancestor = resolvedFrom.node(depth);
    const childIndex = resolvedFrom.index(depth);
    const children = [...ancestor.content.content];
    const precedingSize = formattingNodesSize(children.slice(0, childIndex));
    children.splice(childIndex, 1, ...branch);
    branchSelectedFrom += 1 + precedingSize;
    branchSelectedTo += 1 + precedingSize;
    branch = [ancestor.type.create(
      ancestor.attrs,
      Fragment.fromArray(children),
      ancestor.marks,
    )];
  }
  return {
    node: branch[0],
    selectedFrom: branchSelectedFrom,
    selectedTo: branchSelectedTo,
  };
}

function collectActiveTags(
  resolvedFrom: ResolvedPos,
  inlineElement: NodeType,
) {
  const activeTags = new Set<LunarInlineFormattingTagName>();
  for (let depth = 1; depth <= resolvedFrom.depth; depth += 1) {
    const ancestor = resolvedFrom.node(depth);
    if (
      ancestor.type !== inlineElement ||
      typeof ancestor.attrs.localName !== 'string'
    ) {
      continue;
    }
    const localName = ancestor.attrs.localName.toLowerCase();
    if (inlineFormattingTagNames.has(localName)) {
      activeTags.add(localName as LunarInlineFormattingTagName);
    }
  }
  return activeTags;
}

function isInsideCodeBlock(resolved: ResolvedPos) {
  return [...Array(resolved.depth + 1).keys()].some((depth) => {
    const ancestor = resolved.node(depth);
    return ancestor.type.name === 'code_block' ||
      ancestor.attrs?.localName === 'pre';
  });
}

export function isLunarInlineFormattingRangeSupported(
  state: EditorState,
  from: number,
  to: number,
) {
  const inlineElement = state.schema.nodes.cnode_inline;
  if (!inlineElement || from < 0 || from >= to || to > state.doc.content.size) {
    return false;
  }
  const resolvedFrom = state.doc.resolve(from);
  const resolvedTo = state.doc.resolve(to);
  return !isInsideCodeBlock(resolvedFrom) &&
    resolvedFrom.sameParent(resolvedTo) &&
    resolvedFrom.parent.type.contentMatch.matchType(inlineElement);
}

export function getLunarInlineFormattingTagsAt(
  state: EditorState,
  position: number,
) {
  const inlineElement = state.schema.nodes.cnode_inline;
  if (!inlineElement || position < 0 || position > state.doc.content.size) {
    return new Set<LunarInlineFormattingTagName>();
  }
  return collectActiveTags(state.doc.resolve(position), inlineElement);
}

/** Apply one exact inline formatting edit to an existing transaction. */
export function applyLunarInlineFormattingEdit(
  state: EditorState,
  transaction: Transaction,
  edit: LunarInlineFormattingEdit,
): LunarInlineFormattingResult {
  const inlineElement = state.schema.nodes.cnode_inline;
  const requestedTags = [...edit.addTags, ...edit.removeTags];
  if (
    !inlineElement ||
    requestedTags.some((tagName) => !inlineFormattingTagNames.has(tagName)) ||
    (edit.addTags.includes('sup') && edit.addTags.includes('sub'))
  ) {
    return reject(
      'unsupported-operation',
      'The editor cannot apply one of the requested inline formatting elements.',
    );
  }
  if (
    edit.from < 0 ||
    edit.from >= edit.to ||
    edit.to > transaction.doc.content.size ||
    transaction.doc.textBetween(edit.from, edit.to, '', '') !== edit.expectedText
  ) {
    return reject(
      'invalid-target-range',
      'The inline formatting target is no longer an exact non-empty text range.',
    );
  }

  const resolvedFrom = transaction.doc.resolve(edit.from);
  const resolvedTo = transaction.doc.resolve(edit.to);
  if (isInsideCodeBlock(resolvedFrom)) {
    return reject(
      'unsupported-operation',
      'Inline formatting is not supported inside a code block.',
    );
  }
  if (
    !resolvedFrom.sameParent(resolvedTo) ||
    !resolvedFrom.parent.type.contentMatch.matchType(inlineElement)
  ) {
    return reject(
      'unsupported-operation',
      'The selected text\'s parent does not allow inline formatting elements.',
    );
  }

  const activeTags = collectActiveTags(resolvedFrom, inlineElement);
  const removableDepths: number[] = [];
  for (let depth = 1; depth <= resolvedFrom.depth; depth += 1) {
    const ancestor = resolvedFrom.node(depth);
    if (
      ancestor.type !== inlineElement ||
      typeof ancestor.attrs.localName !== 'string'
    ) {
      continue;
    }
    const localName = ancestor.attrs.localName.toLowerCase();
    if (!inlineFormattingTagNames.has(localName)) {
      continue;
    }
    const tagName = localName as LunarInlineFormattingTagName;
    if (edit.removeTags.includes(tagName)) {
      const htmlAttrs = ancestor.attrs.htmlAttrs;
      if (
        htmlAttrs &&
        typeof htmlAttrs === 'object' &&
        Object.keys(htmlAttrs).length > 0
      ) {
        return reject(
          'unsupported-operation',
          `Cannot remove <${tagName}> formatting that carries HTML attributes.`,
        );
      }
      removableDepths.push(depth);
    }
  }
  const effectiveAddTags = edit.addTags.filter(
    (tagName) => !activeTags.has(tagName),
  );
  const resultingTags = new Set(
    [...activeTags].filter((tagName) => !edit.removeTags.includes(tagName)),
  );
  edit.addTags.forEach((tagName) => resultingTags.add(tagName));
  if (resultingTags.has('sup') && resultingTags.has('sub')) {
    return reject(
      'unsupported-operation',
      'A selection cannot be both superscript and subscript.',
    );
  }
  if (!effectiveAddTags.length && !removableDepths.length) {
    return reject(
      'unsupported-operation',
      'The selected text already has the requested formatting state.',
    );
  }

  let nextSelectionFrom: number;
  let nextSelectionTo: number;
  try {
    if (!removableDepths.length) {
      const selectedContent = [
        ...transaction.doc.slice(edit.from, edit.to).content.content,
      ];
      const formattedContent = wrapFormattingContent(
        selectedContent,
        effectiveAddTags,
        inlineElement,
      );
      transaction.replaceWith(
        edit.from,
        edit.to,
        Fragment.fromArray(formattedContent),
      );
      nextSelectionFrom = edit.from + effectiveAddTags.length;
      nextSelectionTo = nextSelectionFrom + edit.expectedText.length;
    } else {
      const topmostDepth = Math.min(...removableDepths);
      for (let depth = topmostDepth; depth <= resolvedFrom.depth; depth += 1) {
        const ancestor = resolvedFrom.node(depth);
        if (!ancestor.isInline) {
          continue;
        }
        const htmlAttrs = ancestor.attrs?.htmlAttrs;
        const selectionSplitsAncestor =
          edit.from > resolvedFrom.start(depth) ||
          edit.to < resolvedFrom.end(depth);
        if (!selectionSplitsAncestor) {
          continue;
        }
        const localName = ancestor.type === inlineElement &&
          typeof ancestor.attrs.localName === 'string'
          ? ancestor.attrs.localName.toLowerCase()
          : undefined;
        if (!localName || !splitSafeInlineTagNames.has(localName)) {
          return reject(
            'unsupported-operation',
            'Cannot split an inline element with non-formatting semantics.',
          );
        }
        if (
          htmlAttrs &&
          typeof htmlAttrs === 'object' &&
          Object.keys(htmlAttrs).length > 0
        ) {
          return reject(
            'unsupported-operation',
            'Cannot split an inline element that carries HTML attributes.',
          );
        }
      }
      const topmostAncestor = resolvedFrom.node(topmostDepth);
      const topmostStart = resolvedFrom.before(topmostDepth);
      const split = splitFormattingAncestor(
        topmostAncestor,
        topmostStart,
        edit.from,
        edit.to,
        new Set(edit.removeTags),
        effectiveAddTags,
        inlineElement,
      );
      if (!split) {
        return reject(
          'invalid-target-range',
          'The selected formatting branch could not be split safely.',
        );
      }
      let sourceUnitDepth = topmostDepth - 1;
      while (
        sourceUnitDepth > 0 &&
        !formattingSourceUnitNodeTypes.has(
          resolvedFrom.node(sourceUnitDepth).type.name,
        )
      ) {
        sourceUnitDepth -= 1;
      }
      if (sourceUnitDepth <= 0) {
        return reject(
          'unsupported-operation',
          'The formatting selection is not inside a supported SourceUnit.',
        );
      }
      const sourceUnit = resolvedFrom.node(sourceUnitDepth);
      const replacement = [...split.before, ...split.selected, ...split.after];
      const selectedOffset = formattingNodesSize(split.before);
      const rebuiltSourceUnit = rebuildFormattingAncestorBranch(
        resolvedFrom,
        topmostDepth,
        sourceUnitDepth,
        replacement,
        selectedOffset + split.selectedFrom,
        selectedOffset + split.selectedTo,
      );
      if (!rebuiltSourceUnit.node) {
        return reject(
          'unsupported-operation',
          'The formatting SourceUnit could not be rebuilt safely.',
        );
      }
      const sourceUnitStart = resolvedFrom.before(sourceUnitDepth);
      transaction.replaceWith(
        sourceUnitStart,
        sourceUnitStart + sourceUnit.nodeSize,
        rebuiltSourceUnit.node,
      );
      nextSelectionFrom = sourceUnitStart + rebuiltSourceUnit.selectedFrom;
      nextSelectionTo = sourceUnitStart + rebuiltSourceUnit.selectedTo;
    }
  } catch {
    return reject(
      'unsupported-operation',
      'The selected text cannot be changed to the requested formatting state.',
    );
  }

  return {
    kind: 'applied',
    selectionFrom: nextSelectionFrom,
    selectionTo: nextSelectionTo,
  };
}
