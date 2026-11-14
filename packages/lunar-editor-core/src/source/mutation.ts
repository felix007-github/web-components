import {
  findSourceParentKey,
  isSourceParentNode,
  sameSourceKeys,
  type SourceDocument,
  type SourceNode,
  type SourceParentNode,
  type SourceTextNode,
  SourceNodeMapOverlayBuilder,
} from './model';
import { SourceNodeCleanup } from './node-cleanup';

export type ReplaceTextMutation = {
  type: 'replace-text';
  nodeKey: string;
  from: number;
  to: number;
  value: string;
  expectedText: string;
};

export type ReplaceChildrenMutation = {
  type: 'replace-children';
  parentKey: string;
  childKeys: readonly string[];
  expectedChildKeys: readonly string[];
};

export type SourceNodeReplacement = {
  key: string;
  expected?: SourceNode;
  value?: SourceNode;
};

export type ReplaceNodesMutation = {
  type: 'replace-nodes';
  replacements: readonly SourceNodeReplacement[];
};

export type SourceMutation =
  | ReplaceTextMutation
  | ReplaceChildrenMutation
  | ReplaceNodesMutation;

export type SourceMutationBatch = {
  operationId: string;
  mutations: readonly SourceMutation[];
};

export type AppliedSourceMutationBatch = {
  document: SourceDocument;
  inverse: SourceMutationBatch;
};

export type CleanedSourceMutationBatch = AppliedSourceMutationBatch & {
  forward: SourceMutationBatch;
};

export class SourceMutationError extends Error {
  constructor(
    public readonly code:
      | 'invalid-range'
      | 'invalid-target'
      | 'invalid-tree'
      | 'node-not-found'
      | 'stale-source',
    message: string,
  ) {
    super(message);
    this.name = 'SourceMutationError';
  }
}

let operationSequence = 0;

export function createSourceOperationId() {
  operationSequence += 1;
  return `source-mutation-${Date.now().toString(36)}-${operationSequence.toString(36)}`;
}

function requireNode(document: SourceDocument, key: string): SourceNode {
  const node = document.nodes.get(key);
  if (!node) {
    throw new SourceMutationError('node-not-found', `Source node ${key} was not found.`);
  }
  return node;
}

function requireTextNode(document: SourceDocument, key: string): SourceTextNode {
  const node = requireNode(document, key);
  if (node.kind !== 'text') {
    throw new SourceMutationError('invalid-target', `Source node ${key} is not text.`);
  }
  return node;
}

function requireParentNode(document: SourceDocument, key: string): SourceParentNode {
  const node = requireNode(document, key);
  if (!isSourceParentNode(node)) {
    throw new SourceMutationError('invalid-target', `Source node ${key} cannot contain children.`);
  }
  return node;
}

export function createReplaceTextMutation(
  document: SourceDocument,
  nodeKey: string,
  from: number,
  to: number,
  value: string,
): ReplaceTextMutation {
  const node = requireTextNode(document, nodeKey);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to > node.value.length) {
    throw new SourceMutationError(
      'invalid-range',
      `Text range ${from}:${to} is invalid for source node ${nodeKey}.`,
    );
  }
  return {
    type: 'replace-text',
    nodeKey,
    from,
    to,
    value,
    expectedText: node.value.slice(from, to),
  };
}

export function createReplaceChildrenMutation(
  document: SourceDocument,
  parentKey: string,
  childKeys: readonly string[],
): ReplaceChildrenMutation {
  const parent = requireParentNode(document, parentKey);
  childKeys.forEach((childKey) => requireNode(document, childKey));
  return {
    type: 'replace-children',
    parentKey,
    childKeys: [...childKeys],
    expectedChildKeys: [...parent.childKeys],
  };
}

export function createReplaceNodesMutation(
  document: SourceDocument,
  replacements: readonly { key: string; value?: SourceNode }[],
): ReplaceNodesMutation {
  const keys = new Set<string>();
  return {
    type: 'replace-nodes',
    replacements: replacements.map(({ key, value }) => {
      if (keys.has(key)) {
        throw new SourceMutationError(
          'invalid-target',
          `Source node replacement ${key} is duplicated.`,
        );
      }
      if (value && value.key !== key) {
        throw new SourceMutationError(
          'invalid-target',
          `Source node replacement ${key} has mismatched value key ${value.key}.`,
        );
      }
      keys.add(key);
      return {
        key,
        expected: document.nodes.get(key),
        value,
      };
    }),
  };
}

export function createRemoveNodeMutation(
  document: SourceDocument,
  nodeKey: string,
): ReplaceChildrenMutation {
  if (nodeKey === document.rootKey) {
    throw new SourceMutationError('invalid-target', 'The source root cannot be removed.');
  }
  const parentKey = findSourceParentKey(document, nodeKey);
  if (!parentKey) {
    throw new SourceMutationError('invalid-target', `Source node ${nodeKey} is not attached.`);
  }
  const parent = requireParentNode(document, parentKey);
  return createReplaceChildrenMutation(
    document,
    parentKey,
    parent.childKeys.filter((key) => key !== nodeKey),
  );
}

export function createUnwrapNodeMutation(
  document: SourceDocument,
  nodeKey: string,
): ReplaceChildrenMutation {
  const node = requireParentNode(document, nodeKey);
  if (node.kind === 'root') {
    throw new SourceMutationError('invalid-target', 'The source root cannot be unwrapped.');
  }
  const parentKey = findSourceParentKey(document, nodeKey);
  if (!parentKey) {
    throw new SourceMutationError('invalid-target', `Source node ${nodeKey} is not attached.`);
  }
  const parent = requireParentNode(document, parentKey);
  const index = parent.childKeys.indexOf(nodeKey);
  return createReplaceChildrenMutation(document, parentKey, [
    ...parent.childKeys.slice(0, index),
    ...node.childKeys,
    ...parent.childKeys.slice(index + 1),
  ]);
}

function applyReplaceText(
  document: SourceDocument,
  nodes: SourceNodeMapOverlayBuilder,
  mutation: ReplaceTextMutation,
): SourceMutation {
  const node = requireTextNode({ ...document, nodes }, mutation.nodeKey);
  const actualText = node.value.slice(mutation.from, mutation.to);
  if (actualText !== mutation.expectedText) {
    throw new SourceMutationError(
      'stale-source',
      `Source text ${mutation.nodeKey} changed before the mutation was applied.`,
    );
  }
  const nextValue = node.value.slice(0, mutation.from) +
    mutation.value +
    node.value.slice(mutation.to);
  nodes.set(node.key, { ...node, value: nextValue });
  return {
    type: 'replace-text',
    nodeKey: mutation.nodeKey,
    from: mutation.from,
    to: mutation.from + mutation.value.length,
    value: mutation.expectedText,
    expectedText: mutation.value,
  };
}

function applyReplaceChildren(
  document: SourceDocument,
  nodes: SourceNodeMapOverlayBuilder,
  mutation: ReplaceChildrenMutation,
  cleanup?: SourceNodeCleanup,
): SourceMutation {
  const parent = requireParentNode({ ...document, nodes }, mutation.parentKey);
  if (!sameSourceKeys(parent.childKeys, mutation.expectedChildKeys)) {
    throw new SourceMutationError(
      'stale-source',
      `Source children of ${mutation.parentKey} changed before the mutation was applied.`,
    );
  }
  if (new Set(mutation.childKeys).size !== mutation.childKeys.length) {
    throw new SourceMutationError('invalid-tree', `Source parent ${mutation.parentKey} contains duplicate children.`);
  }
  mutation.childKeys.forEach((key) => requireNode({ ...document, nodes }, key));
  cleanup?.trackChildren(nodes, parent.childKeys, mutation.childKeys);
  nodes.set(parent.key, { ...parent, childKeys: [...mutation.childKeys] });
  return {
    type: 'replace-children',
    parentKey: mutation.parentKey,
    childKeys: [...parent.childKeys],
    expectedChildKeys: [...mutation.childKeys],
  };
}

function sameSourceNode(
  left: SourceNode | undefined,
  right: SourceNode | undefined,
) {
  return left === right || JSON.stringify(left) === JSON.stringify(right);
}

function applyReplaceNodes(
  nodes: SourceNodeMapOverlayBuilder,
  mutation: ReplaceNodesMutation,
  cleanup?: SourceNodeCleanup,
): SourceMutation {
  const inverse: SourceNodeReplacement[] = [];
  for (const replacement of mutation.replacements) {
    const actual = nodes.get(replacement.key);
    if (!sameSourceNode(actual, replacement.expected)) {
      throw new SourceMutationError(
        'stale-source',
        `Source node ${replacement.key} changed before the replacement was applied.`,
      );
    }
    cleanup?.trackReplacement(nodes, replacement.key, replacement.value);
    if (replacement.value) {
      nodes.set(replacement.key, replacement.value);
    } else {
      nodes.delete(replacement.key);
    }
    inverse.unshift({
      key: replacement.key,
      expected: replacement.value,
      value: actual,
    });
  }
  return {
    type: 'replace-nodes',
    replacements: inverse,
  };
}

function validateReachableTree(document: SourceDocument) {
  const active = new Set<string>();
  const parentByChild = new Map<string, string>();

  const visit = (key: string) => {
    if (active.has(key)) {
      throw new SourceMutationError('invalid-tree', `Source tree contains a cycle at ${key}.`);
    }
    const node = requireNode(document, key);
    if (!isSourceParentNode(node)) {
      return;
    }
    active.add(key);
    for (const childKey of node.childKeys) {
      if (childKey === document.rootKey) {
        throw new SourceMutationError('invalid-tree', 'The source root cannot be a child node.');
      }
      const knownParent = parentByChild.get(childKey);
      if (knownParent && knownParent !== key) {
        throw new SourceMutationError(
          'invalid-tree',
          `Source node ${childKey} is attached to both ${knownParent} and ${key}.`,
        );
      }
      parentByChild.set(childKey, key);
      visit(childKey);
    }
    active.delete(key);
  };

  visit(document.rootKey);
  return parentByChild;
}

function applyMutationBatch(
  document: SourceDocument,
  batch: SourceMutationBatch,
  cleanup?: SourceNodeCleanup,
): CleanedSourceMutationBatch {
  const nodes = new SourceNodeMapOverlayBuilder(document.nodes);
  const inverseMutations: SourceMutation[] = [];

  for (const mutation of batch.mutations) {
    const inverse = mutation.type === 'replace-text'
      ? applyReplaceText(document, nodes, mutation)
      : mutation.type === 'replace-children'
        ? applyReplaceChildren(document, nodes, mutation, cleanup)
        : applyReplaceNodes(nodes, mutation, cleanup);
    inverseMutations.unshift(inverse);
  }

  const stagedDocument: SourceDocument = {
    ...document,
    nodes,
    revision: document.revision + 1,
  };
  const parents = validateReachableTree(stagedDocument);
  let forward = batch;
  const detachedKeys = cleanup?.detachedKeys(nodes, parents, document.rootKey) ?? [];
  if (detachedKeys.length) {
    const removal = createReplaceNodesMutation(
      stagedDocument,
      detachedKeys.map((key) => ({ key })),
    );
    // Replay stores explicit removals. Undo restores the nodes before inverse
    // child-list mutations can reference them again.
    inverseMutations.unshift(applyReplaceNodes(nodes, removal));
    forward = { ...batch, mutations: [...batch.mutations, removal] };
  }

  return {
    document: { ...stagedDocument, nodes: nodes.finish() },
    forward,
    inverse: {
      operationId: batch.operationId,
      mutations: inverseMutations,
    },
  };
}

/** Low-level replay/staging also permits temporarily detached nodes. */
export function applySourceMutationBatch(
  document: SourceDocument,
  batch: SourceMutationBatch,
): AppliedSourceMutationBatch {
  const { document: nextDocument, inverse } = applyMutationBatch(document, batch);
  return { document: nextDocument, inverse };
}

/** Prepare a committed edit, including explicit, reversible orphan removals.
 * SourceMutationStep must store the returned forward batch for exact replay. */
export function applySourceMutationBatchWithCleanup(
  document: SourceDocument,
  batch: SourceMutationBatch,
): CleanedSourceMutationBatch {
  return applyMutationBatch(document, batch, new SourceNodeCleanup());
}

export function createSourceMutationBatch(
  mutations: readonly SourceMutation[],
  operationId = createSourceOperationId(),
): SourceMutationBatch {
  return {
    operationId,
    mutations: [...mutations],
  };
}
