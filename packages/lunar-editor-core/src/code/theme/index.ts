import { EditorView } from '@codemirror/view';
export const codeMirrorTheme = EditorView.theme({
  '&': {
    width: '100%',
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  '.cm-scroller': {
    height: '100%',
    overflow: 'auto',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  '.cm-content': {
    minHeight: '100%',
    padding: '8px 0',
  },
  '.cm-line': {
    padding: '0 10px',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e5e7eb',
    color: '#8a94a6',
  },
  '.cm-activeLine': {
    backgroundColor: '#f5f8ff',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#edf3ff',
    color: '#475467',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#b8d7ff',
  },
  '.cm-content ::selection': {
    backgroundColor: '#b8d7ff',
  },
  '&.cm-focused': {
    outline: '1px solid #91caff',
  },
  '.cm-searchMatch': {
    backgroundColor: '#ffe58f',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: '#ffd666',
  },
  '.cm-mergeView': {
    height: '100%',
  },
});

export const readonlyTheme = EditorView.theme({
  '&': {
    backgroundColor: '#fafafa',
  },
});
