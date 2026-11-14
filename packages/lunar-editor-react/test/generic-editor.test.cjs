const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
for (const name of [
  'navigator',
  'Node',
  'Window',
  'HTMLElement',
  'Element',
  'Text',
  'Document',
  'DocumentFragment',
  'HTMLTemplateElement',
  'MutationObserver',
  'Event',
  'CustomEvent',
  'MouseEvent',
  'KeyboardEvent',
  'DOMRect',
  'Range',
  'Selection',
  'DOMParser',
]) {
  Object.defineProperty(global, name, {
    value: dom.window[name],
    configurable: true,
    writable: true,
  });
}
global.getComputedStyle = window.getComputedStyle.bind(window);
global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
global.IS_REACT_ACT_ENVIRONMENT = true;
global.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
Range.prototype.getBoundingClientRect = () => ({
  x: 0,
  y: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0,
});
Range.prototype.getClientRects = () =>
  Object.assign([], {
    item() {
      return null;
    },
  });
HTMLElement.prototype.scrollIntoView = function () {};
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { RichEditor } = require('../dist/index.cjs');
const {
  EditorState,
  EditorView,
  Node: ProseMirrorNode,
  TextSelection,
} = require('@mache-hangar/lunar-editor-core/pm');

async function mount(props) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const ref = React.createRef();
  const render = async (next) => {
    await act(async () =>
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(RichEditor, { ...next, ref })
        )
      )
    );
  };
  await render(props);
  return {
    host,
    ref,
    render,
    async close() {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}
after(() => dom.window.close());

test('generic editor preserves markup, view and history through React rerenders', async () => {
  const html = "<p>Alpha</p><custom-widget data-x='1'>Keep</custom-widget>";
  const fixture = await mount({ content: html });
  try {
    const api = fixture.ref.current,
      view = api.getView();
    assert.equal(fixture.host.querySelectorAll('.ProseMirror').length, 1);
    assert.ok(view instanceof EditorView);
    assert.ok(view.state instanceof EditorState);
    assert.ok(view.state.doc instanceof ProseMirrorNode);
    await act(async () =>
      view.dispatch(
        view.state.tr
          .setSelection(TextSelection.create(view.state.doc, 6))
          .insertText('!')
      )
    );
    assert.equal(api.getHtml(), html.replace('Alpha', 'Alpha!'));
    await fixture.render({ content: html, readonly: true });
    assert.equal(api.getView(), view);
    assert.equal(view.editable, false);
    await act(async () => assert.equal(api.undo(), true));
    assert.equal(api.getHtml(), html);
    await fixture.render({ content: '<p>New document</p>' });
    assert.equal(api.getView(), view);
    assert.equal(api.undo(), false);
    assert.match(api.getHtml(), /New document/);
  } finally {
    await fixture.close();
  }
});

test('base React entry does not load MathLive or Redline capabilities', async () => {
  const fixture = await mount({ content: '<p>Plain HTML</p>' });
  try {
    assert.equal(
      fixture.ref.current.getView().state.schema.nodes.review_add,
      undefined
    );
    assert.equal(
      fixture.ref.current.getView().state.schema.nodes.math_inline,
      undefined
    );
    assert.equal(
      Object.keys(require.cache).some((file) =>
        /[/\\]mathlive[/\\]/.test(file)
      ),
      false
    );
  } finally {
    await fixture.close();
  }
});

test('table presentation can be explicitly enabled without changing exported HTML', async () => {
  const {
    createTableExtension,
  } = require('../dist/extensions/table/index.cjs');
  const html =
    "<table data-x='1'><tbody><tr><td>Cell</td></tr></tbody></table>";
  const fixture = await mount({
    content: html,
    extensions: [createTableExtension()],
  });
  try {
    assert.equal(
      fixture.host.querySelectorAll('.lunar-table-scroll table').length,
      1
    );
    assert.equal(fixture.ref.current.getHtml(), html);
  } finally {
    await fixture.close();
  }
});

function tableGeometry(table, widths, cells) {
  const currentWidths = () => {
    const cols = Array.from(table.querySelectorAll(':scope > colgroup > col'));
    return cols.length === widths.length &&
      cols.every((col) => col.style.width.endsWith('px'))
      ? cols.map((col) => parseFloat(col.style.width))
      : widths;
  };
  const rect = (left, right, top = 100, bottom = 200) => ({
    x: left,
    y: top,
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  });
  table.parentElement.getBoundingClientRect = () => rect(10, 610);
  table.getBoundingClientRect = () =>
    rect(10, 10 + currentWidths().reduce((a, b) => a + b, 0));
  cells.forEach(([cell, from, to]) => {
    cell.getBoundingClientRect = () => {
      const columns = currentWidths();
      return rect(
        10 + columns.slice(0, from).reduce((a, b) => a + b, 0),
        10 + columns.slice(0, to).reduce((a, b) => a + b, 0)
      );
    };
  });
}

function pointer(target, type, clientX, pointerId = 1) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX,
  });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  target.dispatchEvent(event);
}

async function resizeFixture(html, widths, cellRanges, extra = {}) {
  const {
    createTableExtension,
  } = require('../dist/extensions/table/index.cjs');
  const fixture = await mount({
    content: html,
    extensions: [createTableExtension()],
    ...extra,
  });
  const table = fixture.host.querySelector('table');
  tableGeometry(
    table,
    widths,
    Array.from(table.rows)
      .flatMap((row) => Array.from(row.cells))
      .map((cell, index) => [cell, ...cellRanges[index]])
  );
  pointer(table, 'pointerover', 20);
  return {
    ...fixture,
    table,
    handle: (column = 0) =>
      fixture.host.querySelectorAll('.lunar-table-column-handle')[column],
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

test('merged table column drag previews without edits and commits one reversible source update', async () => {
  const html =
    "<p data-before='yes'>Before</p><table class='original' style='color: red'><caption>Title</caption><tbody>" +
    "<tr><th rowspan='2'>Group</th><td colspan='2'><b>Heading</b></td></tr>" +
    "<tr><td><a href='/keep'>Alpha</a></td><td>Beta</td></tr></tbody></table><p data-after='yes'>After</p>";
  let changes = 0;
  const fixture = await resizeFixture(
    html,
    [120, 160, 200],
    [
      [0, 1],
      [1, 3],
      [1, 2],
      [2, 3],
    ],
    {
      onDocChanged: () => changes++,
    }
  );
  try {
    const api = fixture.ref.current;
    const view = api.getView();
    let textPosition;
    view.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === 'Alpha') textPosition = pos;
    });
    await act(async () =>
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, textPosition, textPosition + 5)
        )
      )
    );
    pointer(fixture.table, 'pointerover', 20);
    assert.equal(
      fixture.host.querySelectorAll('.lunar-table-column-handle').length,
      2
    );
    const before = view.state.doc;
    await act(async () => {
      pointer(fixture.handle(1), 'pointerdown', 290);
      pointer(document, 'pointermove', 320);
      pointer(document, 'pointermove', 330);
      await tick();
    });
    assert.equal(view.state.doc, before);
    assert.equal(api.getHtml(), html);
    assert.equal(changes, 0);
    assert.deepEqual(
      Array.from(fixture.table.querySelectorAll('col')).map(
        (col) => col.style.width
      ),
      ['120px', '200px', '160px']
    );
    await act(async () => {
      pointer(document, 'pointerup', 330);
      await tick();
    });
    assert.equal(changes, 1);
    const saved = api.getHtml();
    assert.match(saved, /width: 200px/);
    assert.match(saved, /table-layout: fixed/);
    assert.ok(saved.startsWith("<p data-before='yes'>Before</p>"));
    assert.ok(saved.endsWith("<p data-after='yes'>After</p>"));
    assert.match(saved, /rowspan=['"]2['"]/);
    assert.match(saved, /colspan=['"]2['"]/);
    assert.match(saved, /<a href='\/keep'>Alpha<\/a>/);
    assert.match(saved, /color: red/);
    assert.equal(
      view.state.doc.textBetween(
        view.state.selection.from,
        view.state.selection.to
      ),
      'Alpha'
    );
    assert.equal(
      require('@mache-hangar/lunar-editor-core/pm').undoDepth(view.state),
      1
    );
    await act(async () => assert.equal(api.undo(), true));
    assert.equal(api.getHtml(), html);
    assert.equal(fixture.table.querySelector('colgroup'), null);
    await act(async () => assert.equal(api.redo(), true));
    assert.equal(api.getHtml(), saved);
    const reloaded = await mount({
      content: saved,
      extensions: [
        require('../dist/extensions/table/index.cjs').createTableExtension(),
      ],
    });
    try {
      assert.equal(reloaded.ref.current.getHtml(), saved);
      assert.equal(reloaded.host.querySelectorAll('col').length, 3);
      assert.ok(reloaded.host.querySelector('.lunar-table-scroll--fixed'));
    } finally {
      await reloaded.close();
    }
  } finally {
    await fixture.close();
  }
});

test('existing column groups, attributes and spans survive resize; adjacent edits have separate undo steps', async () => {
  const html =
    "<table><colgroup class='columns' style='background: pink'><col id='original-column' span='2' class='keep' style='background: yellow; width: 100px'></colgroup>" +
    '<tbody><tr><td>One</td><td>Two</td></tr></tbody></table>';
  const fixture = await resizeFixture(
    html,
    [120, 120],
    [
      [0, 1],
      [1, 2],
    ]
  );
  try {
    const api = fixture.ref.current;
    await act(async () => {
      pointer(fixture.handle(), 'pointerdown', 130);
      pointer(document, 'pointerup', 150);
      await tick();
    });
    const first = api.getHtml();
    assert.equal(fixture.table.querySelectorAll('col').length, 2);
    assert.equal(fixture.table.querySelectorAll('col.keep').length, 2);
    assert.equal(fixture.table.querySelectorAll('#original-column').length, 1);
    assert.equal(fixture.table.querySelector('colgroup').className, 'columns');
    assert.equal(fixture.table.querySelector('col').style.background, 'yellow');
    await act(async () => {
      pointer(fixture.handle(), 'pointerdown', 150);
      pointer(document, 'pointerup', 160);
      await tick();
    });
    const second = api.getHtml();
    await act(async () => {
      let pos;
      api.getView().state.doc.descendants((node, position) => {
        if (node.isText && node.text === 'One') pos = position + 3;
      });
      api.getView().dispatch(api.getView().state.tr.insertText('!', pos));
    });
    await act(async () => assert.equal(api.undo(), true));
    assert.equal(api.getHtml(), second);
    await act(async () => assert.equal(api.undo(), true));
    assert.equal(api.getHtml(), first);
    await act(async () => assert.equal(api.undo(), true));
    assert.equal(api.getHtml(), html);
  } finally {
    await fixture.close();
  }
});

test('cancelled drags and clicks do not change HTML or add history; resizing clamps narrow columns', async () => {
  const html = '<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>';
  const fixture = await resizeFixture(
    html,
    [120, 120],
    [
      [0, 1],
      [1, 2],
    ]
  );
  try {
    for (const cancel of ['Escape', 'pointercancel', 'blur', 'click']) {
      pointer(fixture.table, 'pointerover', 20);
      await act(async () => {
        pointer(fixture.handle(), 'pointerdown', 130);
        if (cancel !== 'click') pointer(document, 'pointermove', 170);
        if (cancel === 'Escape')
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          );
        else if (cancel === 'blur') window.dispatchEvent(new Event('blur'));
        else
          pointer(
            document,
            cancel === 'click' ? 'pointerup' : 'pointercancel',
            130
          );
        await tick();
      });
      assert.equal(fixture.ref.current.getHtml(), html);
      assert.equal(
        require('@mache-hangar/lunar-editor-core/pm').undoDepth(
          fixture.ref.current.getView().state
        ),
        0
      );
      assert.equal(fixture.table.querySelector('colgroup'), null);
    }
    await act(async () => {
      pointer(fixture.handle(), 'pointerdown', 130);
      pointer(document, 'pointerup', 1000);
      await tick();
    });
    assert.deepEqual(
      Array.from(fixture.table.querySelectorAll('col')).map(
        (col) => col.style.width
      ),
      ['192px', '48px']
    );
  } finally {
    await fixture.close();
  }
});

test('read-only tables have no resize controls', async () => {
  const fixture = await resizeFixture(
    '<table><tr><td>A</td><td>B</td></tr></table>',
    [100, 100],
    [
      [0, 1],
      [1, 2],
    ],
    { readonly: true }
  );
  try {
    assert.equal(fixture.handle(), undefined);
  } finally {
    await fixture.close();
  }
});

test('resize handles use their overlay origin after indentation and horizontal scrolling', async () => {
  const fixture = await resizeFixture(
    '<table><caption>Caption</caption><tr><td>A</td><td>B</td></tr></table>',
    [120, 120],
    [
      [0, 1],
      [1, 2],
    ]
  );
  try {
    const controls = fixture.host.querySelector('.lunar-table-resize-controls');
    const wrapper = fixture.table.parentElement;
    controls.getBoundingClientRect = () => ({ left: 36, top: 50 });
    wrapper.getBoundingClientRect = () => ({ left: 10, top: 20 });
    fixture.table.rows[0].getBoundingClientRect = () => ({ top: 125 });
    wrapper.scrollLeft = 80;
    await act(async () => {
      wrapper.dispatchEvent(new Event('scroll'));
      await tick();
    });
    assert.equal(fixture.handle().style.left, '94px');
    assert.equal(fixture.handle().style.top, '75px');
    assert.equal(fixture.handle().style.height, '75px');
    controls.getBoundingClientRect = () => ({ left: 16, top: 50 });
    for (const cell of fixture.table.rows[0].cells) {
      const original = cell.getBoundingClientRect;
      cell.getBoundingClientRect = () => {
        const rect = original();
        return { ...rect, left: rect.left - 20, right: rect.right - 20 };
      };
    }
    wrapper.scrollLeft = 100;
    await act(async () => {
      wrapper.dispatchEvent(new Event('scroll'));
      await tick();
    });
    // Both the table and overlay scroll together: the local handle offset stays put.
    assert.equal(fixture.handle().style.left, '94px');
  } finally {
    await fixture.close();
  }
});

test('rowspan zero stops at its row group; fully merged boundaries can be resized with the keyboard', async () => {
  const html =
    '<table><thead><tr><th rowspan="0">Heading</th><th colspan="2">Group</th></tr>' +
    '<tr><th colspan="2">Subheading</th></tr></thead><tbody><tr><td>A</td><td colspan="2">B</td></tr></tbody></table>';
  const fixture = await resizeFixture(
    html,
    [100, 100, 100],
    [
      [0, 1],
      [1, 3],
      [1, 3],
      [0, 1],
      [1, 3],
    ]
  );
  try {
    assert.equal(
      fixture.host.querySelectorAll('.lunar-table-column-handle').length,
      2
    );
    await act(async () => {
      fixture.handle(1).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true,
        })
      );
      await tick();
    });
    assert.deepEqual(
      Array.from(fixture.table.querySelectorAll('col')).map(
        (col) => col.style.width
      ),
      ['100px', '110px', '90px']
    );
    assert.match(fixture.ref.current.getHtml(), /rowspan="0"/);
    await act(async () => fixture.ref.current.undo());
    assert.equal(fixture.ref.current.getHtml(), html);
  } finally {
    await fixture.close();
  }
});

test('destroying or changing a document during a drag discards its preview and document listeners', async () => {
  const html = '<table><tr><td>A</td><td>B</td></tr></table>';
  const fixture = await resizeFixture(
    html,
    [100, 100],
    [
      [0, 1],
      [1, 2],
    ]
  );
  try {
    await act(async () => {
      pointer(fixture.handle(), 'pointerdown', 110);
      pointer(document, 'pointermove', 150);
    });
    await fixture.render({ content: '<p>Replacement</p>' });
    await act(async () => {
      pointer(document, 'pointerup', 180);
      await tick();
    });
    assert.equal(fixture.ref.current.getHtml(), '<p>Replacement</p>');
  } finally {
    await fixture.close();
  }
});
