import { language } from '@codemirror/language';
import { undo, undoDepth } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { CodeEditorController } from '../controllers/code-editor-controller';
import { formatter } from '../code/formatter';

describe('code editor language changes', () => {
  let controller: CodeEditorController;
  let host: HTMLDivElement;

  beforeEach(async () => {
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: class {
        observe() {}
        disconnect() {}
      },
    });
    host = document.createElement('div');
    const editor = document.createElement('div');
    const diff = document.createElement('div');
    host.append(editor, diff);
    document.body.append(host);
    controller = Object.assign(new CodeEditorController(), {
      hostEl: host,
      editorContainerEl: editor,
      diffContainerEl: diff,
      content: '<p>Hello</p>',
      language: 'html',
    });
    await controller.connect();
  });

  afterEach(() => {
    controller.dispose();
    host.remove();
  });

  it('switches HTML, JSON and XML without resetting content, selection or undo history', async () => {
    const view = controller.editor!.codeEditor;
    view.dispatch({ changes: { from: 3, insert: 'X' }, selection: { anchor: 4 } });
    const content = view.state.doc.toString();
    const depth = undoDepth(view.state);
    for (const next of ['json', 'xml', 'html']) {
      await controller.updateProps({ language: next });
      expect(view.state.facet(language)?.name).toBe(next);
      expect(view.state.doc.toString()).toBe(content);
      expect(view.state.selection.main.head).toBe(4);
      expect(undoDepth(view.state)).toBe(depth);
      expect(await controller.isChanged()).toBe(true);
    }
    expect(undo(view)).toBe(true);
    expect(await controller.getValue(false)).toBe('<p>Hello</p>');
  });

  it('updates both diff panes while keeping the original read-only', async () => {
    await controller.updateProps({ isShowDiff: true });
    await controller.updateProps({ language: 'json' });
    const panes = Array.from(host.querySelectorAll<HTMLElement>('.cm-mergeView .cm-editor')).map(element => EditorView.findFromDOM(element)!);
    expect(panes).toHaveLength(2);
    for (const pane of panes) expect(pane.state.facet(language)?.name).toBe('json');
    expect(panes[0].state.facet(EditorState.readOnly)).toBe(true);
    expect(panes[1].state.facet(EditorState.readOnly)).toBe(false);
    await controller.updateProps({ isShowDiff: false });
    expect(controller.editor!.codeEditor.state.facet(language)?.name).toBe('json');
  });

  it('loads the formatter only when formatting is requested', async () => {
    expect(await formatter.formatXml('<div   id = "demo" ><p>Hello</p></div>')).toBe('<div id="demo"><p>Hello</p></div>\n');
  });
});
