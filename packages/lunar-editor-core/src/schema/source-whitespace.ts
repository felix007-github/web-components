import type { SourceDomTextBinding } from '../source/dom-projection';
import type { SourceDocument } from '../source/model';
import { SOURCE_TEXT_BLOCK_TAGS } from './constants';

export const sourceWhitespaceBlocks = new WeakSet<HTMLElement>();

function getLastTextNode(node: Node): Text | undefined {
  for (let index = node.childNodes.length - 1; index >= 0; index -= 1) {
    const child = node.childNodes[index];
    if (child.nodeType === Node.TEXT_NODE && child.textContent) {
      return child as Text;
    }
    const nested = getLastTextNode(child);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function findTextBlock(node: Text) {
  let parent = node.parentElement;
  while (
    parent &&
    !SOURCE_TEXT_BLOCK_TAGS.has(parent.localName.toLowerCase())
  ) {
    parent = parent.parentElement;
  }
  return parent || undefined;
}

export function preserveSourceWhitespace(
  sourceDocument: SourceDocument,
  bindings: readonly SourceDomTextBinding[]
) {
  bindings.forEach((binding) => {
    const block = findTextBlock(binding.node);
    const blockText = block?.textContent || '';
    const sourceNode = sourceDocument.nodes.get(binding.sourceKey);
    const isEditedText =
      sourceNode?.kind === 'text' &&
      (sourceNode.origin === 'inserted' ||
        sourceNode.value !== sourceNode.originalValue);
    const hasTrailingWhitespace =
      /[ ]+$/.test(binding.node.data) &&
      block &&
      getLastTextNode(block) === binding.node;
    const hasEditedCollapsibleWhitespace =
      isEditedText &&
      (/^ /.test(blockText) || / {2,}/.test(blockText) || / $/.test(blockText));
    if (
      !block ||
      sourceWhitespaceBlocks.has(block) ||
      (!hasTrailingWhitespace && !hasEditedCollapsibleWhitespace) ||
      !/\S/.test(blockText) ||
      /[\r\n\t\f]/.test(blockText)
    ) {
      return;
    }

    sourceWhitespaceBlocks.add(block);
  });
}
