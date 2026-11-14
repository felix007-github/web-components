import {
  Fragment,
  closeHistory,
  type EditorView,
  type Node as ProseMirrorNode,
} from '@mache-hangar/lunar-editor-core/pm';

export function withWidth(
  style: string | undefined,
  width: number,
  document: Document,
  table = false
) {
  const declaration = document.createElement('span').style;
  declaration.cssText = style || '';
  declaration.setProperty('width', `${Math.round(width * 100) / 100}px`);
  if (table) {
    declaration.setProperty('min-width', '0');
    declaration.setProperty('max-width', 'none');
    declaration.setProperty('table-layout', 'fixed');
  }
  return declaration.cssText;
}

/** Commit ordinary HTML col widths through the existing source-aware transaction. */
export function commitColumnWidths(
  view: EditorView,
  position: number,
  widths: readonly number[]
) {
  const table = view.state.doc.nodeAt(position);
  if (!view.editable || table?.type.name !== 'table') return;
  const document = view.dom.ownerDocument;
  const groups: { node: ProseMirrorNode; position: number }[] = [];
  let insertAt = position + 1;
  table.forEach((node, offset) => {
    if (node.type.name === 'caption')
      insertAt = position + 1 + offset + node.nodeSize;
    if (node.type.name === 'colgroup')
      groups.push({ node, position: position + 1 + offset });
  });
  const { col, colgroup } = view.state.schema.nodes;
  const replacements: ProseMirrorNode[] = [];
  let column = 0;
  const makeColumn = (original?: ProseMirrorNode, reuseKey = false) => {
    const {
      span: _span,
      width: _width,
      ...attrs
    } = original?.attrs.htmlAttrs || {};
    if (!reuseKey) delete attrs.id;
    return col.create({
      sourceKey: reuseKey ? original?.attrs.sourceKey : null,
      htmlAttrs: {
        ...attrs,
        style: withWidth(attrs.style, widths[column++], document),
      },
    });
  };
  for (const { node: group } of groups) {
    const columns: ProseMirrorNode[] = [];
    group.forEach((node) => {
      const span = Math.min(
        1000,
        Math.max(1, parseInt(node.attrs.htmlAttrs?.span, 10) || 1)
      );
      for (let index = 0; index < span && column < widths.length; index++) {
        columns.push(makeColumn(node, index === 0));
      }
    });
    if (!group.childCount) {
      const span = Math.min(
        1000,
        Math.max(1, parseInt(group.attrs.htmlAttrs?.span, 10) || 1)
      );
      for (let index = 0; index < span && column < widths.length; index++)
        columns.push(makeColumn());
    }
    const {
      span: _span,
      width: _width,
      ...attrs
    } = group.attrs.htmlAttrs || {};
    const style = document.createElement('span').style;
    style.cssText = attrs.style || '';
    style.removeProperty('width');
    if (style.cssText) attrs.style = style.cssText;
    else delete attrs.style;
    replacements.push(
      colgroup.create({ ...group.attrs, htmlAttrs: attrs }, columns)
    );
  }
  if (column < widths.length) {
    const columns: ProseMirrorNode[] = [];
    while (column < widths.length) columns.push(makeColumn());
    if (replacements.length) {
      const last = replacements[replacements.length - 1];
      replacements[replacements.length - 1] = last.copy(
        last.content.append(Fragment.fromArray(columns))
      );
    } else replacements.push(colgroup.create(null, columns));
  }
  const from = groups[0]?.position ?? insertAt;
  const last = groups[groups.length - 1];
  const to = last ? last.position + last.node.nodeSize : from;
  const transaction = view.state.tr.replaceWith(
    from,
    to,
    Fragment.fromArray(replacements)
  );
  transaction.setNodeMarkup(position, undefined, {
    ...table.attrs,
    htmlAttrs: {
      ...table.attrs.htmlAttrs,
      style: withWidth(
        table.attrs.htmlAttrs?.style,
        widths.reduce((sum, width) => sum + width, 0),
        document,
        true
      ),
    },
  });
  view.dispatch(closeHistory(transaction));
  // Keep both the previous and next edit separate from this single drag.
  view.dispatch(closeHistory(view.state.tr));
}
