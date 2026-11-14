export type HtmlToken =
  | {
      type: 'tag';
      value: string;
      name?: string;
      closing: boolean;
      selfClosing: boolean;
    }
  | { type: 'text'; value: string };

export type SourceTextRangeAnchor = {
  sourceKey: string;
  from: number;
  to: number;
  expectedText: string;
};

export type HtmlInsertion = {
  index: number;
  value: string;
};

export type HtmlEditorState = {
  documentHtml: string;
  editorHtml: string;
};

export type HtmlEditorMode = 'rich' | 'raw' | 'preview';

export type LunarSourceSynchronizationStatus =
  | 'synchronized'
  | 'untracked'
  | 'conflict';

export type LunarSourceStateDiagnostic = {
  code: string;
  message: string;
};

export type LunarSourceStatusDetail = {
  status: LunarSourceSynchronizationStatus;
  sourceVersion: LunarSourceVersion;
  sourceRevision: number;
  mapRevision: number;
  lastOperationId?: string;
  diagnostics: readonly LunarSourceStateDiagnostic[];
};

export type LunarSourceVersion = {
  generation: number;
  revision: number;
};

export type LunarSourceCommit = {
  html: string;
  sourceVersion: LunarSourceVersion;
  lastOperationId?: string;
};

export type LunarSourceExportErrorCode =
  | 'source-state-unavailable'
  | 'source-state-not-synchronized';

export type LunarSourceExportErrorDetail = {
  code: LunarSourceExportErrorCode | 'source-export-failed';
  message: string;
  status?: LunarSourceSynchronizationStatus;
  diagnostics: readonly LunarSourceStateDiagnostic[];
};

export type HtmlSourceCheckpointDetail = {
  id: string;
  origin: 'code';
  beforeRevision: number;
  afterRevision: number;
  diagnosticCount: number;
};

export type HtmlSourceHistoryState = {
  canUndo: boolean;
  canRedo: boolean;
  undoDepth: number;
  redoDepth: number;
  sourceRevision: number;
  lastCheckpoint?: HtmlSourceCheckpointDetail;
};

export type HtmlSourceCheckpointChangeDetail = {
  action: 'create' | 'undo' | 'redo';
  checkpoint: HtmlSourceCheckpointDetail;
  history: HtmlSourceHistoryState;
};

export type RichEditorNodeClickDetail = {
  targetId?: string;
  targetPath?: RichEditorElementPathItem[];
  targetText?: string;
};

export type RichEditorElementPathItem = {
  tagName: string;
  index: number;
};

export type EditorScrollPosition = {
  anchorId?: string;
  anchorOffset?: number;
  left?: number;
  top?: number;
  topRatio?: number;
};

export type RichEditorWithScrollPosition = {
  getScrollPosition?: () => Promise<EditorScrollPosition>;
  restoreScrollPosition?: (position: EditorScrollPosition) => Promise<void>;
};
