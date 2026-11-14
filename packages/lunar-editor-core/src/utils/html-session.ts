import type {
  HtmlSourceCheckpointChangeDetail,
  HtmlSourceCheckpointDetail,
  HtmlSourceHistoryState,
  LunarSourceCommit,
  LunarSourceVersion,
  RichEditorNodeClickDetail,
} from './types';
import {
  getSourceNode,
  isSourceParentNode,
  type SourceDocument,
  type SourceElementNode,
} from '../source/model';
import { parseSourceHtml } from '../source/parser';
import { serializeSourceDocument } from '../source/serializer';
import {
  LunarSourceExportError,
  serializeLunarSourceHtml,
} from '../source/export';

export type HtmlSessionPolicy = {
  prepareInput: (html: string) => { documentHtml: string; editorHtml: string };
  normalizeInput: (html: string) => string;
  serializeProjection: (document: SourceDocument) => string;
};
const defaultPolicy: HtmlSessionPolicy = {
  prepareInput: (html) => {
    const document = parseSessionDocument(html, 0);
    const body = findSourceElement(document, 'body');
    const source = serializeSourceDocument(document);
    const editorHtml = body?.startTagRange
      ? source.slice(
          body.startTagRange.to,
          body.endTagRange?.from ?? source.length
        )
      : source;
    return { documentHtml: source, editorHtml };
  },
  normalizeInput: (html) => html,
  serializeProjection: serializeLunarSourceHtml,
};
type HtmlSourceCheckpoint = HtmlSourceCheckpointDetail & {
  beforeHtml: string;
  afterHtml: string;
};

const maxSourceCheckpointCount = 20;

function parseSessionDocument(source: string, revision: number) {
  return {
    ...parseSourceHtml(source, { mode: 'document' }),
    revision,
  };
}

function findSourceElement(document: SourceDocument, tagName: string) {
  const pending = [document.rootKey];
  while (pending.length) {
    const key = pending.shift()!;
    const node = getSourceNode(document, key);
    if (node.kind === 'element' && node.tagName === tagName) {
      return node;
    }
    if (isSourceParentNode(node)) {
      pending.unshift(...node.childKeys);
    }
  }
  return undefined;
}

function getAttachedSourceRange(
  document: SourceDocument,
  element: SourceElementNode
) {
  const ranges = element.childKeys
    .map((key) => getSourceNode(document, key).sourceRange)
    .filter((range): range is NonNullable<typeof range> => Boolean(range));
  if (!ranges.length) {
    return undefined;
  }
  return {
    from: Math.min(...ranges.map((range) => range.from)),
    to: Math.max(...ranges.map((range) => range.to)),
  };
}

function replaceDocumentBody(document: SourceDocument, bodyHtml: string) {
  const source = serializeSourceDocument(document);
  const body = findSourceElement(document, 'body');
  if (!body) {
    return bodyHtml;
  }

  if (body.startTagRange) {
    const from = body.startTagRange.to;
    const to = body.endTagRange?.from ?? body.sourceRange?.to ?? source.length;
    return `${source.slice(0, from)}${bodyHtml}${source.slice(to)}`;
  }

  const childRange = getAttachedSourceRange(document, body);
  if (childRange) {
    return `${source.slice(0, childRange.from)}${bodyHtml}${source.slice(
      childRange.to
    )}`;
  }

  const html = findSourceElement(document, 'html');
  const insertionOffset = html?.endTagRange?.from ?? source.length;
  return `${source.slice(0, insertionOffset)}${bodyHtml}${source.slice(
    insertionOffset
  )}`;
}

export class HtmlEditorSession {
  private document = parseSessionDocument('', 0);
  private richEditorHtml = '';
  private richProjectionBaselineHtml = '';
  private codeEditorHtml = '';
  private sourceGeneration = 0;
  private undoCheckpoints: HtmlSourceCheckpoint[] = [];
  private redoCheckpoints: HtmlSourceCheckpoint[] = [];
  private checkpointSequence = 0;

  constructor(
    html: string,
    private readonly policy: HtmlSessionPolicy = defaultPolicy
  ) {
    this.reset(html);
  }

  reset(html: string) {
    const state = this.policy.prepareInput(html);
    this.sourceGeneration += 1;
    this.document = parseSessionDocument(state.documentHtml, 0);
    this.richEditorHtml = state.editorHtml;
    this.richProjectionBaselineHtml = this.policy.serializeProjection(
      parseSourceHtml(state.editorHtml)
    );
    this.codeEditorHtml = serializeSourceDocument(this.document);
    this.undoCheckpoints = [];
    this.redoCheckpoints = [];
    this.checkpointSequence = 0;
    return this.getState();
  }

  getState() {
    return {
      documentHtml: serializeSourceDocument(this.document),
      editorHtml: this.richEditorHtml,
      sourceRevision: this.document.revision,
      richSourceVersion: this.getRichSourceVersion(),
      diagnostics: this.document.diagnostics,
    };
  }

  getSourceDocument() {
    return this.document;
  }

  getRichSourceVersion(): LunarSourceVersion {
    return {
      generation: this.sourceGeneration,
      revision: this.document.revision,
    };
  }

  getSourceHistoryState(): HtmlSourceHistoryState {
    const lastCheckpoint =
      this.undoCheckpoints.at(-1) || this.redoCheckpoints.at(-1);
    return {
      canUndo: this.undoCheckpoints.length > 0,
      canRedo: this.redoCheckpoints.length > 0,
      undoDepth: this.undoCheckpoints.length,
      redoDepth: this.redoCheckpoints.length,
      sourceRevision: this.document.revision,
      lastCheckpoint: lastCheckpoint
        ? this.toCheckpointDetail(lastCheckpoint)
        : undefined,
    };
  }

  async enterCodeEditor(
    richSource: LunarSourceCommit,
    revealTarget: RichEditorNodeClickDetail = {}
  ) {
    this.commitRichEditorSource(richSource);
    this.codeEditorHtml = serializeSourceDocument(this.document);
    return {
      content: this.codeEditorHtml,
      revealTarget,
    };
  }

  enterCodeEditorFromSource(revealTarget: RichEditorNodeClickDetail = {}) {
    this.codeEditorHtml = serializeSourceDocument(this.document);
    return {
      content: this.codeEditorHtml,
      revealTarget,
    };
  }

  enterRichEditor(rawHtml: string) {
    const checkpoint = this.applyCodeEditorHtml(rawHtml);
    return {
      content: this.richEditorHtml,
      checkpoint,
    };
  }

  commitCodeEditorHtml(rawHtml: string) {
    const checkpoint = this.applyCodeEditorHtml(rawHtml);
    return {
      html: serializeSourceDocument(this.document),
      checkpoint,
    };
  }

  getCurrentHtmlFromRich(richSource: LunarSourceCommit) {
    this.commitRichEditorSource(richSource);
    return serializeSourceDocument(this.document);
  }

  undoSourceCheckpoint(): HtmlSourceCheckpointChangeDetail | undefined {
    const checkpoint = this.undoCheckpoints.at(-1);
    if (
      !checkpoint ||
      serializeSourceDocument(this.document) !== checkpoint.afterHtml
    ) {
      return undefined;
    }

    this.undoCheckpoints.pop();
    this.restoreCheckpointSource(checkpoint.beforeHtml);
    this.redoCheckpoints.push(checkpoint);
    return {
      action: 'undo',
      checkpoint: this.toCheckpointDetail(checkpoint),
      history: this.getSourceHistoryState(),
    };
  }

  redoSourceCheckpoint(): HtmlSourceCheckpointChangeDetail | undefined {
    const checkpoint = this.redoCheckpoints.at(-1);
    if (
      !checkpoint ||
      serializeSourceDocument(this.document) !== checkpoint.beforeHtml
    ) {
      return undefined;
    }

    this.redoCheckpoints.pop();
    this.restoreCheckpointSource(checkpoint.afterHtml);
    this.undoCheckpoints.push(checkpoint);
    return {
      action: 'redo',
      checkpoint: this.toCheckpointDetail(checkpoint),
      history: this.getSourceHistoryState(),
    };
  }

  private applyCodeEditorHtml(rawHtml: string) {
    const source = this.policy.normalizeInput(rawHtml);
    const currentSource = serializeSourceDocument(this.document);
    if (source === currentSource) {
      this.codeEditorHtml = currentSource;
      return undefined;
    }

    const beforeRevision = this.document.revision;
    this.sourceGeneration += 1;
    this.document = parseSessionDocument(source, this.document.revision + 1);
    const state = this.policy.prepareInput(source);
    this.richEditorHtml = state.editorHtml;
    this.richProjectionBaselineHtml = this.policy.serializeProjection(
      parseSourceHtml(state.editorHtml)
    );
    this.codeEditorHtml = serializeSourceDocument(this.document);
    const checkpoint: HtmlSourceCheckpoint = {
      id: `code-checkpoint-${++this.checkpointSequence}`,
      origin: 'code',
      beforeRevision,
      afterRevision: this.document.revision,
      diagnosticCount: this.document.diagnostics.length,
      beforeHtml: currentSource,
      afterHtml: this.codeEditorHtml,
    };
    this.undoCheckpoints.push(checkpoint);
    if (this.undoCheckpoints.length > maxSourceCheckpointCount) {
      this.undoCheckpoints.shift();
    }
    this.redoCheckpoints = [];
    return this.toCheckpointDetail(checkpoint);
  }

  commitRichEditorSource(commit: LunarSourceCommit) {
    const { generation, revision } = commit.sourceVersion;
    if (generation !== this.sourceGeneration) {
      throw new LunarSourceExportError(
        'source-state-not-synchronized',
        `Rich source generation ${generation} is stale; current generation is ${this.sourceGeneration}.`,
        'conflict'
      );
    }
    if (revision < this.document.revision) {
      throw new LunarSourceExportError(
        'source-state-not-synchronized',
        `Rich source revision ${revision} is older than authoritative revision ${this.document.revision}.`,
        'conflict'
      );
    }

    const richHtml = this.policy.normalizeInput(commit.html);
    if (
      revision === this.document.revision &&
      richHtml === this.richProjectionBaselineHtml
    ) {
      return false;
    }
    const source = replaceDocumentBody(this.document, richHtml);
    const currentSource = serializeSourceDocument(this.document);
    if (source !== currentSource && revision === this.document.revision) {
      throw new LunarSourceExportError(
        'source-state-not-synchronized',
        `Rich source changed without advancing authoritative revision ${revision}.`,
        'conflict'
      );
    }

    if (source === currentSource) {
      if (revision > this.document.revision) {
        this.document = { ...this.document, revision };
      }
      this.richProjectionBaselineHtml = richHtml;
      this.codeEditorHtml = currentSource;
      return false;
    }

    this.redoCheckpoints = [];
    this.document = parseSessionDocument(source, revision);
    this.richProjectionBaselineHtml = richHtml;
    this.codeEditorHtml = serializeSourceDocument(this.document);
    return true;
  }

  private restoreCheckpointSource(source: string) {
    this.sourceGeneration += 1;
    this.document = parseSessionDocument(source, this.document.revision + 1);
    const state = this.policy.prepareInput(source);
    this.richEditorHtml = state.editorHtml;
    this.richProjectionBaselineHtml = this.policy.serializeProjection(
      parseSourceHtml(state.editorHtml)
    );
    this.codeEditorHtml = serializeSourceDocument(this.document);
  }

  private toCheckpointDetail(
    checkpoint: HtmlSourceCheckpoint
  ): HtmlSourceCheckpointDetail {
    return {
      id: checkpoint.id,
      origin: checkpoint.origin,
      beforeRevision: checkpoint.beforeRevision,
      afterRevision: checkpoint.afterRevision,
      diagnosticCount: checkpoint.diagnosticCount,
    };
  }
}
