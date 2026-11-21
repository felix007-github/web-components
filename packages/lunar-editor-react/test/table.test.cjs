const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/', pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLTemplateElement = dom.window.HTMLTemplateElement;
for (const name of [
  'navigator',
  'Node',
  'Window',
  'HTMLElement',
  'Element',
  'Text',
  'Document',
  'DocumentFragment',
  'MutationObserver',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'DOMRect',
  'Range',
  'Selection',
  'DOMParser',
]) {
  Object.defineProperty(global, name, { value: dom.window[name], configurable: true, writable: true });
}
global.getComputedStyle = window.getComputedStyle.bind(window);
global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
global.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 });
Range.prototype.getClientRects = () => [];
HTMLElement.prototype.scrollIntoView = function () {};
const { createLunarEditor, getLunarEditorSourceHtml, getLunarEditorSourceSnapshot } = require('@mache-hangar/lunar-editor-core/lunar-editor');
const { TextSelection, undo, redo } = require('@mache-hangar/lunar-editor-core/pm');
const { createTableExtension, runTableCommand, getTableState } = require('../dist/extensions/table/index.cjs');
after(() => dom.window.close());
const source =
  '<!doctype html><html><head><title>Keep</title></head><body><p id="before">Before</p><table id="grid" data-keep="yes"><colgroup id="widths"><col style="width: 80px"><col style="width: 90px"></colgroup><tbody id="body"><tr id="r1"><td id="a"><p>A</p></td><td id="b"><p>B</p></td></tr><tr id="r2"><td id="c"><p>C</p></td><td id="d"><p>D</p></td></tr></tbody></table><p id="after">After</p></body></html>';
function fixture(html = source) {
  const mount = document.createElement('div');
  document.body.append(mount);
  const updates = [];
  const view = createLunarEditor(mount, {
    html,
    editable: () => true,
    editorClass: () => '',
    onDocChanged() {},
    extensions: [createTableExtension({ onStateChange: s => updates.push(s) })],
  });
  const select = (first, last = first) => {
    let anchor, head;
    view.state.doc.descendants((n, pos) => {
      if (n.attrs.htmlAttrs?.id === first) anchor = pos + 2;
      if (n.attrs.htmlAttrs?.id === last) head = pos + 2;
    });
    assert.notEqual(anchor, undefined, first);
    assert.notEqual(head, undefined, last);
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, anchor, head)));
  };
  return {
    view,
    select,
    updates,
    html: () => getLunarEditorSourceHtml(view),
    table: () => new dom.window.DOMParser().parseFromString(getLunarEditorSourceHtml(view), 'text/html').querySelector('table'),
    close() {
      view.destroy();
      mount.remove();
    },
  };
}
function checkUndo(f, action) {
  const before = f.html();
  assert.equal(action(), true);
  const after = f.html();
  assert.notEqual(after, before);
  assert.equal(getLunarEditorSourceSnapshot(f.view).status, 'synchronized');
  assert.equal(undo(f.view.state, f.view.dispatch), true);
  assert.equal(f.html(), before);
  assert.equal(redo(f.view.state, f.view.dispatch), true);
  assert.equal(f.html(), after);
}
test('merge a full rectangle, preserve external source and split including empty physical rows', () => {
  const f = fixture();
  try {
    f.select('a', 'd');
    assert.equal(getTableState(f.view).selectedCells, 4);
    checkUndo(f, () => runTableCommand(f.view, { action: 'merge' }));
    assert.equal(f.table().rows.length, 2);
    assert.equal(f.table().rows[1].cells.length, 0);
    assert.equal(f.table().querySelector('td').rowSpan, 2);
    assert.equal(f.table().querySelector('td').colSpan, 2);
    assert.match(f.html(), /<title>Keep<\/title>/);
    assert.match(f.html(), /<p id="after">After<\/p>/);
    assert.equal(f.table().textContent, 'ABCD');
    checkUndo(f, () => runTableCommand(f.view, { action: 'split' }));
    assert.equal(f.table().querySelectorAll('td').length, 4);
    assert.equal(f.table().rows[0].cells[0].textContent, 'ABCD');
  } finally {
    f.close();
  }
});
test('row and column insertion/deletion preserve source, attributes and column widths', () => {
  for (const action of ['row_before', 'row_after', 'column_before', 'column_after', 'delete_rows', 'delete_columns']) {
    const f = fixture();
    try {
      f.select('a');
      checkUndo(f, () => runTableCommand(f.view, { action }));
      const table = f.table();
      assert.equal(table.dataset.keep, 'yes');
      assert.equal(table.tBodies[0].id, 'body');
      const columnAction = action.includes('column');
      assert.equal(table.rows.length, columnAction ? 2 : action === 'delete_rows' ? 1 : 3);
      assert.equal(table.rows[0].cells.length, columnAction ? (action === 'delete_columns' ? 1 : 3) : 2);
      assert.equal(table.querySelectorAll('col').length, columnAction ? (action === 'delete_columns' ? 1 : 3) : 2);
    } finally {
      f.close();
    }
  }
});
test('operations handle existing row/column spans and distinct table sections', () => {
  const html =
    '<table><thead><tr><th id="h" colspan="3"><p>Heading</p></th></tr></thead><tbody><tr><td id="a" rowspan="2"><p>A</p></td><td id="b" colspan="2"><p>B</p></td></tr><tr><td id="c"><p>C</p></td><td id="d"><p>D</p></td></tr></tbody></table>';
  for (const action of ['row_before', 'row_after', 'column_before', 'column_after', 'delete_rows', 'delete_columns']) {
    const f = fixture(html);
    try {
      f.select('c');
      checkUndo(f, () => runTableCommand(f.view, { action }));
      assert.equal(getTableState(f.view).valid, true);
      assert.equal(f.table().tHead.rows.length, 1);
    } finally {
      f.close();
    }
  }
  const f = fixture(html);
  try {
    f.select('h', 'd');
    assert.equal(getTableState(f.view).canMerge, false);
    assert.equal(runTableCommand(f.view, { action: 'merge' }), false);
  } finally {
    f.close();
  }
});
test('headers, caption and styles are ordinary HTML and undoable', () => {
  for (const command of [
    { action: 'header_row' },
    { action: 'header_column' },
    { action: 'caption' },
    { action: 'cell_style', textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#ffeeaa' },
    { action: 'table_style', align: 'center', width: '50%' },
  ]) {
    const f = fixture();
    try {
      f.select('a');
      checkUndo(f, () => runTableCommand(f.view, command));
      if (command.action === 'header_row') assert.equal(f.table().querySelectorAll('th[scope="col"]').length, 2);
      if (command.action === 'header_column') assert.equal(f.table().querySelectorAll('th[scope="row"]').length, 2);
      if (command.action === 'caption') assert.equal(f.table().caption.textContent, 'Table caption');
      if (command.action === 'cell_style') assert.equal(f.table().querySelector('#a').style.textAlign, 'center');
      if (command.action === 'table_style') assert.equal(f.table().style.width, '50%');
    } finally {
      f.close();
    }
  }
});
test('insert/delete tables, readonly and invalid geometry are guarded', () => {
  const f = fixture('<p>Insert here</p>');
  try {
    checkUndo(f, () => runTableCommand(f.view, { action: 'insert', rows: 3, columns: 4, headerRow: true }));
    assert.equal(f.table().rows.length, 3);
    assert.equal(f.table().querySelectorAll('th').length, 4);
    checkUndo(f, () => runTableCommand(f.view, { action: 'delete_table' }));
    assert.equal(f.table(), null);
    f.view.setProps({ editable: () => false });
    assert.equal(runTableCommand(f.view, { action: 'insert', rows: 2, columns: 2 }), false);
  } finally {
    f.close();
  }
  const bad = fixture('<table><tr><td id="a">A</td><td>B</td></tr><tr><td>C</td></tr></table>');
  try {
    bad.select('a');
    assert.equal(getTableState(bad.view).valid, false);
    assert.equal(runTableCommand(bad.view, { action: 'merge' }), false);
  } finally {
    bad.close();
  }
});
test('Shift-click selects cells, Delete clears cells, and Tab appends the final row', () => {
  const f = fixture();
  try {
    f.select('a');
    f.view.dom.querySelector('#d').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, shiftKey: true, button: 0 }));
    assert.equal(getTableState(f.view).selectedCells, 4);
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 4);
    f.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
    assert.equal(f.table().textContent, '');
    assert.equal(f.table().querySelectorAll('td').length, 4);
    f.select('d');
    f.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    assert.equal(f.table().rows.length, 3);
    assert.equal(getTableState(f.view).row, 3);
    assert.equal(getTableState(f.view).column, 1);
  } finally {
    f.close();
  }
});

test('caption caret cannot accidentally edit the first row', () => {
  const f = fixture('<table><caption id="caption"><p>Caption</p></caption><tbody><tr><td id="a"><p>A</p></td></tr></tbody></table>');
  try {
    f.select('caption');
    const before = f.html();
    assert.equal(getTableState(f.view).inCell, false);
    assert.equal(runTableCommand(f.view, { action: 'delete_rows' }), false);
    assert.equal(f.html(), before);
    checkUndo(f, () => runTableCommand(f.view, { action: 'table_style', width: '50%' }));
  } finally {
    f.close();
  }
});
test('oversized spans remain intact and block grid editing', () => {
  const html = '<table><tr><td id="a" colspan="101"><p>Wide</p></td></tr></table>';
  const f = fixture(html);
  try {
    f.select('a');
    assert.equal(getTableState(f.view).valid, false);
    assert.equal(runTableCommand(f.view, { action: 'column_after' }), false);
    assert.equal(f.html(), html);
  } finally {
    f.close();
  }
});
test('multi-cell styles retain the rectangle for subsequent changes', () => {
  const f = fixture();
  try {
    f.select('a', 'd');
    assert.equal(runTableCommand(f.view, { action: 'cell_style', textAlign: 'center' }), true);
    assert.equal(getTableState(f.view).selectedCells, 4);
    checkUndo(f, () => runTableCommand(f.view, { action: 'cell_style', verticalAlign: 'middle' }));
    for (const cell of f.table().querySelectorAll('td')) {
      assert.equal(cell.style.textAlign, 'center');
      assert.equal(cell.style.verticalAlign, 'middle');
    }
  } finally {
    f.close();
  }
});
test('editing columns preserves multiple column groups and expands spanned columns', () => {
  const f = fixture(
    '<table><colgroup id="g1" style="background: red"><col span="2" style="width: 90px"></colgroup><colgroup id="g2"><col style="width: 80px"></colgroup><tbody><tr><td id="a"><p>A</p></td><td><p>B</p></td><td><p>C</p></td></tr></tbody></table>',
  );
  try {
    f.select('a');
    checkUndo(f, () => runTableCommand(f.view, { action: 'column_after' }));
    assert.equal(f.table().querySelectorAll('colgroup').length, 2);
    assert.equal(f.table().querySelector('#g1').children.length, 3);
    assert.equal(f.table().querySelector('#g2 col').style.width, '80px');
    assert.equal(f.table().rows[0].cells.length, 4);
  } finally {
    f.close();
  }
});

function startCellDrag(f, id, position, clicks = 1) {
  const target = f.view.dom.querySelector('#' + id);
  f.dragTestTarget = target;
  f.view.posAtCoords = () => ({ pos: position ?? f.view.posAtDOM(f.dragTestTarget, 0) + 1, inside: -1 });
  const event = new MouseEvent('mousedown', { button: 0, buttons: 1, detail: clicks, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'target', { value: target });
  // Exercise the extension without JSDOM's missing native caret hit-testing.
  f.view.someProp('handleDOMEvents', handlers => handlers.mousedown?.(f.view, event));
  return event;
}
function moveCellDrag(f, id) {
  f.dragTestTarget = f.view.dom.querySelector('#' + id);
  f.view.dom.querySelector('#' + id).dispatchEvent(new MouseEvent('mousemove', { buttons: 1, bubbles: true, cancelable: true }));
}
async function endCellDrag() {
  document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
  await new Promise(resolve => requestAnimationFrame(resolve));
}

function assertSelectionCell(f, id) {
  for (const position of [f.view.state.selection.$anchor, f.view.state.selection.$head]) {
    const cell = Array.from({ length: position.depth }, (_, index) => position.node(position.depth - index)).find(node => ['table_cell', 'table_header'].includes(node.type.name));
    assert.equal(cell?.attrs.htmlAttrs?.id, id, 'The ProseMirror selection must stay in the clicked DOM cell');
    assert.equal(position.parent.inlineContent, true, 'A text selection must resolve to inline content');
  }
  const native = document.getSelection();
  for (const node of [native.anchorNode, native.focusNode]) {
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    assert.equal(element?.closest('td, th')?.id, id, 'The native caret must stay in the clicked DOM cell');
  }
}

test('blank cell boundary clicks keep single, double and triple selections in the DOM target', async () => {
  const cases = [
    { name: 'paragraph', cell: '<td id="a"><p>Alpha</p></td>', paragraph: 'Alpha' },
    { name: 'empty', cell: '<td id="a"></td>', paragraph: '' },
    { name: 'direct text', cell: '<td id="a">Alpha</td>', paragraph: 'Alpha' },
    { name: 'paragraphs', cell: '<td id="a"><p>Alpha</p><p>Beta</p></td>', paragraph: 'Beta' },
    { name: 'list', cell: '<td id="a"><ul><li><p>Alpha</p></li><li><p>Beta</p></li></ul></td>', paragraph: 'Beta' },
    { name: 'header', cell: '<th id="a"><p>Alpha</p></th>', paragraph: 'Alpha' },
    { name: 'merged', cell: '<td id="a" rowspan="2" colspan="2"><p>Alpha</p></td>', paragraph: 'Alpha', next: '<tr><td>Later</td></tr>' },
  ];
  for (const item of cases)
    for (const clicks of [1, 2, 3]) {
      const f = fixture(`<table><tbody><tr>${item.cell}<td id="b"><p>Following</p></td></tr>${item.next || ''}</tbody></table>`);
      try {
        const html = f.html();
        const start = f.view.posAtDOM(f.view.dom.querySelector('#a'), 0);
        const cell = f.view.state.doc.resolve(start).parent;
        // Browser caret hit-testing can return the structural position after the
        // last paragraph when the pointer is in a cell's bottom padding.
        const event = startCellDrag(f, 'a', start + cell.content.size, clicks);
        assert.equal(event.defaultPrevented, true, item.name);
        await endCellDrag();
        assertSelectionCell(f, 'a');
        assert.equal(getTableState(f.view).column, 1, item.name);
        if (clicks === 1) assert.equal(f.view.state.selection.empty, true, item.name);
        if (clicks === 3) assert.equal(f.view.state.doc.textBetween(f.view.state.selection.from, f.view.state.selection.to), item.paragraph, item.name);
        assert.equal(f.html(), html, item.name);
        assert.equal(undo(f.view.state, f.view.dispatch), false, item.name);
      } finally {
        f.close();
      }
    }
});

test('same-cell dragging into bottom padding ends inside the original cell', async () => {
  const f = fixture();
  try {
    const html = f.html();
    startCellDrag(f, 'a');
    const start = f.view.posAtDOM(f.view.dom.querySelector('#a'), 0);
    const cell = f.view.state.doc.resolve(start).parent;
    f.view.posAtCoords = () => ({ pos: start + cell.content.size, inside: -1 });
    moveCellDrag(f, 'a');
    await endCellDrag();
    assertSelectionCell(f, 'a');
    assert.equal(f.view.state.doc.textBetween(f.view.state.selection.from, f.view.state.selection.to), 'A');
    assert.equal(getTableState(f.view).selectedCells, 1);
    assert.equal(f.html(), html);
  } finally {
    f.close();
  }
});

test('cell text double and triple clicks keep word and paragraph selection', async () => {
  for (const [clicks, expected] of [
    [2, 'Alpha'],
    [3, 'Alpha beta'],
  ]) {
    const f = fixture('<table><tbody><tr><td id="a"><p>Alpha beta</p><p>Second paragraph</p></td><td id="b"><p>Following</p></td></tr></tbody></table>');
    try {
      const html = f.html();
      const text = f.view.dom.querySelector('#a p').firstChild;
      startCellDrag(f, 'a', f.view.posAtDOM(text, 3), clicks);
      await endCellDrag();
      assertSelectionCell(f, 'a');
      assert.equal(f.view.state.doc.textBetween(f.view.state.selection.from, f.view.state.selection.to), expected);
      assert.equal(f.html(), html);
    } finally {
      f.close();
    }
  }
});

test('an atom-only cell does not fabricate a text caret in another cell', () => {
  const f = fixture('<table><tbody><tr><td id="a"><hr></td><td id="b"><p>Following</p></td></tr></tbody></table>');
  try {
    f.select('b');
    const html = f.html(),
      selection = f.view.state.selection;
    const start = f.view.posAtDOM(f.view.dom.querySelector('#a'), 0);
    const cell = f.view.state.doc.resolve(start).parent;
    assert.equal(startCellDrag(f, 'a', start + cell.content.size).defaultPrevented, false);
    assert.equal(f.view.state.selection.eq(selection), true);
    assert.equal(f.html(), html);
  } finally {
    f.close();
  }
});

test('dragging empty cells selects a visible rectangle that merges, splits and undoes', async () => {
  const f = fixture('<table><tbody><tr><td id="a"><p></p></td><td id="b"><p></p></td></tr><tr><td id="c"><p></p></td><td id="d"><p></p></td></tr></tbody></table>');
  try {
    const before = f.html();
    f.select('a');
    startCellDrag(f, 'a');
    moveCellDrag(f, 'd');
    await endCellDrag();
    assert.equal(f.html(), before);
    assert.equal(undo(f.view.state, f.view.dispatch), false);
    assert.equal(getTableState(f.view).selectedCells, 4);
    assert.equal(getTableState(f.view).canMerge, true);
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 4);
    checkUndo(f, () => runTableCommand(f.view, { action: 'merge' }));
    assert.equal(f.table().querySelectorAll('td').length, 1);
    assert.equal(f.table().querySelector('td').rowSpan, 2);
    checkUndo(f, () => runTableCommand(f.view, { action: 'split' }));
    assert.equal(f.table().querySelectorAll('td').length, 4);
  } finally {
    f.close();
  }
});
test('reverse drags keep their rectangular range and Escape restores a caret', async () => {
  const f = fixture();
  try {
    f.select('d');
    startCellDrag(f, 'd');
    moveCellDrag(f, 'b');
    await endCellDrag();
    assert.equal(getTableState(f.view).selectedCells, 2);
    f.view.dispatch(f.view.state.tr.setSelection(f.view.state.selection));
    assert.equal(getTableState(f.view).selectedCells, 2);
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 2);
    f.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    assert.equal(f.view.state.selection.empty, true);
    assert.equal(getTableState(f.view).selectedCells, 1);
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 0);
  } finally {
    f.close();
  }
});
test('native multi-cell text selection is highlighted; same-cell dragging keeps text selection', async () => {
  const f = fixture();
  const html = f.html();
  try {
    f.select('a', 'd');
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 4);
    f.select('a');
    const before = f.view.state.selection;
    startCellDrag(f, 'a');
    moveCellDrag(f, 'a');
    await endCellDrag();
    assert.equal(f.view.state.selection.eq(before), true);
    assert.equal(getTableState(f.view).selectedCells, 1);
    f.view.setProps({ editable: () => false });
    startCellDrag(f, 'a');
    moveCellDrag(f, 'd');
    await endCellDrag();
    assert.equal(getTableState(f.view).selectedCells, 1);
    assert.equal(f.html(), html);
  } finally {
    f.close();
  }
});
test('document changes and editor disposal cancel a pending drag without restoring its selection', async () => {
  const f = fixture();
  try {
    startCellDrag(f, 'a');
    moveCellDrag(f, 'd');
    const { setLunarEditorHtml } = require('@mache-hangar/lunar-editor-core/lunar-editor');
    setLunarEditorHtml(f.view, '<p>Different</p>');
    await endCellDrag();
    assert.equal(f.html(), '<p>Different</p>');
    assert.equal(getTableState(f.view).inTable, false);
  } finally {
    f.close();
  }
  const disposed = fixture();
  startCellDrag(disposed, 'a');
  moveCellDrag(disposed, 'd');
  document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
  disposed.close();
  await new Promise(resolve => requestAnimationFrame(resolve));
});

test('Escape during mouseup cancels pending selection restoration before Shift-click', async () => {
  const f = fixture();
  try {
    startCellDrag(f, 'd');
    moveCellDrag(f, 'a');
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    f.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await new Promise(resolve => requestAnimationFrame(resolve));
    assert.equal(getTableState(f.view).selectedCells, 1);
    f.view.dom.querySelector('#d').dispatchEvent(new MouseEvent('mousedown', { button: 0, shiftKey: true, bubbles: true, cancelable: true }));
    assert.equal(getTableState(f.view).selectedCells, 4);
    assert.equal(getTableState(f.view).canMerge, true);
  } finally {
    f.close();
  }
});

test('cell gestures prevent native dragging and release their temporary editor class', async () => {
  const f = fixture();
  try {
    const html = f.html();
    const event = startCellDrag(f, 'a');
    assert.equal(event.defaultPrevented, true);
    assert.equal(f.view.dom.classList.contains('lunar-table-dragging'), true);
    moveCellDrag(f, 'd');
    assert.equal(f.view.dom.classList.contains('lunar-table-cell-selection'), true);
    await endCellDrag();
    assert.equal(f.view.dom.classList.contains('lunar-table-dragging'), false);
    assert.equal(getTableState(f.view).selectedCells, 4);
    assert.equal(f.html(), html);
  } finally {
    f.close();
  }
});
test('an active cell rectangle stays authoritative during DOM selection normalization', async () => {
  const f = fixture();
  try {
    startCellDrag(f, 'a');
    moveCellDrag(f, 'd');
    f.view.dispatch(f.view.state.tr.setSelection(TextSelection.near(f.view.state.doc.resolve(1))));
    assert.equal(getTableState(f.view).selectedCells, 4);
    assert.equal(f.view.dom.querySelectorAll('.lunar-table-cell--selected').length, 4);
    moveCellDrag(f, 'd');
    await endCellDrag();
    assert.equal(getTableState(f.view).canMerge, true);
  } finally {
    f.close();
  }
});

test('merge and split keep the caret inside source cells with direct text after reconciliation', () => {
  const html =
    '<div id="page"><p id="before">Before</p><table id="grid"><tbody><tr><td id="a">A</td><td id="b">B</td></tr><tr><td id="c">C</td><td id="d">D</td></tr></tbody></table><p id="after">After</p></div>';
  for (const last of ['b', 'c', 'd']) {
    const f = fixture(html);
    const assertCaret = () => {
      const selection = f.view.state.selection;
      assert.equal(selection.empty, true);
      let cell;
      for (let depth = selection.$from.depth; depth > 0; depth--) {
        const node = selection.$from.node(depth);
        if (node.type.name === 'table_cell') cell = node;
      }
      assert.equal(cell?.attrs.htmlAttrs.id, 'a', 'The source reconciliation must preserve the target cell');
      assert.equal(document.getSelection()?.focusNode?.parentElement?.closest('td')?.id, 'a');
    };
    try {
      f.select('a', last);
      checkUndo(f, () => {
        const applied = runTableCommand(f.view, { action: 'merge' });
        assertCaret();
        return applied;
      });
      assertCaret();
      assert.equal(getTableState(f.view).canSplit, true);
      checkUndo(f, () => {
        const applied = runTableCommand(f.view, { action: 'split' });
        assertCaret();
        return applied;
      });
      assertCaret();
      const before = new DOMParser().parseFromString(f.html(), 'text/html');
      assert.equal(before.getElementById('before').textContent, 'Before');
      assert.equal(before.getElementById('after').textContent, 'After');
      f.view.dispatch(f.view.state.tr.insertText('typed'));
      assert.match(f.table().querySelector('#a').textContent, /typed/);
      assert.equal(new DOMParser().parseFromString(f.html(), 'text/html').getElementById('after').textContent, 'After');
    } finally {
      f.close();
    }
  }
});
