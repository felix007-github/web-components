import {
  createSourceNodeMapOverlay,
  findSourceParentKey,
  getSourceParentNode,
  isSourceParentNode,
  type SourceDocument,
  type SourceNode,
} from './model';

/** Keep source identities and parser context without copying the node map. */
export function createSourceProjectionDocument(
  document: SourceDocument,
  parentKey: string,
  childKeys: readonly string[],
  limitToChildren: boolean,
): SourceDocument {
  const root = getSourceParentNode(document, document.rootKey);
  const replacements = new Map<string, SourceNode>([[root.key, {
    ...root,
    childKeys: parentKey === root.key ? [...childKeys] : [parentKey],
  }]]);
  if (limitToChildren && parentKey !== root.key) {
    const parent = getSourceParentNode(document, parentKey);
    replacements.set(parent.key, { ...parent, childKeys: [...childKeys] });
  }
  return { ...document, nodes: createSourceNodeMapOverlay(document.nodes, replacements) };
}

/** Retain the ancestor tags needed to parse list items, cells and review nodes.
 * Only the selected subtree is complete; ancestors contain the path to it. */
export function createSourceSubtreeProjectionDocument(
  document: SourceDocument,
  sourceKey: string,
): SourceDocument | undefined {
  const replacements = new Map<string, SourceNode>();
  const visited = new Set<string>();
  let childKey = sourceKey;
  while (childKey !== document.rootKey) {
    if (visited.has(childKey)) return undefined;
    visited.add(childKey);
    const parentKey = findSourceParentKey(document, childKey);
    if (!parentKey) return undefined;
    const parent = getSourceParentNode(document, parentKey);
    replacements.set(parentKey, { ...parent, childKeys: [childKey] });
    childKey = parentKey;
  }
  return { ...document, nodes: createSourceNodeMapOverlay(document.nodes, replacements) };
}

export function collectSourceSubtreeKeys(document: SourceDocument, rootKeys: Iterable<string>) {
  const collected = new Set<string>();
  const pending = Array.from(rootKeys);
  while (pending.length) {
    const key = pending.pop()!;
    if (collected.has(key)) continue;
    const node = document.nodes.get(key);
    if (!node) continue;
    collected.add(key);
    if (isSourceParentNode(node)) pending.push(...node.childKeys);
  }
  return collected;
}
