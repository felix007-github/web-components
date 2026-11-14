/** Inline HTML elements that Lunar may add or remove without attributes. */
export const LUNAR_INLINE_FORMATTING_TAG_NAMES = [
  'b',
  'i',
  'u',
  's',
  'mark',
  'code',
  'sup',
  'sub',
] as const;

export type LunarInlineFormattingTagName =
  (typeof LUNAR_INLINE_FORMATTING_TAG_NAMES)[number];
