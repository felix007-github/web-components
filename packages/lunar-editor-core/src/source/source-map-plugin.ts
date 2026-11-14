import {
  Plugin,
  PluginKey,
  type EditorState,
  type Transaction,
} from 'prosemirror-state';
import type { Node as ProseMirrorNode } from 'prosemirror-model';
import type {
  LunarSourceStateDiagnostic,
  LunarSourceStatusDetail,
  LunarSourceSynchronizationStatus,
  LunarSourceVersion,
} from '../utils/types';
import { projectLunarSourceDocument } from '../schema/index';
import type { SourceDocument } from './model';
import {
  getLunarSourceTextSpans,
  mapLunarSourceMap,
  type LunarSourceMap,
} from './source-map';
import { applySourceMutationBatch } from './mutation';
import { serializeSourceDocument } from './serializer';
import { getSourceMutationSteps } from './source-mutation-step';

export type {
  LunarSourceStateDiagnostic,
  LunarSourceStatusDetail,
  LunarSourceSynchronizationStatus,
} from '../utils/types';

export type LunarSourceState = {
  document: SourceDocument;
  sourceMap: LunarSourceMap;
  sourceGeneration: number;
  status: LunarSourceSynchronizationStatus;
  diagnostics: readonly LunarSourceStateDiagnostic[];
  lastOperationId?: string;
};

type LunarSourceMapPluginMeta = {
  reset?: LunarSourceStateInput;
  compileFailure?: LunarSourceStateDiagnostic;
};

export type LunarSourceStateInput = Pick<
  LunarSourceState,
  'document' | 'sourceMap'
> &
  Partial<Omit<LunarSourceState, 'document' | 'sourceMap'>>;

export type LunarSourceSnapshot = {
  status: LunarSourceSynchronizationStatus;
  sourceVersion: LunarSourceVersion;
  sourceRevision: number;
  mapRevision: number;
  lastOperationId?: string;
  diagnostics: readonly LunarSourceStateDiagnostic[];
  exactTextSpanCount: number;
  inexactTextSpanCount: number;
  html: string;
};

export const lunarSourceMapPluginKey = new PluginKey<LunarSourceState>(
  'lunar-source-map'
);

function normalizeSourceState(state: LunarSourceStateInput): LunarSourceState {
  return {
    document: state.document,
    sourceMap: state.sourceMap,
    sourceGeneration: state.sourceGeneration ?? 0,
    status: state.status || 'synchronized',
    diagnostics: state.diagnostics || [],
    lastOperationId: state.lastOperationId,
  };
}

function appendDiagnostic(
  diagnostics: readonly LunarSourceStateDiagnostic[],
  diagnostic: LunarSourceStateDiagnostic
) {
  return diagnostics.some(
    (current) =>
      current.code === diagnostic.code && current.message === diagnostic.message
  )
    ? diagnostics
    : [...diagnostics, diagnostic];
}

function recoverSynchronizedSourceState(
  value: LunarSourceState,
  document: SourceDocument,
  doc: ProseMirrorNode,
  lastOperationId = value.lastOperationId
) {
  const projection = projectLunarSourceDocument(document, doc.type.schema);
  if (!projection.doc.eq(doc)) {
    return undefined;
  }
  return {
    document,
    sourceGeneration: value.sourceGeneration,
    sourceMap: {
      ...projection.sourceMap,
      sourceRevision: document.revision,
      mapRevision: value.sourceMap.mapRevision + 1,
    },
    status: 'synchronized' as const,
    diagnostics: [],
    lastOperationId,
  };
}

export function createLunarSourceMapPlugin(
  initialState: LunarSourceStateInput
) {
  return new Plugin<LunarSourceState>({
    key: lunarSourceMapPluginKey,
    state: {
      init: () => normalizeSourceState(initialState),
      apply: (transaction, value) => {
        const meta = transaction.getMeta(lunarSourceMapPluginKey) as
          | LunarSourceMapPluginMeta
          | undefined;
        if (meta?.reset) {
          return normalizeSourceState(meta.reset);
        }

        const sourceSteps = getSourceMutationSteps(transaction.steps);
        if (sourceSteps.length) {
          try {
            let document = value.document;
            for (const step of sourceSteps) {
              document = applySourceMutationBatch(
                document,
                step.forward
              ).document;
            }
            const replacementSourceMap =
              sourceSteps[sourceSteps.length - 1].sourceMap;
            const nextState = {
              document,
              sourceGeneration: value.sourceGeneration,
              sourceMap: {
                ...replacementSourceMap,
                sourceRevision: document.revision,
                mapRevision: value.sourceMap.mapRevision + 1,
              },
              status: value.status,
              diagnostics: value.diagnostics,
              lastOperationId:
                sourceSteps[sourceSteps.length - 1].forward.operationId,
            };
            return value.status === 'synchronized'
              ? nextState
              : recoverSynchronizedSourceState(
                  value,
                  document,
                  transaction.doc,
                  nextState.lastOperationId
                ) || nextState;
          } catch (error) {
            const recovered = recoverSynchronizedSourceState(
              value,
              value.document,
              transaction.doc
            );
            if (recovered) {
              return recovered;
            }
            const diagnostic = {
              code: 'source-mutation-failed',
              message: error instanceof Error ? error.message : String(error),
            };
            return {
              ...value,
              status: 'conflict',
              diagnostics: appendDiagnostic(value.diagnostics, diagnostic),
            };
          }
        }
        if (!transaction.docChanged) {
          return value;
        }
        if (value.status !== 'synchronized') {
          const recovered = recoverSynchronizedSourceState(
            value,
            value.document,
            transaction.doc
          );
          if (recovered) {
            return recovered;
          }
        }
        const diagnostic = meta?.compileFailure || {
          code: 'untracked-transaction',
          message:
            'A document-changing transaction had no source mutation step.',
        };
        return {
          ...value,
          sourceMap: mapLunarSourceMap(value.sourceMap, transaction.mapping),
          status: 'untracked',
          diagnostics: appendDiagnostic(value.diagnostics, diagnostic),
        };
      },
    },
  });
}

export function setLunarSourceState(
  transaction: Transaction,
  state: LunarSourceStateInput
) {
  return transaction.setMeta(lunarSourceMapPluginKey, { reset: state });
}

export function setLunarSourceCompileFailure(
  transaction: Transaction,
  diagnostic: LunarSourceStateDiagnostic
) {
  return transaction.setMeta(lunarSourceMapPluginKey, {
    compileFailure: diagnostic,
  });
}

export function getLunarSourceState(state: EditorState | undefined) {
  return state ? lunarSourceMapPluginKey.getState(state) : undefined;
}

export function getLunarSourceSnapshot(
  state: EditorState | undefined
): LunarSourceSnapshot | undefined {
  const sourceState = getLunarSourceState(state);
  if (!sourceState) {
    return undefined;
  }
  const textSpans = getLunarSourceTextSpans(sourceState.sourceMap);
  const exactTextSpanCount = textSpans.filter((span) => span.exact).length;
  return {
    status: sourceState.status,
    sourceVersion: {
      generation: sourceState.sourceGeneration,
      revision: sourceState.document.revision,
    },
    sourceRevision: sourceState.document.revision,
    mapRevision: sourceState.sourceMap.mapRevision,
    lastOperationId: sourceState.lastOperationId,
    diagnostics: sourceState.diagnostics.map((diagnostic) => ({
      ...diagnostic,
    })),
    exactTextSpanCount,
    inexactTextSpanCount: textSpans.length - exactTextSpanCount,
    html: serializeSourceDocument(sourceState.document),
  };
}

export function getLunarSourceStatus(
  state: EditorState | undefined
): LunarSourceStatusDetail | undefined {
  const sourceState = getLunarSourceState(state);
  if (!sourceState) {
    return undefined;
  }
  return {
    status: sourceState.status,
    sourceVersion: {
      generation: sourceState.sourceGeneration,
      revision: sourceState.document.revision,
    },
    sourceRevision: sourceState.document.revision,
    mapRevision: sourceState.sourceMap.mapRevision,
    lastOperationId: sourceState.lastOperationId,
    diagnostics: sourceState.diagnostics.map((diagnostic) => ({
      ...diagnostic,
    })),
  };
}
