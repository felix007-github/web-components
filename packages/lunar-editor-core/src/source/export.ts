import type { Schema } from 'prosemirror-model';
import { getEditorSchemaConfiguration } from '../extensions';
import type { EditorState } from 'prosemirror-state';
import type {
  LunarSourceCommit,
  LunarSourceExportErrorCode,
  LunarSourceExportErrorDetail,
  LunarSourceStateDiagnostic,
  LunarSourceSynchronizationStatus,
} from '../utils/types';
import type { SourceDocument, SourceElementNode } from './model';
import { serializeSourceDocument } from './serializer';
import { getLunarSourceState } from './source-map-plugin';

export type {
  LunarSourceCommit,
  LunarSourceExportErrorCode,
  LunarSourceExportErrorDetail,
} from '../utils/types';

export class LunarSourceExportError extends Error {
  constructor(
    readonly code: LunarSourceExportErrorCode,
    message: string,
    readonly status?: LunarSourceSynchronizationStatus,
    readonly diagnostics: readonly LunarSourceStateDiagnostic[] = []
  ) {
    super(message);
    this.name = 'LunarSourceExportError';
  }
}

function getSourceAttribute(element: SourceElementNode, name: string) {
  return element.attributes.find((attribute) => attribute.name === name)?.value;
}

function isEditorArtifactElement(element: SourceElementNode) {
  return getSourceAttribute(element, 'data-html-editor-artifact') !== undefined;
}

export function serializeLunarSourceHtml(
  document: SourceDocument,
  schema?: Schema
) {
  return serializeSourceDocument(document, {
    omitElement: (element) =>
      isEditorArtifactElement(element) ||
      Boolean(
        getEditorSchemaConfiguration(schema).omitSourceElement?.(element)
      ),
  });
}

export function getLunarSourceExportErrorDetail(
  error: unknown
): LunarSourceExportErrorDetail {
  if (error instanceof LunarSourceExportError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      diagnostics: error.diagnostics.map((diagnostic) => ({ ...diagnostic })),
    };
  }
  return {
    code: 'source-export-failed',
    message: error instanceof Error ? error.message : String(error),
    diagnostics: [],
  };
}

function requireSynchronizedLunarSourceState(state: EditorState | undefined) {
  const sourceState = getLunarSourceState(state);
  if (!sourceState) {
    throw new LunarSourceExportError(
      'source-state-unavailable',
      'The Lunar source state is not available for export.'
    );
  }
  if (sourceState.status !== 'synchronized') {
    throw new LunarSourceExportError(
      'source-state-not-synchronized',
      `The Lunar source state is ${sourceState.status} and cannot be exported.`,
      sourceState.status,
      sourceState.diagnostics.map((diagnostic) => ({ ...diagnostic }))
    );
  }
  return sourceState;
}

export function exportLunarSourceHtml(state: EditorState | undefined) {
  return serializeLunarSourceHtml(
    requireSynchronizedLunarSourceState(state).document,
    state?.schema
  );
}

export function exportLunarSourceCommit(
  state: EditorState | undefined
): LunarSourceCommit {
  const sourceState = requireSynchronizedLunarSourceState(state);
  return {
    html: serializeLunarSourceHtml(sourceState.document, state?.schema),
    sourceVersion: {
      generation: sourceState.sourceGeneration,
      revision: sourceState.document.revision,
    },
    lastOperationId: sourceState.lastOperationId,
  };
}
