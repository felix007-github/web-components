import type { Node as ProseMirrorNode } from 'prosemirror-model';
import { GENERATED_CONTAINER_PARAGRAPH_ATTRIBUTE } from './constants';
import {
  htmlElementTag,
  isHtmlBlockElement,
  isHtmlBlockVoidTag,
  isHtmlRawTag,
} from './html-content-model';

const STRICT_STRUCTURE_TAGS = new Set([
  'colgroup',
  'ol',
  'table',
  'tbody',
  'tfoot',
  'thead',
  'tr',
  'ul',
]);

const INLINE_CONTENT_BLOCK_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'para',
  'pre',
]);

type ContainerPolicy = {
  isContentBlock?: (element: HTMLElement) => boolean;
  exclude?: (element: HTMLElement) => boolean;
};
function isDirectContentBlockNode(node: Node, policy: ContainerPolicy) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  const tagName = htmlElementTag(node);
  return (
    isHtmlBlockElement(node) ||
    isHtmlRawTag(tagName) ||
    policy.isContentBlock?.(node)
  );
}

function acceptsGeneratedParagraphs(
  element: HTMLElement,
  policy: ContainerPolicy
) {
  const tag = htmlElementTag(element);
  if (
    policy.exclude?.(element) ||
    STRICT_STRUCTURE_TAGS.has(tag) ||
    INLINE_CONTENT_BLOCK_TAGS.has(tag) ||
    isHtmlRawTag(tag) ||
    isHtmlBlockVoidTag(tag)
  ) {
    return false;
  }
  return (
    tag === 'li' || tag === 'td' || tag === 'th' || isHtmlBlockElement(element)
  );
}

/**
 * Lunar block containers only accept block children, while HTML permits
 * contiguous inline runs in many flow containers. These paragraphs exist only
 * in the editor projection and are removed during serialization.
 */
export function wrapDirectContainerInlineContent(
  root: ParentNode,
  policy: ContainerPolicy = {}
) {
  Array.from(root.querySelectorAll<HTMLElement>('*'))
    .filter((element) => acceptsGeneratedParagraphs(element, policy))
    .forEach((container) => {
      let inlineRun: Node[] = [];

      const flushInlineRun = () => {
        const hasContent = inlineRun.some(
          (node) =>
            node instanceof HTMLElement || Boolean(node.textContent?.trim())
        );
        if (!hasContent) {
          inlineRun = [];
          return;
        }

        const paragraph = document.createElement('p');
        paragraph.setAttribute(GENERATED_CONTAINER_PARAGRAPH_ATTRIBUTE, 'true');
        container.insertBefore(paragraph, inlineRun[0]);
        inlineRun.forEach((node) => paragraph.appendChild(node));
        inlineRun = [];
      };

      Array.from(container.childNodes).forEach((node) => {
        // ProseMirror does not represent comments. Wrapping one would leave an
        // empty generated paragraph after DOM parsing.
        if (node.nodeType === Node.COMMENT_NODE) {
          return;
        }
        if (isDirectContentBlockNode(node, policy)) {
          flushInlineRun();
          return;
        }
        inlineRun.push(node);
      });
      flushInlineRun();
    });
}

export function unwrapGeneratedContainerParagraphs(value: string) {
  const template = document.createElement('template');
  template.innerHTML = value;
  template.content
    .querySelectorAll<HTMLElement>(
      `p[${GENERATED_CONTAINER_PARAGRAPH_ATTRIBUTE}]`
    )
    .forEach((paragraph) => {
      const parent = paragraph.parentNode;
      if (!parent) {
        return;
      }
      while (paragraph.firstChild) {
        parent.insertBefore(paragraph.firstChild, paragraph);
      }
      paragraph.remove();
    });
  return template.innerHTML;
}

export function isGeneratedContainerParagraph(node: ProseMirrorNode) {
  return (
    node.type.name === 'paragraph' &&
    node.attrs?.htmlAttrs?.[GENERATED_CONTAINER_PARAGRAPH_ATTRIBUTE] === 'true'
  );
}
