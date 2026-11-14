import type { NodeSpec, Schema } from 'prosemirror-model';
import type { EditorState, Transaction, Plugin } from 'prosemirror-state';
import type { DirectEditorProps } from 'prosemirror-view';
import type { SourceDocument, SourceElementNode } from '../source/model';
import type { LunarSourceMap } from '../source/source-map';

export type SerializationOptions = {
  purpose?: 'export' | 'mutation';
  schema?: Schema;
};
export type SourceTransactionExtensionResult =
  | { kind: 'compiled'; transaction: Transaction }
  | {
      kind: 'fallback';
      operationId?: string;
      diagnostic?: { code: string; message: string };
    };

/** Per-schema capabilities: no process-wide registry or product defaults. */
export type EditorSchemaConfiguration = {
  nodes?: Record<string, NodeSpec>;
  prepareDom?: (root: DocumentFragment) => void;
  containerPolicy?: {
    isContentBlock?: (element: HTMLElement) => boolean;
    exclude?: (element: HTMLElement) => boolean;
  };
  serializeDom?: (
    container: HTMLElement,
    options: SerializationOptions,
    previousHtml?: string
  ) => string;
  omitSourceElement?: (element: SourceElementNode) => boolean;
  compileTransaction?: (
    state: EditorState,
    transaction: Transaction,
    source: {
      document: SourceDocument;
      sourceMap: LunarSourceMap;
    }
  ) => SourceTransactionExtensionResult | undefined;
};

export type EditorExtension = EditorSchemaConfiguration & {
  name: string;
  requires?: readonly string[];
  plugins?: () => readonly Plugin[];
  nodeViews?: DirectEditorProps['nodeViews'];
  onTransaction?: (
    previous: EditorState,
    next: EditorState,
    transaction: Transaction
  ) => void;
};

export function validateEditorExtensions(
  extensions: readonly EditorExtension[]
) {
  const names = new Set<string>();
  const nodeOwners = new Map<string, string>();
  for (const extension of extensions) {
    if (!extension.name.trim() || names.has(extension.name))
      throw new Error(`Duplicate or empty editor extension: ${extension.name}`);
    names.add(extension.name);
    for (const nodeName of Object.keys(extension.nodes ?? {})) {
      if (nodeOwners.has(nodeName))
        throw new Error(
          `Duplicate editor node ${nodeName}: ${nodeOwners.get(nodeName)}, ${
            extension.name
          }`
        );
      nodeOwners.set(nodeName, extension.name);
    }
  }
  const initialized = new Set<string>();
  for (const extension of extensions) {
    for (const required of extension.requires ?? []) {
      if (!names.has(required))
        throw new Error(
          `Editor extension ${extension.name} requires ${required}`
        );
      if (!initialized.has(required))
        throw new Error(
          `Editor extension ${required} must be registered before ${extension.name}`
        );
    }
    initialized.add(extension.name);
  }
}

export function composeEditorSchemaConfigurations(
  parts: readonly EditorSchemaConfiguration[]
): EditorSchemaConfiguration {
  const serializers = parts.filter((part) => part.serializeDom);
  return {
    nodes: Object.assign({}, ...parts.map((part) => part.nodes)),
    prepareDom: (root) => parts.forEach((part) => part.prepareDom?.(root)),
    containerPolicy: {
      isContentBlock: (element) =>
        parts.some((part) => part.containerPolicy?.isContentBlock?.(element)),
      exclude: (element) =>
        parts.some((part) => part.containerPolicy?.exclude?.(element)),
    },
    serializeDom: serializers.length
      ? (container, options) => {
          let html: string | undefined;
          for (const part of serializers)
            html = part.serializeDom!(container, options, html);
          return html ?? container.innerHTML;
        }
      : undefined,
    omitSourceElement: (element) =>
      parts.some((part) => part.omitSourceElement?.(element)),
    compileTransaction: (state, transaction, source) => {
      for (const part of parts) {
        const result = part.compileTransaction?.(state, transaction, source);
        if (result) return result;
      }
      return undefined;
    },
  };
}

const configurations = new WeakMap<
  Schema,
  Readonly<EditorSchemaConfiguration>
>();
const empty: Readonly<EditorSchemaConfiguration> = Object.freeze({});
export function registerEditorSchema(
  schema: Schema,
  configuration: EditorSchemaConfiguration
) {
  configurations.set(schema, Object.freeze({ ...configuration }));
}
export function getEditorSchemaConfiguration(schema?: Schema) {
  return schema ? configurations.get(schema) ?? empty : empty;
}
