/** Verify scoped source projections before applying reconciliation steps. */
import { Fragment, type Node as ProseMirrorNode } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { projectLunarSourceDocument } from '../../schema/index';
import { isGeneratedContainerParagraph } from '../../schema/generated-container';
import type { SourceDocument } from '../model';
import { createSourceProjectionDocument } from '../scoped-projection';
import { findProjectedParent, collectDirectChildPositions, getContiguousChildRange } from './range';

function getStableParentProjectionPlacement(
  currentDoc: ProseMirrorNode,
  projectionDoc: ProseMirrorNode,
  sourceDocument: SourceDocument,
  stableParentKey: string,
  previousChildKeys: ReadonlySet<string>,
  nextChildKeys: ReadonlySet<string>,
) {
  const currentParent = findProjectedParent(currentDoc, sourceDocument, stableParentKey);
  const projectedParent = findProjectedParent(projectionDoc, sourceDocument, stableParentKey);
  if (!currentParent || !projectedParent) {
    return { matches: false, positionOffset: 0 };
  }

  const currentChildren = collectDirectChildPositions(
    currentParent.node,
    currentParent.contentFrom,
  );
  const projectedChildren = collectDirectChildPositions(
    projectedParent.node,
    projectedParent.contentFrom,
  );
  if (!nextChildKeys.size) {
    const hasRemovedChild = [...currentChildren, ...projectedChildren].some((child) =>
      previousChildKeys.has(child.node.attrs?.sourceKey),
    );
    return { matches: !hasRemovedChild, positionOffset: 0 };
  }

  let currentRange = getContiguousChildRange(currentChildren, nextChildKeys);
  let projectedRange = getContiguousChildRange(projectedChildren, nextChildKeys);
  if (
    (!currentRange || !projectedRange) &&
    [...currentChildren, ...projectedChildren].some((child) =>
      isGeneratedContainerParagraph(child.node),
    )
  ) {
    currentRange = {
      from: currentParent.contentFrom,
      to: currentParent.contentFrom + currentParent.node.content.size,
      nodes: currentChildren.map((child) => child.node),
    };
    projectedRange = {
      from: projectedParent.contentFrom,
      to: projectedParent.contentFrom + projectedParent.node.content.size,
      nodes: projectedChildren.map((child) => child.node),
    };
  }
  if (!currentRange || !projectedRange) {
    return { matches: false, positionOffset: 0 };
  }
  return {
    matches: Fragment.fromArray(currentRange.nodes).eq(Fragment.fromArray(projectedRange.nodes)),
    positionOffset: currentRange.from - projectedRange.from,
  };
}

function reconcileStableParentProjection(
  transform: Transform,
  projectionDoc: ProseMirrorNode,
  sourceDocument: SourceDocument,
  stableParentKey: string,
  previousChildKeys: ReadonlySet<string>,
  nextChildKeys: ReadonlySet<string>,
) {
  const currentParent = findProjectedParent(transform.doc, sourceDocument, stableParentKey);
  const projectedParent = findProjectedParent(projectionDoc, sourceDocument, stableParentKey);
  if (!currentParent || !projectedParent) {
    return false;
  }

  const currentChildren = collectDirectChildPositions(
    currentParent.node,
    currentParent.contentFrom,
  );
  const projectedChildren = collectDirectChildPositions(
    projectedParent.node,
    projectedParent.contentFrom,
  );
  let currentRange = getContiguousChildRange(
    currentChildren,
    new Set([...previousChildKeys, ...nextChildKeys]),
  );
  let projectedRange = getContiguousChildRange(projectedChildren, nextChildKeys);
  if (
    (!currentRange || !projectedRange) &&
    [...currentChildren, ...projectedChildren].some((child) =>
      isGeneratedContainerParagraph(child.node),
    )
  ) {
    currentRange = {
      from: currentParent.contentFrom,
      to: currentParent.contentFrom + currentParent.node.content.size,
      nodes: currentChildren.map((child) => child.node),
    };
    projectedRange = {
      from: projectedParent.contentFrom,
      to: projectedParent.contentFrom + projectedParent.node.content.size,
      nodes: projectedChildren.map((child) => child.node),
    };
  }
  if (!currentRange) {
    return false;
  }
  const replacement = Fragment.fromArray(projectedRange?.nodes || []);
  const currentFragment = Fragment.fromArray(currentRange.nodes);
  if (!currentFragment.eq(replacement)) {
    const currentNode = currentRange.nodes.length === 1 ? currentRange.nodes[0] : undefined;
    const projectedNode = projectedRange?.nodes.length === 1 ? projectedRange.nodes[0] : undefined;
    const diffStart =
      currentNode && projectedNode && currentNode.sameMarkup(projectedNode)
        ? currentNode.content.findDiffStart(projectedNode.content)
        : null;
    const diffEnd =
      diffStart === null ? null : currentNode!.content.findDiffEnd(projectedNode!.content);

    if (diffStart !== null && diffEnd) {
      let currentDiffTo = diffEnd.a;
      let projectedDiffTo = diffEnd.b;
      if (currentDiffTo < diffStart && currentNode!.content.size < projectedNode!.content.size) {
        projectedDiffTo = diffStart + projectedDiffTo - currentDiffTo;
        currentDiffTo = diffStart;
      } else if (projectedDiffTo < diffStart) {
        currentDiffTo = diffStart + currentDiffTo - projectedDiffTo;
        projectedDiffTo = diffStart;
      }
      const contentFrom = currentRange.from + 1;
      transform.replaceWith(
        contentFrom + diffStart,
        contentFrom + currentDiffTo,
        projectedNode!.content.cut(diffStart, projectedDiffTo),
      );
    } else {
      transform.replaceWith(currentRange.from, currentRange.to, replacement);
    }
  }
  return true;
}

export function projectStructuralScope(
  transform: Transform,
  document: SourceDocument,
  parentKey: string,
  previousChildKeys: ReadonlySet<string>,
  childKeys: readonly string[],
  rebuildGeneratedContainerParent: boolean,
) {
  const nextChildKeys = new Set(childKeys);
  // Start with the changed children. Generated container paragraphs can depend
  // on their siblings, so keep the complete stable parent in that case.
  const scopes = rebuildGeneratedContainerParent ? [false] : [true, false];
  for (const limitToChildren of scopes) {
    const projection = projectLunarSourceDocument(
      createSourceProjectionDocument(document, parentKey, childKeys, limitToChildren),
      transform.doc.type.schema,
    );
    const reconciliation = new Transform(transform.doc);
    let placement = getStableParentProjectionPlacement(
      reconciliation.doc,
      projection.doc,
      document,
      parentKey,
      previousChildKeys,
      nextChildKeys,
    );
    if (!placement.matches) {
      reconcileStableParentProjection(
        reconciliation,
        projection.doc,
        document,
        parentKey,
        previousChildKeys,
        nextChildKeys,
      );
      placement = getStableParentProjectionPlacement(
        reconciliation.doc,
        projection.doc,
        document,
        parentKey,
        previousChildKeys,
        nextChildKeys,
      );
    }
    if (placement.matches) {
      reconciliation.steps.forEach((step) => transform.step(step));
      return { projection, positionOffset: placement.positionOffset };
    }
    // Both modes are identical at the source root.
    if (parentKey === document.rootKey) break;
  }
  return undefined;
}
