import { CodeEditor } from '../code/code-editor';
import type { CodeEditorRevealTarget } from '../code/types';
import { EditorController } from './controller';

export class CodeEditorController extends EditorController {
  hostEl!: HTMLElement;

  content = '';

  readonly = false;

  isShowDiff = false;

  format = false;

  language = 'html';

  editor?: CodeEditor;

  editorContainerEl?: HTMLDivElement;

  diffContainerEl?: HTMLDivElement;

  resizeObserver?: ResizeObserver;

  async connect() {
    if (this.editor) return;
    this.editor = new CodeEditor(
      this.editorContainerEl!,
      this.diffContainerEl!,
      {
        format: this.format,
        content: this.content,
        readonly: this.readonly,
        language: this.language,
        isShowDiff: this.isShowDiff,
      }
    );
    this.requestFrame(() => {
      void this.editor?.layout();
      if (this.isShowDiff) {
        this.editor?.diff();
      }
    });
    this.resizeObserver = new ResizeObserver(() => {
      void this.editor?.layout();
    });
    if (this.hostEl) {
      this.resizeObserver.observe(this.hostEl);
    }
  }

  async onContentChange(value: string) {
    await this.editor?.setValue(value || '');
    await this.editor?.layout();
  }

  onReadonlyChange(value: boolean) {
    this.editor?.toggleReadonly(value);
  }

  async onIsShowDiffChange(value: boolean) {
    if (value) {
      this.editor?.diff();
    } else {
      this.editor?.hideDiff();
      await this.editor?.layout();
    }
  }

  dispose() {
    super.dispose();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.editor?.dispose();
    this.editor = undefined;
  }

  async getValue(minify = true) {
    return this.editor?.getValue(minify) || '';
  }

  async setValue(value: string) {
    await this.editor?.setValue(value || '');
    await this.editor?.layout();
  }

  async layout() {
    await this.editor?.layout();
  }

  async revealTarget(target: CodeEditorRevealTarget) {
    return this.editor?.revealTarget(target) ?? false;
  }

  async getCurrentRevealTarget(): Promise<CodeEditorRevealTarget> {
    return this.editor?.getCurrentRevealTarget() ?? {};
  }

  async getUserSelectionVersion() {
    return this.editor?.getUserSelectionVersion() ?? 0;
  }

  async isChanged() {
    return this.editor?.isChanged() ?? false;
  }

  async markClean() {
    this.editor?.markClean();
  }

  async resetHistory() {
    this.editor?.resetHistory();
  }

  async formatDocument() {
    await this.editor?.formatDocument(undefined, { markClean: false });
    await this.editor?.layout();
  }

  async diff() {
    this.editor?.diff();
  }

  updateProps(
    next: Partial<
      Pick<
        CodeEditorController,
        'content' | 'readonly' | 'isShowDiff' | 'format' | 'language'
      >
    >
  ) {
    const tasks: Promise<unknown>[] = [];
    const changed = new Set<string>();
    if (
      Object.prototype.hasOwnProperty.call(next, 'content') &&
      !Object.is(this.content, next.content)
    ) {
      this.content = next.content!;
      changed.add('content');
    }
    if (
      Object.prototype.hasOwnProperty.call(next, 'readonly') &&
      !Object.is(this.readonly, next.readonly)
    ) {
      this.readonly = next.readonly!;
      changed.add('readonly');
    }
    if (
      Object.prototype.hasOwnProperty.call(next, 'isShowDiff') &&
      !Object.is(this.isShowDiff, next.isShowDiff)
    ) {
      this.isShowDiff = next.isShowDiff!;
      changed.add('isShowDiff');
    }
    if (
      Object.prototype.hasOwnProperty.call(next, 'format') &&
      !Object.is(this.format, next.format)
    ) {
      this.format = next.format!;
      changed.add('format');
    }
    if (
      Object.prototype.hasOwnProperty.call(next, 'language') &&
      !Object.is(this.language, next.language)
    ) {
      this.language = next.language!;
      changed.add('language');
    }
    if (changed.has('content'))
      tasks.push(Promise.resolve(this.onContentChange(this.content)));
    if (changed.has('readonly'))
      tasks.push(Promise.resolve(this.onReadonlyChange(this.readonly)));
    if (changed.has('isShowDiff'))
      tasks.push(Promise.resolve(this.onIsShowDiffChange(this.isShowDiff)));
    if (changed.size) this.notifyView();
    return Promise.all(tasks).then(() => undefined);
  }
}
