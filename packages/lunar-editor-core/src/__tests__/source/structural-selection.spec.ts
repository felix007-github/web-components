import { EditorState, Fragment, TextSelection } from '../../pm';
import { createEditorSchema, projectLunarHtml } from '../../schema';
import { compileLunarSourceTransaction, createLunarSourceMapPlugin, getSourceMutationSteps } from '../../source';

test.each([true, false])('preserves text selection intent before generated container reconciliation (collapsed: %s)', collapsed => {
  const projection = projectLunarHtml('<p>Before</p><table><tbody><tr><td id="a">Alpha</td><td>Beta</td></tr></tbody></table><p>After</p>', 0, createEditorSchema());
  const state = EditorState.create({
    doc: projection.doc,
    plugins: [createLunarSourceMapPlugin({ document: projection.sourceDocument, sourceMap: projection.sourceMap })],
  });
  const pos = state.doc.firstChild!.nodeSize;
  const table = state.doc.child(1);
  const body = table.firstChild!;
  const row = body.firstChild!;
  const first = row.firstChild!;
  const merged = first.type.create({ ...first.attrs, htmlAttrs: { ...first.attrs.htmlAttrs, colspan: '2' } }, first.content.append(row.child(1).content));
  const replacement = table.copy(Fragment.from(body.copy(Fragment.from(row.copy(Fragment.from(merged))))));
  const transaction = state.tr.replaceWith(pos, pos + table.nodeSize, replacement);
  const anchor = pos + 6; // One character into the first generated paragraph.
  const head = collapsed ? anchor : anchor + 2;
  transaction.setSelection(TextSelection.create(transaction.doc, anchor, head));

  const compiled = compileLunarSourceTransaction(state, transaction);

  expect(getSourceMutationSteps(compiled.steps)).toHaveLength(1);
  expect(compiled.selection.empty).toBe(collapsed);
  expect(compiled.selection.$from.parent.textContent).toBe('AlphaBeta');
  expect(compiled.selection.$from.parentOffset).toBe(1);
  expect(compiled.selection.$to.parentOffset).toBe(collapsed ? 1 : 3);
  expect(compiled.selection.$from.node(compiled.selection.$from.depth - 1).attrs.htmlAttrs.id).toBe('a');
});
