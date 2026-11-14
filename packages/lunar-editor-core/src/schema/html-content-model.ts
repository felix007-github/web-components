/**
 * HTML categories used by Lunar's generic fallback nodes.
 *
 * Dedicated NodeSpecs always win first. These categories only decide how an
 * otherwise unknown element participates in ProseMirror block or inline flow.
 */

export const HTML_RAW_TAGS = new Set([
  'applet',
  'embed',
  'iframe',
  'noscript',
  'object',
  'script',
  'style',
  'template',
]);

export const HTML_INLINE_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

export const HTML_BLOCK_VOID_TAGS = new Set(['col', 'hr']);

export const HTML_BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'body',
  'caption',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'div',
  'dl',
  'doc',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'li',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'para',
  'pre',
  'search',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

/** Tags already handled by a dedicated Lunar NodeSpec. */
export const HTML_SPECIALIZED_TAGS = new Set([
  'blockquote',
  'br',
  'caption',
  'col',
  'colgroup',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'p',
  'para',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
]);

export function htmlElementTag(element: Element) {
  return element.localName.toLowerCase();
}

export function isHtmlRawTag(tag: string) {
  return HTML_RAW_TAGS.has(tag);
}

export function isHtmlInlineVoidTag(tag: string) {
  return HTML_INLINE_VOID_TAGS.has(tag);
}

export function isHtmlBlockVoidTag(tag: string) {
  return HTML_BLOCK_VOID_TAGS.has(tag);
}

export function elementHasDirectBlockChild(element: Element) {
  return Array.from(element.children).some((child) => {
    const tag = htmlElementTag(child);
    return HTML_BLOCK_TAGS.has(tag) || HTML_BLOCK_VOID_TAGS.has(tag);
  });
}

export function isHtmlBlockElement(element: Element) {
  const tag = htmlElementTag(element);
  return (
    HTML_BLOCK_TAGS.has(tag) ||
    HTML_BLOCK_VOID_TAGS.has(tag) ||
    elementHasDirectBlockChild(element)
  );
}

export function isHtmlInlineElement(element: Element) {
  return !isHtmlBlockElement(element) && !isHtmlRawTag(htmlElementTag(element));
}
