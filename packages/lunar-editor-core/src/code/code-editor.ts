import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  foldedRanges,
  indentOnInput,
  syntaxHighlighting,
  unfoldEffect,
} from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { MergeView } from '@codemirror/merge';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState, Extension, Transaction } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  type ViewUpdate,
} from '@codemirror/view';
import { formatter } from './formatter';
import { minifyXml } from './formatter-util';
import { CodeEditorOption, CodeEditorRevealTarget, type HtmlElementPathItem } from './types';
import { codeMirrorTheme, readonlyTheme } from './theme/index';

const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export class CodeEditor {
  private diffContainerELe: HTMLElement;
  private option: CodeEditorOption;
  private readonly: boolean = false;
  private originalXml!: string;
  private changed = false;
  private formatVersion = 0;
  private userSelectionVersion = 0;
  private readonlyCompartment = new Compartment();
  private languageCompartment = new Compartment();
  private mergeView?: MergeView;
  public codeEditor!: EditorView;

  constructor(containerELe: HTMLElement, diffContainerELe: HTMLElement, option: CodeEditorOption) {
    this.diffContainerELe = diffContainerELe;
    this.option = option;
    this.readonly = option.readonly;
    this.init(containerELe, option);
  }

  private init(containerELe: HTMLElement, option: CodeEditorOption) {
    const value = option.content || '';
    this.originalXml = value;
    this.codeEditor = new EditorView({
      state: this.createState(value),
      parent: containerELe,
    });

    if (option.format) {
      this.scheduleFormatDocument();
    }

    if (option.isShowDiff) {
      this.scheduleDiff();
    }
  }

  private createState(
    value: string,
    selection?: { anchor: number; head: number },
  ) {
    return EditorState.create({
      doc: value,
      selection,
      extensions: this.createExtensions(false),
    });
  }

  private createExtensions(readonlyOriginal: boolean): Extension[] {
    const readonly = readonlyOriginal || this.readonly;

    return [
      lineNumbers(),
      foldGutter(),
      highlightSpecialChars(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        {
          key: 'Shift-Alt-f',
          run: () => {
            if (readonly) {
              return false;
            }

            void this.formatDocument(undefined, { markClean: false });
            return true;
          },
        },
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...searchKeymap,
      ]),
      this.languageCompartment.of(this.getLanguageExtension()),
      this.readonlyCompartment.of([
        EditorState.readOnly.of(readonly),
        EditorView.editable.of(!readonly),
        readonly ? readonlyTheme : [],
      ]),
      codeMirrorTheme,
      EditorView.updateListener.of((update) => {
        if (!readonlyOriginal && update.docChanged) {
          this.changed = update.state.doc.toString() !== this.originalXml;
        }
        if (!readonlyOriginal && update.selectionSet && this.isUserSelectionUpdate(update)) {
          this.userSelectionVersion += 1;
        }
      }),
    ];
  }

  private isUserSelectionUpdate(update: ViewUpdate) {
    return update.transactions.some((transaction) => {
      const userEvent = transaction.annotation(Transaction.userEvent);
      return typeof userEvent === 'string' && userEvent.startsWith('select');
    });
  }

  private getLanguageExtension() {
    switch (this.option.language || 'xml') {
      case 'html':
        return html({ autoCloseTags: true, matchClosingTags: true });
      case 'json':
        return json();
      case 'xml':
      case 'xml-lite':
      default:
        return xml();
    }
  }

  private getActiveValue() {
    return this.mergeView?.b.state.doc.toString() ?? this.codeEditor?.state.doc.toString() ?? this.option.content ?? '';
  }

  private getActiveEditorView() {
    return this.mergeView?.b ?? this.codeEditor;
  }

  private replaceEditorValue(view: EditorView, value: string) {
    const currentValue = view.state.doc.toString();
    if (currentValue === value) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  }

  async setValue(value: string) {
    const nextValue = value || '';

    this.option.content = nextValue;
    this.originalXml = nextValue;
    this.changed = false;
    this.userSelectionVersion = 0;

    if (this.codeEditor) {
      if (this.codeEditor.state.doc.toString() !== nextValue) {
        this.codeEditor.setState(this.createState(nextValue));
      }
    }

    if (this.mergeView) {
      this.rebuildMergeView(nextValue);
    }

    if (this.option.format) {
      this.scheduleFormatDocument();
    }

    if (this.option.isShowDiff) {
      this.scheduleDiff();
    }
  }

  toggleReadonly(readonly: boolean) {
    this.readonly = readonly;
    this.option.readonly = readonly;
    this.codeEditor?.dispatch({
      effects: this.readonlyCompartment.reconfigure([
        EditorState.readOnly.of(readonly),
        EditorView.editable.of(!readonly),
        readonly ? readonlyTheme : [],
      ]),
    });

    if (this.mergeView) {
      this.rebuildMergeView(this.getActiveValue());
    }
  }

  async layout() {
    this.codeEditor?.requestMeasure();
    this.mergeView?.a.requestMeasure();
    this.mergeView?.b.requestMeasure();
  }

  private findNormalizedTextRange(
    value: string,
    query: string,
    scope: { from: number; to: number } = { from: 0, to: value.length },
  ) {
    const sourceMap: number[] = [];
    let normalized = '';
    let previousWasWhitespace = false;

    for (let index = scope.from; index < scope.to; index++) {
      const character = value[index];
      if (/\s/.test(character)) {
        if (!previousWasWhitespace) {
          normalized += ' ';
          sourceMap.push(index);
          previousWasWhitespace = true;
        }
        continue;
      }

      normalized += character;
      sourceMap.push(index);
      previousWasWhitespace = false;
    }

    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const start = normalized.indexOf(normalizedQuery);
    if (start < 0) {
      return undefined;
    }

    const end = start + normalizedQuery.length - 1;
    return {
      from: sourceMap[start],
      to: sourceMap[end] + 1,
    };
  }

  private findTextRange(
    value: string,
    text: string,
    scope: { from: number; to: number } = { from: 0, to: value.length },
  ) {
    const query = text.trim();
    if (!query || scope.from >= scope.to) {
      return undefined;
    }

    const index = value.indexOf(query, scope.from);
    if (index >= scope.from && index + query.length <= scope.to) {
      return { from: index, to: index + query.length };
    }

    return this.findNormalizedTextRange(value, query, scope);
  }

  private findTextParentElementRange(
    value: string,
    text: string,
    scope: { from: number; to: number } = { from: 0, to: value.length },
  ) {
    const textRange = this.findTextRange(value, text, scope);
    if (!textRange) {
      return undefined;
    }

    const target = this.getHtmlElementTargetAtPosition(value, textRange.from);
    const targetPath = target.targetPath;
    if (!targetPath?.length) {
      return textRange;
    }

    const elementRange = this.findHtmlElementPathRange(value, targetPath);
    if (
      !elementRange ||
      elementRange.from < scope.from ||
      elementRange.to > scope.to
    ) {
      return textRange;
    }

    return elementRange;
  }

  private getBodyContentRange(value: string) {
    const bodyOpenMatch = /<body\b[^>]*>/i.exec(value);
    if (!bodyOpenMatch || bodyOpenMatch.index === undefined) {
      return { from: 0, to: value.length };
    }

    const from = bodyOpenMatch.index + bodyOpenMatch[0].length;
    const bodyCloseIndex = value.toLowerCase().lastIndexOf('</body>');
    return {
      from,
      to: bodyCloseIndex > from ? bodyCloseIndex : value.length,
    };
  }

  private pathMatches(left: HtmlElementPathItem[], right: HtmlElementPathItem[]) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => {
      const target = right[index];
      return item.tagName === target.tagName && item.index === target.index;
    });
  }

  private findHtmlElementPathRange(value: string, targetPath: HtmlElementPathItem[]) {
    if (targetPath.length === 0) {
      return undefined;
    }

    const scanRange = this.getBodyContentRange(value);
    const tagPattern =
      /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\?[\s\S]*?\?>|<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;
    const stack: Array<{
      childIndex: number;
      from: number;
      path: HtmlElementPathItem[];
      tagName: string;
    }> = [{ childIndex: 0, from: 0, path: [], tagName: '' }];

    tagPattern.lastIndex = scanRange.from;
    let match: RegExpExecArray | null;
    while ((match = tagPattern.exec(value)) && match.index < scanRange.to) {
      const tagText = match[0];
      if (!match[1] || tagText.startsWith('<!--') || tagText.startsWith('<!') || tagText.startsWith('<?')) {
        continue;
      }

      const tagName = match[1].toLowerCase();
      const isClosingTag = /^<\s*\//.test(tagText);
      if (isClosingTag) {
        while (stack.length > 1) {
          const frame = stack.pop();
          if (frame && this.pathMatches(frame.path, targetPath)) {
            return {
              from: frame.from,
              to: match.index + tagText.length,
            };
          }
          if (frame?.tagName === tagName) {
            break;
          }
        }
        continue;
      }

      const parent = stack[stack.length - 1];
      const path = [...parent.path, { tagName, index: parent.childIndex }];
      parent.childIndex += 1;

      const isSelfClosingTag = /\/\s*>$/.test(tagText) || VOID_HTML_TAGS.has(tagName);
      if (this.pathMatches(path, targetPath) && isSelfClosingTag) {
        return {
          from: match.index,
          to: match.index + tagText.length,
        };
      }

      if (!isSelfClosingTag) {
        stack.push({
          childIndex: 0,
          from: match.index,
          path,
          tagName,
        });
      }
    }

    return undefined;
  }

  private unfoldRangesOverlappingSelection(view: EditorView, from: number, to: number) {
    const effects: ReturnType<typeof unfoldEffect.of>[] = [];
    foldedRanges(view.state).between(0, view.state.doc.length, (foldFrom, foldTo) => {
      const overlapsSelection = foldFrom <= to && foldTo >= from;
      if (overlapsSelection) {
        effects.push(unfoldEffect.of({ from: foldFrom, to: foldTo }));
      }
    });

    if (effects.length > 0) {
      view.dispatch({ effects });
    }
  }

  private revealRange(view: EditorView, range: { from: number; to: number }) {
    this.unfoldRangesOverlappingSelection(view, range.from, range.to);
    view.dispatch({
      selection: {
        anchor: range.from,
        head: range.to,
      },
      effects: EditorView.scrollIntoView(range.from, { y: 'center' }),
    });
    view.focus();
  }

  private revealTextTarget(text: string) {
    const view = this.getActiveEditorView();
    if (!view) {
      return false;
    }

    const value = view.state.doc.toString();
    const range = this.findTextParentElementRange(value, text);

    if (!range) {
      return false;
    }

    this.revealRange(view, range);
    return true;
  }

  private revealHtmlElementPathTarget(path: HtmlElementPathItem[], targetText?: string) {
    const view = this.getActiveEditorView();
    if (!view || path.length === 0) {
      return false;
    }

    const value = view.state.doc.toString();
    const elementRange = this.findHtmlElementPathRange(value, path);
    if (!elementRange) {
      return false;
    }

    const range = targetText
      ? this.findTextParentElementRange(value, targetText, elementRange)
      : elementRange;
    if (!range) {
      return false;
    }
    this.revealRange(view, range);
    return true;
  }

  private findHtmlElementIdRange(value: string, id: string) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idPattern = new RegExp(`\\sid\\s*=\\s*(["'])${escapedId}\\1`, 'i');
    const match = idPattern.exec(value);
    if (!match || match.index === undefined) {
      return undefined;
    }

    const target = this.getHtmlElementTargetAtPosition(value, match.index + 1);
    if (target.targetPath?.length) {
      const elementRange = this.findHtmlElementPathRange(value, target.targetPath);
      if (elementRange) {
        return {
          ...elementRange,
          tagName: target.targetPath.at(-1)?.tagName,
        };
      }
    }

    const tagStart = value.lastIndexOf('<', match.index);
    const tagEnd = value.indexOf('>', match.index);
    if (tagStart < 0 || tagEnd < tagStart) {
      return undefined;
    }

    const tagName = /^<\s*([a-zA-Z][\w:-]*)/.exec(value.slice(tagStart, tagEnd + 1))?.[1]
      ?.toLowerCase();
    return { from: tagStart, to: tagEnd + 1, tagName };
  }

  private revealHtmlElementIdTarget(
    id: string,
    targetText?: string,
    targetPath?: HtmlElementPathItem[],
  ) {
    const view = this.getActiveEditorView();
    if (!view || !id) {
      return false;
    }

    const value = view.state.doc.toString();
    const elementRange = this.findHtmlElementIdRange(value, id);
    if (!elementRange) {
      return false;
    }

    const clickedTagName = targetPath?.at(-1)?.tagName;
    const idIsExactClickedNode = Boolean(
      clickedTagName && clickedTagName === elementRange.tagName,
    );
    const range = !targetText || !targetPath?.length || idIsExactClickedNode
      ? elementRange
      : this.findTextParentElementRange(value, targetText, elementRange);
    if (!range) {
      return false;
    }
    this.revealRange(view, range);
    return true;
  }

  private getHtmlElementTargetAtPosition(value: string, position: number): CodeEditorRevealTarget {
    const scanRange = this.getBodyContentRange(value);
    const tagPattern =
      /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\?[\s\S]*?\?>|<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g;
    const stack: Array<{
      childIndex: number;
      from: number;
      path: HtmlElementPathItem[];
      tagName: string;
      tagText: string;
    }> = [{ childIndex: 0, from: 0, path: [], tagName: '', tagText: '' }];

    tagPattern.lastIndex = scanRange.from;
    let match: RegExpExecArray | null;
    while ((match = tagPattern.exec(value)) && match.index < scanRange.to) {
      if (match.index > position) {
        const frame = stack.length > 1 ? stack[stack.length - 1] : undefined;
        if (!frame) {
          return {};
        }
        const id = /\sid\s*=\s*["']([^"']+)["']/i.exec(frame.tagText)?.[1];
        return {
          targetId: id,
          targetPath: frame.path,
        };
      }

      const tagText = match[0];
      if (!match[1] || tagText.startsWith('<!--') || tagText.startsWith('<!') || tagText.startsWith('<?')) {
        continue;
      }

      const tagName = match[1].toLowerCase();
      const isClosingTag = /^<\s*\//.test(tagText);
      const tagEnd = match.index + tagText.length;
      if (isClosingTag) {
        if (position >= match.index && position <= tagEnd) {
          const frame = stack.length > 1 ? stack[stack.length - 1] : undefined;
          if (!frame) {
            return {};
          }
          const id = /\sid\s*=\s*["']([^"']+)["']/i.exec(frame.tagText)?.[1];
          return {
            targetId: id,
            targetPath: frame.path,
          };
        }

        while (stack.length > 1) {
          const frame = stack.pop();
          if (frame?.tagName === tagName) {
            break;
          }
        }
        continue;
      }

      const parent = stack[stack.length - 1];
      const path = [...parent.path, { tagName, index: parent.childIndex }];
      parent.childIndex += 1;
      const id = /\sid\s*=\s*["']([^"']+)["']/i.exec(tagText)?.[1];

      if (position >= match.index && position <= tagEnd) {
        return {
          targetId: id,
          targetPath: path,
        };
      }

      const isSelfClosingTag = /\/\s*>$/.test(tagText) || VOID_HTML_TAGS.has(tagName);
      if (!isSelfClosingTag) {
        stack.push({
          childIndex: 0,
          from: match.index,
          path,
          tagName,
          tagText,
        });
      }
    }

    const frame = stack.length > 1 ? stack[stack.length - 1] : undefined;
    if (!frame) {
      return {};
    }

    const id = /\sid\s*=\s*["']([^"']+)["']/i.exec(frame.tagText)?.[1];
    return {
      targetId: id,
      targetPath: frame.path,
    };
  }

  getCurrentRevealTarget(): CodeEditorRevealTarget {
    const view = this.getActiveEditorView();
    if (!view) {
      return {};
    }

    const selection = view.state.selection.main;
    const selectedText = selection.empty
      ? ''
      : view.state.doc.sliceString(selection.from, selection.to).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      ...this.getHtmlElementTargetAtPosition(view.state.doc.toString(), selection.head),
      targetText: selectedText || undefined,
    };
  }

  getUserSelectionVersion() {
    return this.userSelectionVersion;
  }

  revealTarget(target: CodeEditorRevealTarget) {
    if (!target) {
      return false;
    }

    if (
      target.targetId &&
      this.revealHtmlElementIdTarget(target.targetId, target.targetText, target.targetPath)
    ) {
      return true;
    }

    if (
      target.targetPath?.length &&
      this.revealHtmlElementPathTarget(target.targetPath, target.targetText)
    ) {
      return true;
    }

    if (target.targetText) {
      return this.revealTextTarget(target.targetText);
    }

    return false;
  }

  diff() {
    if (!this.diffContainerELe) {
      return;
    }

    this.option.isShowDiff = true;
    this.rebuildMergeView(this.getActiveValue());
    void this.layout();
  }

  hideDiff() {
    this.option.isShowDiff = false;
    if (this.mergeView) {
      this.replaceEditorValue(this.codeEditor, this.mergeView.b.state.doc.toString());
      this.mergeView.destroy();
      this.mergeView = undefined;
      this.diffContainerELe.replaceChildren();
    }
  }

  isChanged() {
    return this.changed;
  }

  markClean() {
    this.originalXml = this.getActiveValue();
    this.option.content = this.originalXml;
    this.changed = false;
  }

  resetHistory() {
    const value = this.getActiveValue();
    const selection = this.getActiveEditorView()?.state.selection.main;
    this.originalXml = value;
    this.option.content = value;
    this.changed = false;
    this.codeEditor?.setState(this.createState(value, selection
      ? {
        anchor: Math.min(selection.anchor, value.length),
        head: Math.min(selection.head, value.length),
      }
      : undefined));
    if (this.mergeView) {
      this.rebuildMergeView(value);
    }
  }

  dispose() {
    this.formatVersion++;
    this.mergeView?.destroy();
    this.mergeView = undefined;
    this.codeEditor?.destroy();
  }

  private rebuildMergeView(modifiedValue: string) {
    this.mergeView?.destroy();
    this.diffContainerELe.replaceChildren();

    this.mergeView = new MergeView({
      a: {
        doc: this.originalXml,
        extensions: this.createExtensions(true),
      },
      b: {
        doc: modifiedValue,
        extensions: [
          ...this.createExtensions(false),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) {
              return;
            }

            this.changed = update.state.doc.toString() !== this.originalXml;
          }),
        ],
      },
      parent: this.diffContainerELe,
      revertControls: 'a-to-b',
      diffConfig: {
        scanLimit: 1000,
        timeout: 750,
      },
    });
  }

  private scheduleDiff() {
    window.setTimeout(() => {
      this.diff();
    }, 0);
  }

  private scheduleFormatDocument() {
    const version = ++this.formatVersion;

    window.setTimeout(() => {
      void this.formatDocument(version, { markClean: true });
    }, 0);
  }

  async formatDocument(version = ++this.formatVersion, options: { markClean?: boolean } = {}) {
    if (!this.codeEditor) {
      return;
    }

    const value = this.getActiveValue();
    const formatted = await formatter.formatXml(value);
    if (version !== this.formatVersion || this.getActiveValue() !== value) {
      return;
    }

    if (formatted !== value) {
      this.replaceEditorValue(this.codeEditor, formatted);
      if (this.mergeView) {
        this.rebuildMergeView(formatted);
      }
      this.option.content = formatted;
      if (options.markClean) {
        this.originalXml = formatted;
        this.changed = false;
      } else {
        this.changed = formatted !== this.originalXml;
      }
    }
  }

  async getValue(minify = true) {
    let value = this.getActiveValue();
    if (minify) {
      value = minifyXml(value);
    }
    return value;
  }
}
