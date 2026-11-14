import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState, type Plugin, type Transaction } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
import { EditorView, type DirectEditorProps } from 'prosemirror-view';
import { projectLunarHtml } from './schema/index';
import { createEditorSchema } from './schema/node-specs';
import { validateEditorExtensions, type EditorExtension } from './extensions';
import { getLunarHistoryState, type LunarHistoryState } from './history';
import {
  getLunarSelectionFormattingState,
  toggleLunarInlineFormattingCommand,
  type LunarSelectionFormattingState,
} from './selection/selection-formatting';
import {
  compileLunarSourceTransaction,
  createLunarSourceMapPlugin,
  exportLunarSourceCommit,
  exportLunarSourceHtml,
  getLunarSourceStatus,
  getLunarSourceSnapshot,
  setLunarSourceState,
  type LunarSourceState,
  type LunarSourceStatusDetail,
} from './source/index';

export type CreateLunarEditorOptions = {
  editable: () => boolean;
  editorClass: () => string;
  html: string;
  sourceGeneration?: number;
  sourceRevision?: number;
  onDocChanged: () => void;
  onHistoryStateChange?: (detail: LunarHistoryState) => void;
  schema?: Schema;
  extensions?: readonly EditorExtension[];
  plugins?: readonly Plugin[];
  nodeViews?: DirectEditorProps['nodeViews'];
  onTransaction?: (
    previous: EditorState,
    next: EditorState,
    transaction: Transaction
  ) => void;
  onSelectionFormattingChange?: (detail: LunarSelectionFormattingState) => void;
  onSourceStateChange?: (detail: LunarSourceStatusDetail) => void;
};

function createPlugins(
  sourceState: LunarSourceState,
  editable: () => boolean,
  extras: readonly Plugin[] = []
) {
  const bold = toggleLunarInlineFormattingCommand('b');
  const italic = toggleLunarInlineFormattingCommand('i');
  const underline = toggleLunarInlineFormattingCommand('u');
  return [
    createLunarSourceMapPlugin(sourceState),
    history(),
    keymap({
      'Mod-b': (state, dispatch) => editable() && bold(state, dispatch),
      'Mod-i': (state, dispatch) => editable() && italic(state, dispatch),
      'Mod-u': (state, dispatch) => editable() && underline(state, dispatch),
      'Mod-z': undo,
      'Mod-y': redo,
      'Mod-Shift-z': redo,
    }),
    keymap(baseKeymap),
    ...extras,
  ];
}

export function createLunarEditor(
  mount: HTMLElement,
  options: CreateLunarEditorOptions
) {
  const extensions = options.extensions ?? [];
  validateEditorExtensions(extensions);
  const schema = options.schema ?? createEditorSchema({}, extensions);
  const projection = projectLunarHtml(
    options.html,
    options.sourceRevision,
    schema
  );
  const sourceState = {
    document: projection.sourceDocument,
    sourceMap: projection.sourceMap,
    sourceGeneration: options.sourceGeneration || 0,
    status: 'synchronized' as const,
    diagnostics: [],
  };
  const plugins = createPlugins(sourceState, options.editable, [
    ...extensions.flatMap((extension) => extension.plugins?.() ?? []),
    ...(options.plugins ?? []),
  ]);
  const view = new EditorView(mount, {
    state: EditorState.create({
      doc: projection.doc,
      plugins,
    }),
    attributes: {
      class: `${options.editorClass()} lunar-editor__document`,
    },
    nodeViews: {
      ...Object.assign(
        {},
        ...extensions.map((extension) => extension.nodeViews)
      ),
      ...options.nodeViews,
    },
    editable: options.editable,
    dispatchTransaction: (transaction) => {
      const previousState = view.state;
      const previousHistory = getLunarHistoryState(view.state);
      const preparedTransaction = compileLunarSourceTransaction(
        view.state,
        transaction
      );
      view.updateState(view.state.apply(preparedTransaction));
      const nextHistory = getLunarHistoryState(view.state);
      if (
        previousHistory.canUndo !== nextHistory.canUndo ||
        previousHistory.canRedo !== nextHistory.canRedo
      ) {
        options.onHistoryStateChange?.(nextHistory);
      }
      options.onSelectionFormattingChange?.(
        getLunarSelectionFormattingState(view.state)
      );
      extensions.forEach((extension) =>
        extension.onTransaction?.(
          previousState,
          view.state,
          preparedTransaction
        )
      );
      options.onTransaction?.(previousState, view.state, preparedTransaction);
      if (preparedTransaction.docChanged) {
        options.onDocChanged();
        const sourceStatus = getLunarSourceStatus(view.state);
        if (sourceStatus) {
          options.onSourceStateChange?.(sourceStatus);
        }
      }
    },
  });
  return view;
}

export function setLunarEditorHtml(
  view: EditorView,
  html: string,
  sourceRevision = 0,
  sourceGeneration = 0
) {
  const projection = projectLunarHtml(html, sourceRevision, view.state.schema);
  const state = EditorState.create({
    doc: projection.doc,
    plugins: view.state.plugins,
  });
  view.updateState(
    state.apply(
      setLunarSourceState(state.tr, {
        document: projection.sourceDocument,
        sourceMap: projection.sourceMap,
        sourceGeneration,
      })
    )
  );
}

export function getLunarEditorSourceHtml(view: EditorView | undefined) {
  return exportLunarSourceHtml(view?.state);
}

export function getLunarEditorSourceCommit(view: EditorView | undefined) {
  return exportLunarSourceCommit(view?.state);
}

export function getLunarEditorSourceSnapshot(view: EditorView | undefined) {
  return getLunarSourceSnapshot(view?.state);
}

export function getLunarEditorSourceStatus(view: EditorView | undefined) {
  return getLunarSourceStatus(view?.state);
}
