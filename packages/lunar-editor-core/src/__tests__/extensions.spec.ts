import { EditorState } from '../pm';
import { createLunarEditor, getLunarEditorSourceHtml } from '../lunar-editor';
import { runLunarHistoryCommand } from '../history';
import { createEditorSchema, projectLunarHtml } from '../schema';
import {
  createLunarSourceMapPlugin,
  exportLunarSourceHtml,
  compileLunarSourceTransaction,
  serializeLunarSourceHtml,
} from '../source';
import { HtmlEditorSession } from '../utils/html-session';

function editor(html: string) {
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  const view = createLunarEditor(mount, {
    html,
    editable: () => true,
    editorClass: () => '',
    onDocChanged: () => {},
  });
  return {
    view,
    close: () => {
      view.destroy();
      mount.remove();
    },
  };
}

test('basic editing and history preserve unknown markup without installing product features', () => {
  const html =
    "<p>Alpha</p><custom-widget data-x='1'>Untouched</custom-widget><div class='html-page-section'>Original</div>";
  const fixture = editor(html);
  try {
    fixture.view.dispatch(fixture.view.state.tr.insertText('!', 6));
    expect(getLunarEditorSourceHtml(fixture.view)).toBe(
      html.replace('Alpha', 'Alpha!')
    );
    expect(runLunarHistoryCommand(fixture.view, 'undo')).toBe(true);
    expect(getLunarEditorSourceHtml(fixture.view)).toBe(html);
    expect(runLunarHistoryCommand(fixture.view, 'redo')).toBe(true);
    expect(getLunarEditorSourceHtml(fixture.view)).toContain('Alpha!');
    expect(fixture.view.state.schema.nodes.review_add).toBeUndefined();
    expect(fixture.view.state.schema.nodes.math_inline).toBeUndefined();
  } finally {
    fixture.close();
  }
});

test('projection/export policies stay isolated between editor schemas', () => {
  const ordinary = createEditorSchema();
  const filtered = createEditorSchema({}, [
    {
      name: 'hide-private',
      omitSourceElement: (node) =>
        node.attributes.some((attr) => attr.name === 'data-private'),
    },
  ]);
  const projection = projectLunarHtml(
    '<p>Public</p><p data-private>Private</p>',
    0,
    ordinary
  );
  expect(serializeLunarSourceHtml(projection.sourceDocument, filtered)).toBe(
    '<p>Public</p>'
  );
  expect(
    serializeLunarSourceHtml(projection.sourceDocument, ordinary)
  ).toContain('Private');
  expect(serializeLunarSourceHtml(projection.sourceDocument)).toContain(
    'Private'
  );
});

test('extension identities and declared dependencies are checked before editor creation', () => {
  expect(() => createEditorSchema({}, [{ name: 'a' }, { name: 'a' }])).toThrow(
    'Duplicate'
  );
  expect(() =>
    createEditorSchema({}, [{ name: 'a', requires: ['b'] }])
  ).toThrow('requires b');
  expect(() =>
    createEditorSchema({}, [{ name: 'b' }, { name: 'a', requires: ['b'] }])
  ).not.toThrow();
  expect(() =>
    createEditorSchema({}, [{ name: 'a', requires: ['b'] }, { name: 'b' }])
  ).toThrow('registered before');
  expect(() =>
    createEditorSchema({}, [
      { name: 'a', nodes: { custom: {} } },
      { name: 'b', nodes: { custom: {} } },
    ])
  ).toThrow('Duplicate editor node');
});

test('an extension cannot report an untracked PM edit as a synchronized source mutation', () => {
  const schema = createEditorSchema({}, [
    {
      name: 'invalid-compiler',
      compileTransaction: (_state, transaction) => ({
        kind: 'compiled',
        transaction,
      }),
    },
  ]);
  const projection = projectLunarHtml('<p>Alpha</p>', 0, schema);
  const state = EditorState.create({
    doc: projection.doc,
    plugins: [
      createLunarSourceMapPlugin({
        document: projection.sourceDocument,
        sourceMap: projection.sourceMap,
      }),
    ],
  });
  const next = state.apply(
    compileLunarSourceTransaction(state, state.tr.insertText('!', 6))
  );
  expect(() => exportLunarSourceHtml(next)).toThrow();
});

test('the default document session preserves source and enforces generation boundaries', () => {
  const original =
    '<!doctype html><html><head><title>Test</title></head><body><!--keep--><p>One</p></body></html>';
  const session = new HtmlEditorSession(original);
  expect(session.getState().documentHtml).toBe(original);
  const stale = session.getRichSourceVersion();
  session.commitCodeEditorHtml(original.replace('One', 'Two'));
  expect(() =>
    session.commitRichEditorSource({
      html: '<p>Stale</p>',
      sourceVersion: stale,
    })
  ).toThrow('stale');
  expect(session.undoSourceCheckpoint()).toBeDefined();
  expect(session.getState().documentHtml).toBe(original);
  expect(session.redoSourceCheckpoint()).toBeDefined();
  expect(session.getState().documentHtml).toContain('Two');
});
