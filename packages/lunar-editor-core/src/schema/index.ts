/**
 * Stable public entry point for Lunar's ProseMirror schema pipeline.
 *
 * Keep implementation details in the focused modules next to this file.
 * Callers of the public schema/projection/serialization API should import from
 * `core/schema` so the internal layout can evolve without changing them.
 */
export { lunarSchema, createEditorSchema } from './node-specs';
export type {
  EditorSchemaConfiguration,
  SerializationOptions,
  SourceTransactionExtensionResult,
} from '../extensions';
export {
  HTML_BLOCK_TAGS,
  HTML_BLOCK_VOID_TAGS,
  HTML_INLINE_VOID_TAGS,
  HTML_RAW_TAGS,
  HTML_SPECIALIZED_TAGS,
  elementHasDirectBlockChild,
  htmlElementTag,
  isHtmlBlockElement,
  isHtmlBlockVoidTag,
  isHtmlInlineElement,
  isHtmlInlineVoidTag,
  isHtmlRawTag,
} from './html-content-model';
export {
  parseLunarHtml,
  projectLunarHtml,
  projectLunarSourceDocument,
  type LunarHtmlProjection,
} from './projection';
export { serializeLunarFragment, serializeLunarHtml } from './serialization';
