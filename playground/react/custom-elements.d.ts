import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { JSX as VtJSX } from '@lpcp/components';

type VtTagName = Extract<keyof VtJSX.IntrinsicElements, `wt-${string}`>;

type HtmlElementForTag<K extends string> = K extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[K]
  : HTMLElement;

type VtElementProps<K extends VtTagName> = DetailedHTMLProps<
  HTMLAttributes<HtmlElementForTag<K>>,
  HtmlElementForTag<K>
> &
  Partial<VtJSX.IntrinsicElements[K]>;

type VtIntrinsicElements = {
  [K in VtTagName]: VtElementProps<K>;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends VtIntrinsicElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends VtIntrinsicElements {}
  }
}

import '@lpcp/xml-editor/react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wt-xml-editor': any;
    }
  }
}

export {};
