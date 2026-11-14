import { isSourceParentNode, type SourceNode } from './model';

/** Track only nodes touched or detached by a batch; temporary moves stay valid
 * until the final tree has been validated. */
export class SourceNodeCleanup {
  private readonly candidates = new Set<string>();
  private readonly expanded = new WeakSet<SourceNode>();

  trackChildren(
    nodes: ReadonlyMap<string, SourceNode>,
    before: readonly string[],
    after: readonly string[],
  ) {
    if (before === after) return;
    const retained = new Set(after);
    const pending = before.filter((key) => !retained.has(key));
    while (pending.length) {
      const key = pending.pop()!;
      const node = nodes.get(key);
      if (!node || this.expanded.has(node)) continue;
      this.expanded.add(node);
      this.candidates.add(key);
      if (isSourceParentNode(node)) {
        for (const child of node.childKeys) pending.push(child);
      }
    }
  }

  trackReplacement(
    nodes: ReadonlyMap<string, SourceNode>,
    key: string,
    next: SourceNode | undefined,
  ) {
    this.candidates.add(key);
    const previous = nodes.get(key);
    if (previous && isSourceParentNode(previous)) {
      this.trackChildren(
        nodes,
        previous.childKeys,
        next && isSourceParentNode(next) ? next.childKeys : [],
      );
    }
  }

  detachedKeys(
    nodes: ReadonlyMap<string, SourceNode>,
    parents: ReadonlyMap<string, string>,
    rootKey: string,
  ) {
    return Array.from(this.candidates).filter(
      (key) => key !== rootKey && !parents.has(key) && nodes.has(key),
    );
  }
}
