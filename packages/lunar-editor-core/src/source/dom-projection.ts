import {
  getSourceNode,
  getSourceParentNode,
  type SourceDocument,
} from './model';
import { serializeSourceDocument } from './serializer';

export type SourceDomTextBinding = {
  node: Text;
  sourceKey: string;
};

export type SourceDomProjection = {
  root: DocumentFragment;
  textBindings: readonly SourceDomTextBinding[];
};

const domSourceKeys = new WeakMap<Node, string>();

export function getDomSourceKey(node: Node) {
  return domSourceKeys.get(node);
}

function createTemporaryAttributeName(source: string) {
  const lowerSource = source.toLowerCase();
  let suffix = 0;
  let name = 'data-lunar-source-ref';
  while (lowerSource.includes(name)) {
    suffix += 1;
    name = `data-lunar-source-ref-${suffix}`;
  }
  return name;
}

function visitElements(root: ParentNode, visit: (element: HTMLElement) => void) {
  root.querySelectorAll<HTMLElement>('*').forEach((element) => {
    visit(element);
    if (element instanceof HTMLTemplateElement) {
      visitElements(element.content, visit);
    }
  });
}

function bindElementKeys(root: ParentNode, attributeName: string) {
  visitElements(root, (element) => {
    const encodedKey = element.getAttribute(attributeName);
    if (encodedKey === null) {
      return;
    }
    domSourceKeys.set(element, decodeURIComponent(encodedKey));
    element.removeAttribute(attributeName);
  });
}

function getDomContentParent(element: HTMLElement): ParentNode {
  return element instanceof HTMLTemplateElement ? element.content : element;
}

function bindDirectTextNodes(
  document: SourceDocument,
  domParent: ParentNode,
  sourceParentKey: string,
  bindings: SourceDomTextBinding[],
) {
  const sourceParent = getSourceParentNode(document, sourceParentKey);
  const sourceTexts = sourceParent.childKeys
    .map((key) => getSourceNode(document, key))
    .filter((node) => node.kind === 'text');
  const domTexts = Array.from(domParent.childNodes)
    .filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
  let sourceIndex = 0;

  for (const domText of domTexts) {
    const matchIndex = sourceTexts.findIndex((sourceText, index) => (
      index >= sourceIndex && sourceText.value === domText.data
    ));
    if (matchIndex < 0) {
      continue;
    }
    const sourceText = sourceTexts[matchIndex];
    domSourceKeys.set(domText, sourceText.key);
    bindings.push({ node: domText, sourceKey: sourceText.key });
    sourceIndex = matchIndex + 1;
  }
}

export function createSourceDomProjection(document: SourceDocument): SourceDomProjection {
  const serializedSource = serializeSourceDocument(document);
  const attributeName = createTemporaryAttributeName(serializedSource);
  const template = window.document.createElement('template');
  template.innerHTML = serializeSourceDocument(document, {
    elementAttribute: {
      name: attributeName,
      value: (element) => encodeURIComponent(element.key),
    },
  });
  bindElementKeys(template.content, attributeName);

  const textBindings: SourceDomTextBinding[] = [];
  bindDirectTextNodes(document, template.content, document.rootKey, textBindings);
  visitElements(template.content, (element) => {
    const sourceKey = getDomSourceKey(element);
    if (sourceKey) {
      bindDirectTextNodes(
        document,
        getDomContentParent(element),
        sourceKey,
        textBindings,
      );
    }
  });

  return {
    root: template.content,
    textBindings,
  };
}
