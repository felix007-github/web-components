import {
  DOMSerializer,
  type Fragment,
  type Node as ProseMirrorNode,
} from 'prosemirror-model';
import { unwrapGeneratedContainerParagraphs } from './generated-container';
import {
  getEditorSchemaConfiguration,
  type SerializationOptions,
} from '../extensions';
import { lunarSchema } from './node-specs';

export function serializeLunarHtml(doc: ProseMirrorNode): string {
  return serializeLunarFragment(doc.content, { schema: doc.type.schema });
}

function protectNonBreakingSpaces(container: HTMLElement) {
  if (!container.textContent?.includes('\u00a0')) {
    return undefined;
  }
  let token = '\ue000lunar-nbsp\ue001';
  const currentHtml = container.innerHTML;
  while (currentHtml.includes(token)) {
    token += 'x';
  }

  const pending = Array.from(container.childNodes);
  while (pending.length) {
    const node = pending.pop()!;
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = (node.nodeValue || '').replace(/\u00a0/g, token);
    } else {
      pending.push(...Array.from(node.childNodes));
    }
  }
  return token;
}

export function serializeLunarFragment(
  fragment: Fragment,
  options: SerializationOptions = {}
): string {
  const container = document.createElement('div');
  const schema =
    options.schema ?? fragment.firstChild?.type.schema ?? lunarSchema;
  DOMSerializer.fromSchema(schema).serializeFragment(
    fragment,
    { document },
    container
  );
  const nonBreakingSpaceToken = protectNonBreakingSpaces(container);
  const serialized = unwrapGeneratedContainerParagraphs(
    getEditorSchemaConfiguration(schema).serializeDom?.(container, options) ??
      container.innerHTML
  );
  return nonBreakingSpaceToken
    ? serialized.split(nonBreakingSpaceToken).join('\u00a0')
    : serialized;
}
