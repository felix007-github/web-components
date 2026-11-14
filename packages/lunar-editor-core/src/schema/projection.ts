import {
  DOMParser as ProseMirrorDOMParser,
  type Node as ProseMirrorNode,
  type Schema,
} from 'prosemirror-model';
import { createSourceDomProjection } from '../source/dom-projection';
import type { SourceDocument } from '../source/model';
import { parseSourceHtml } from '../source/parser';
import {
  createLunarSourceMap,
  createSourceTextPositionReferences,
  type LunarSourceMap,
} from '../source/source-map';
import { wrapDirectContainerInlineContent } from './generated-container';
import { getEditorSchemaConfiguration } from '../extensions';
import { lunarSchema } from './node-specs';
import { preserveSourceWhitespace } from './source-whitespace';

function prepareHtmlForParsing(sourceDocument: SourceDocument, schema: Schema) {
  const projection = createSourceDomProjection(sourceDocument);
  projection.root
    .querySelectorAll('[data-html-editor-artifact]')
    .forEach((element) => element.remove());
  getEditorSchemaConfiguration(schema).prepareDom?.(projection.root);
  wrapDirectContainerInlineContent(
    projection.root,
    getEditorSchemaConfiguration(schema).containerPolicy
  );
  preserveSourceWhitespace(sourceDocument, projection.textBindings);
  return projection;
}

export type LunarHtmlProjection = {
  doc: ProseMirrorNode;
  sourceDocument: SourceDocument;
  sourceMap: LunarSourceMap;
};

export function projectLunarHtml(
  value: string,
  sourceRevision = 0,
  schema: Schema = lunarSchema
): LunarHtmlProjection {
  const sourceDocument = {
    ...parseSourceHtml(value || ''),
    revision: sourceRevision,
  };
  return projectLunarSourceDocument(sourceDocument, schema);
}

export function projectLunarSourceDocument(
  sourceDocument: SourceDocument,
  schema: Schema = lunarSchema
): LunarHtmlProjection {
  const domProjection = prepareHtmlForParsing(sourceDocument, schema);
  const positions = createSourceTextPositionReferences(
    sourceDocument,
    domProjection.textBindings
  );
  const doc = ProseMirrorDOMParser.fromSchema(schema).parse(domProjection.root);
  return {
    doc,
    sourceDocument,
    sourceMap: createLunarSourceMap(sourceDocument, doc, positions),
  };
}

export function parseLunarHtml(
  value: string,
  schema: Schema = lunarSchema
): ProseMirrorNode {
  return projectLunarHtml(value, 0, schema).doc;
}
