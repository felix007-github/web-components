import type { SourceNode, SourceParentNode } from './model';

type SourceNodes = ReadonlyMap<string, SourceNode>;
type ParentChanges = ReadonlyMap<string, string | undefined>;

const parentIndexChangeLimit = 1024;
const parentIndexDetachLimit = 64;

// Keep one sparse overlay rather than retaining a chain of document snapshots.
class ParentLinks {
  constructor(
    private readonly base: ReadonlyMap<string, string>,
    private readonly changes: ParentChanges = new Map(),
  ) {}

  get(key: string) {
    return this.changes.has(key) ? this.changes.get(key) : this.base.get(key);
  }

  withChanges(changes: ParentChanges) {
    const merged = new Map(this.changes);
    changes.forEach((value, key) => {
      if (value === this.base.get(key)) merged.delete(key);
      else merged.set(key, value);
    });
    if (merged.size < parentIndexChangeLimit) return new ParentLinks(this.base, merged);
    const compacted = new Map(this.base);
    merged.forEach((value, key) => {
      if (value === undefined) compacted.delete(key);
      else compacted.set(key, value);
    });
    return new ParentLinks(compacted);
  }
}

type ParentIndex = {
  parents: ParentLinks;
};

// Published node maps are immutable. Root identity also matters for subtree views.
const indexes = new WeakMap<SourceNodes, Map<string, ParentIndex>>();

function isParent(node: SourceNode | undefined): node is SourceParentNode {
  return node?.kind === 'root' || node?.kind === 'element';
}

function buildIndex(nodes: SourceNodes, rootKey: string): ParentIndex {
  const parents = new Map<string, string>();
  const visited = new Set<string>();
  const pending = [rootKey];
  while (pending.length) {
    const key = pending.pop()!;
    if (visited.has(key)) continue;
    visited.add(key);
    const node = nodes.get(key);
    if (!node) throw new Error(`Source node ${key} was not found.`);
    if (!isParent(node)) continue;
    for (const childKey of node.childKeys) {
      if (childKey !== rootKey && !parents.has(childKey)) {
        parents.set(childKey, key);
      }
      pending.push(childKey);
    }
  }
  return { parents: new ParentLinks(parents) };
}

export function findIndexedSourceParent(nodes: SourceNodes, rootKey: string, childKey: string) {
  if (childKey === rootKey || !nodes.has(childKey)) return undefined;
  let roots = indexes.get(nodes);
  if (!roots) {
    roots = new Map();
    indexes.set(nodes, roots);
  }
  let index = roots.get(rootKey);
  if (!index) {
    index = buildIndex(nodes, rootKey);
    roots.set(rootKey, index);
  }
  return index.parents.get(childKey);
}

function updateIndex(
  index: ParentIndex,
  base: SourceNodes,
  changes: ReadonlyMap<string, SourceNode | undefined>,
  rootKey: string,
): ParentIndex | undefined {
  const updates = new Map<string, string | undefined>();
  const detachments: string[] = [];
  const attachments: [string, string][] = [];

  for (const [key, next] of changes) {
    const previous = base.get(key);
    // Changes outside this root's view cannot steal its children's parent links.
    // Newly attached parents are indexed by the subtree walk below instead.
    if (key !== rootKey && index.parents.get(key) === undefined) continue;
    if (!next) detachments.push(key);
    const before = isParent(previous) ? previous.childKeys : [];
    const after = isParent(next) ? next.childKeys : [];
    if (before === after || (before.length === after.length && before.every((child, i) => child === after[i]))) continue;
    // Temporary projection views can exclude almost the whole document. It is
    // cheaper to index their small live subtree than to tombstone every sibling.
    if (before.length - after.length > parentIndexDetachLimit) return undefined;
    const retained = new Set(after);
    for (const childKey of before) {
      if (!retained.has(childKey) && index.parents.get(childKey) === key) {
        detachments.push(childKey);
      }
    }
    for (const childKey of after) {
      if (index.parents.get(childKey) !== key) attachments.push([childKey, key]);
    }
  }

  // Remove whole detached subtrees, then attach from parents still in this view.
  // This keeps membership exact without rechecking ancestors on every query.
  const detached = new Set<string>();
  while (detachments.length) {
    const key = detachments.pop()!;
    if (key === rootKey || detached.has(key)) continue;
    detached.add(key);
    if (detached.size > parentIndexDetachLimit) return undefined;
    updates.set(key, undefined);
    const node = base.get(key);
    if (isParent(node)) {
      for (const childKey of node.childKeys) detachments.push(childKey);
    }
  }

  const attached = new Set<string>();
  for (const [childKey, parentKey] of attachments) {
    const parent = updates.has(parentKey) ? updates.get(parentKey) : index.parents.get(parentKey);
    if (parentKey !== rootKey && parent === undefined) continue;
    const pending: [string, string][] = [[childKey, parentKey]];
    while (pending.length) {
      const [key, owner] = pending.pop()!;
      if (key === rootKey || attached.has(key)) continue;
      attached.add(key);
      updates.set(key, owner);
      const node = changes.has(key) ? changes.get(key) : base.get(key);
      if (isParent(node)) {
        // An existing orphan may never have been indexed; attach its subtree too.
        for (const child of node.childKeys) pending.push([child, key]);
      }
    }
  }

  updates.forEach((parent, key) => {
    if (parent === index.parents.get(key)) updates.delete(key);
  });
  if (!updates.size) return index;
  return {
    parents: index.parents.withChanges(updates),
  };
}

export function inheritSourceParentIndexes(
  base: SourceNodes,
  next: SourceNodes,
  changes: ReadonlyMap<string, SourceNode | undefined>,
) {
  const roots = indexes.get(base);
  if (!roots || next === base) return;
  const inherited = new Map<string, ParentIndex>();
  roots.forEach((index, rootKey) => {
    const updated = updateIndex(index, base, changes, rootKey);
    if (updated) inherited.set(rootKey, updated);
  });
  if (inherited.size) indexes.set(next, inherited);
}
