import { getDomSourceKey } from '../source/dom-projection';

type HtmlAttributes = Record<string, string>;

export function readHtmlAttributes(
  element: HTMLElement,
  omittedClasses: string[] = []
): HtmlAttributes {
  const attributes = Object.fromEntries(
    Array.from(element.attributes).map((attribute) => [
      attribute.name,
      attribute.value,
    ])
  );
  if (omittedClasses.length && attributes.class) {
    attributes.class = attributes.class
      .split(/\s+/)
      .filter((className) => className && !omittedClasses.includes(className))
      .join(' ');
    if (!attributes.class) {
      delete attributes.class;
    }
  }
  return attributes;
}

export function parseAttrs(omittedClasses: string[] = []) {
  return (element: HTMLElement) => ({
    htmlAttrs: readHtmlAttributes(element, omittedClasses),
    sourceKey: getDomSourceKey(element) || null,
  });
}
