import { findIndexedSourceParent, inheritSourceParentIndexes } from './parent-index';

export type SourceRange = {
  from: number;
  to: number;
};

export type SourceDiagnostic = {
  code: string;
  message: string;
  range?: SourceRange;
  severity: 'warning' | 'error';
};

type SourceNodeBase = {
  key: string;
  origin: 'parsed' | 'implicit' | 'inserted';
  originalParentKey?: string;
  sourceRange?: SourceRange;
};

type SourceParentFields = {
  childKeys: readonly string[];
  originalChildKeys: readonly string[];
};

export type SourceRootNode = SourceNodeBase & SourceParentFields & {
  kind: 'root';
  mode: 'document' | 'fragment';
};

export type SourceAttribute = {
  name: string;
  value: string;
  namespace?: string;
  prefix?: string;
  sourceRange?: SourceRange;
};

export type SourceElementNode = SourceNodeBase & SourceParentFields & {
  kind: 'element';
  tagName: string;
  namespaceUri: string;
  attributes: readonly SourceAttribute[];
  startTagRange?: SourceRange;
  endTagRange?: SourceRange;
};

export type SourceTextNode = SourceNodeBase & {
  kind: 'text';
  value: string;
  originalValue: string;
};

export type SourceCommentNode = SourceNodeBase & {
  kind: 'comment';
  value: string;
  originalValue: string;
};

export type SourceDoctypeNode = SourceNodeBase & {
  kind: 'doctype';
  name: string;
  publicId: string;
  systemId: string;
};

export type SourceNode =
  | SourceRootNode
  | SourceElementNode
  | SourceTextNode
  | SourceCommentNode
  | SourceDoctypeNode;

export type SourceParentNode = SourceRootNode | SourceElementNode;

export type SourceDocument = {
  source: string;
  rootKey: string;
  nodes: ReadonlyMap<string, SourceNode>;
  diagnostics: readonly SourceDiagnostic[];
  revision: number;
};

const sourceNodeMapOverlayChangeLimit = 1024;

class SourceNodeMapOverlay implements ReadonlyMap<string, SourceNode> {
  readonly size: number;
  readonly changeCount: number;

  constructor(
    private readonly base: ReadonlyMap<string, SourceNode>,
    private readonly changes: ReadonlyMap<string, SourceNode | undefined>,
    readonly depth: number,
  ) {
    this.changeCount = changes.size;
    let size = base.size;
    changes.forEach((value, key) => {
      const existed = base.has(key);
      if (value === undefined && existed) {
        size -= 1;
      } else if (value !== undefined && !existed) {
        size += 1;
      }
    });
    this.size = size;
  }

  get(key: string) {
    return this.changes.has(key)
      ? this.changes.get(key)
      : this.base.get(key);
  }

  has(key: string) {
    return this.changes.has(key)
      ? this.changes.get(key) !== undefined
      : this.base.has(key);
  }

  withChanges(changes: ReadonlyMap<string, SourceNode | undefined>) {
    const merged = new Map(this.changes);
    changes.forEach((value, key) => merged.set(key, value));
    // Merge only the sparse changes. Chaining an overlay per keystroke makes
    // every unchanged-node lookup walk the whole editing history.
    if (merged.size < sourceNodeMapOverlayChangeLimit) {
      return new SourceNodeMapOverlay(this.base, merged, 1);
    }
    const compacted = new Map(this.base);
    merged.forEach((value, key) => {
      if (value === undefined) compacted.delete(key);
      else compacted.set(key, value);
    });
    return compacted;
  }

  *entries(): MapIterator<[string, SourceNode]> {
    for (const [key, value] of this.base) {
      if (!this.changes.has(key)) {
        yield [key, value];
        continue;
      }
      const replacement = this.changes.get(key);
      if (replacement !== undefined) {
        yield [key, replacement];
      }
    }
    for (const [key, value] of this.changes) {
      if (value !== undefined && !this.base.has(key)) {
        yield [key, value];
      }
    }
  }

  *keys(): MapIterator<string> {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  *values(): MapIterator<SourceNode> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  forEach(
    callbackfn: (value: SourceNode, key: string, map: ReadonlyMap<string, SourceNode>) => void,
    thisArg?: unknown,
  ) {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

export function getSourceNodeMapOverlayDepth(nodes: ReadonlyMap<string, SourceNode>) {
  return nodes instanceof SourceNodeMapOverlay ? nodes.depth : 0;
}

export function getSourceNodeMapOverlayChangeCount(nodes: ReadonlyMap<string, SourceNode>) {
  return nodes instanceof SourceNodeMapOverlay ? nodes.changeCount : 0;
}

export function createSourceNodeMapOverlay(
  base: ReadonlyMap<string, SourceNode>,
  changes: ReadonlyMap<string, SourceNode | undefined>,
): ReadonlyMap<string, SourceNode> {
  if (!changes.size) {
    return base;
  }
  const next = base instanceof SourceNodeMapOverlay
    ? base.withChanges(changes)
    : new SourceNodeMapOverlay(base, new Map(changes), 1);
  inheritSourceParentIndexes(base, next, changes);
  return next;
}

export class SourceNodeMapOverlayBuilder implements ReadonlyMap<string, SourceNode> {
  private readonly changes = new Map<string, SourceNode | undefined>();
  private view?: ReadonlyMap<string, SourceNode>;

  constructor(private readonly base: ReadonlyMap<string, SourceNode>) {}

  get size() {
    return this.finish().size;
  }

  get(key: string) {
    return this.changes.has(key)
      ? this.changes.get(key)
      : this.base.get(key);
  }

  has(key: string) {
    return this.changes.has(key)
      ? this.changes.get(key) !== undefined
      : this.base.has(key);
  }

  set(key: string, value: SourceNode) {
    this.view = undefined;
    this.changes.set(key, value);
    return this;
  }

  delete(key: string) {
    this.view = undefined;
    const existed = this.has(key);
    this.changes.set(key, undefined);
    return existed;
  }

  entries() {
    return this.finish().entries();
  }

  keys() {
    return this.finish().keys();
  }

  values() {
    return this.finish().values();
  }

  forEach(
    callbackfn: (value: SourceNode, key: string, map: ReadonlyMap<string, SourceNode>) => void,
    thisArg?: unknown,
  ) {
    const view = this.finish();
    view.forEach((value, key) => callbackfn.call(thisArg, value, key, this));
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  finish() {
    return this.view ??= createSourceNodeMapOverlay(this.base, this.changes);
  }
}

let insertedSourceKeySequence = 0;

export function createInsertedSourceKey(
  document: SourceDocument,
  kind: string,
  reservedKeys: ReadonlySet<string> = new Set(),
) {
  let key: string;
  do {
    insertedSourceKeySequence += 1;
    key = `inserted:${kind}:${Date.now().toString(36)}:${insertedSourceKeySequence.toString(36)}`;
  } while (document.nodes.has(key) || reservedKeys.has(key));
  return key;
}

export function isSourceParentNode(node: SourceNode): node is SourceParentNode {
  return node.kind === 'root' || node.kind === 'element';
}

export function getSourceNode(document: SourceDocument, key: string): SourceNode {
  const node = document.nodes.get(key);
  if (!node) {
    throw new Error(`Source node ${key} was not found.`);
  }
  return node;
}

export function getSourceParentNode(document: SourceDocument, key: string): SourceParentNode {
  const node = getSourceNode(document, key);
  if (!isSourceParentNode(node)) {
    throw new Error(`Source node ${key} cannot contain children.`);
  }
  return node;
}

export function findSourceParentKey(document: SourceDocument, childKey: string) {
  const nodes = document.nodes instanceof SourceNodeMapOverlayBuilder
    ? document.nodes.finish()
    : document.nodes;
  return findIndexedSourceParent(nodes, document.rootKey, childKey);
}

export function sameSourceKeys(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}
