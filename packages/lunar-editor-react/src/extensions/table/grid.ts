import { Fragment, type Node as PMNode, type ResolvedPos } from '@mache-hangar/lunar-editor-core/pm';

export type Cell = { node: PMNode; row: number; col: number; rows: number; cols: number; pos: number };
export type Row = { node: PMNode; section: number; pos: number };
export type Grid = { node: PMNode; pos: number; rows: Row[]; cells: Cell[]; matrix: Cell[][]; width: number };
export type Rect = { top: number; bottom: number; left: number; right: number };
type Column = { node: PMNode; group: number };
export const isCell = (node: PMNode) => ['table_cell', 'table_header'].includes(node.type.name);
export const span = (value: unknown) => Math.min(100, Math.max(1, Number.parseInt(String(value), 10) || 1));

export function tableAt(position: ResolvedPos) {
  for (let depth = position.depth; depth > 0; depth--) {
    if (position.node(depth).type.name === 'table') return { node: position.node(depth), pos: position.before(depth) };
  }
}

/** Read the original HTML sections; never flatten thead/tbody/tfoot into a different schema. */
export function readGrid(node: PMNode, pos: number): Grid | undefined {
  const rows: Row[] = [];
  node.forEach((child, offset, section) => {
    if (child.type.name === 'table_row') rows.push({ node: child, section: -1, pos: pos + 1 + offset });
    else if (['table_head', 'table_body', 'table_foot'].includes(child.type.name)) {
      child.forEach((row, rowOffset) => rows.push({ node: row, section, pos: pos + 2 + offset + rowOffset }));
    }
  });
  if (!rows.length || rows.length > 200) return;
  const matrix: Cell[][] = [],
    cells: Cell[] = [];
  let width = 0,
    valid = true;
  rows.forEach((row, r) => {
    let col = 0;
    row.node.forEach((node, offset) => {
      if (!isCell(node)) {
        valid = false;
        return;
      }
      while (matrix[r]?.[col]) col++;
      const end = rows.findIndex((next, index) => index > r && next.section !== row.section);
      const groupEnd = end < 0 ? rows.length : end;
      if (Number(node.attrs.htmlAttrs?.colspan) > 100 || Number(node.attrs.htmlAttrs?.rowspan) > 100) {
        valid = false;
        return;
      }
      const cols = span(node.attrs.htmlAttrs?.colspan);
      const rowSpan = node.attrs.htmlAttrs?.rowspan === '0' ? groupEnd - r : span(node.attrs.htmlAttrs?.rowspan);
      if (r + rowSpan > groupEnd || col + cols > 100) {
        valid = false;
        return;
      }
      const cell: Cell = { node, row: r, col, rows: rowSpan, cols, pos: row.pos + 1 + offset };
      cells.push(cell);
      for (let y = r; y < r + rowSpan; y++)
        for (let x = col; x < col + cols; x++) {
          matrix[y] ??= [];
          if (matrix[y][x]) valid = false;
          matrix[y][x] = cell;
        }
      col += cols;
      width = Math.max(width, col);
    });
  });
  if (!valid || !width || rows.some((_, r) => Array.from({ length: width }, (_, c) => !matrix[r]?.[c]).some(Boolean))) return;
  return { node, pos, rows, cells, matrix, width };
}

export function cellAt(grid: Grid, position: number) {
  return grid.cells.find(cell => position >= cell.pos && position < cell.pos + cell.node.nodeSize);
}

/** Expand rectangular selection to include every intersecting merged cell in full. */
export function selectionRect(grid: Grid, anchor: Cell, head: Cell): Rect {
  const rect = {
    top: Math.min(anchor.row, head.row),
    bottom: Math.max(anchor.row + anchor.rows, head.row + head.rows),
    left: Math.min(anchor.col, head.col),
    right: Math.max(anchor.col + anchor.cols, head.col + head.cols),
  };
  let changed = true;
  while (changed) {
    changed = false;
    for (const cell of grid.cells)
      if (intersects(cell, rect)) {
        const values = [Math.min(rect.top, cell.row), Math.max(rect.bottom, cell.row + cell.rows), Math.min(rect.left, cell.col), Math.max(rect.right, cell.col + cell.cols)];
        if (values.some((value, i) => value !== [rect.top, rect.bottom, rect.left, rect.right][i])) {
          [rect.top, rect.bottom, rect.left, rect.right] = values;
          changed = true;
        }
      }
  }
  return rect;
}
export function intersects(cell: Cell, rect: Rect) {
  return cell.row < rect.bottom && cell.row + cell.rows > rect.top && cell.col < rect.right && cell.col + cell.cols > rect.left;
}

export function blankCell(template: PMNode, row: number, col: number): Cell {
  const attrs = { ...template.attrs.htmlAttrs };
  for (const key of ['id', 'rowspan', 'colspan', 'headers']) delete attrs[key];
  return { node: template.type.createAndFill({ ...template.attrs, sourceKey: null, htmlAttrs: attrs })!, row, col, rows: 1, cols: 1, pos: -1 };
}

/** Rebuild only changed rows/cells and retain all other table children and source identities. */
export function buildTable(grid: Grid, rows: Row[], cells: Cell[], columns?: Column[]): PMNode {
  const rebuilt = rows.map((row, r) => {
    const children = cells
      .filter(cell => cell.row === r)
      .sort((a, b) => a.col - b.col)
      .map(cell => {
        const attrs = { ...cell.node.attrs.htmlAttrs };
        // Explicit spans also make rowspan=0 safe when row sections change size.
        if (cell.rows > 1) attrs.rowspan = String(cell.rows);
        else delete attrs.rowspan;
        if (cell.cols > 1) attrs.colspan = String(cell.cols);
        else delete attrs.colspan;
        if (JSON.stringify(attrs) === JSON.stringify(cell.node.attrs.htmlAttrs || {})) return cell.node;
        return cell.node.type.create({ ...cell.node.attrs, htmlAttrs: attrs }, cell.node.content);
      });
    const content = Fragment.fromArray(children);
    return row.node.content.eq(content) ? row.node : row.node.copy(content);
  });
  const children: PMNode[] = [];
  grid.node.forEach((child, _, index) => {
    if (child.type.name === 'colgroup' && columns) {
      const group = columns.filter(col => col.group === index);
      const attrs = { ...child.attrs.htmlAttrs };
      delete attrs.span;
      if (group.length)
        children.push(
          child.type.create(
            { ...child.attrs, htmlAttrs: attrs },
            group.map(col => col.node),
          ),
        );
    } else if (['table_head', 'table_body', 'table_foot'].includes(child.type.name)) {
      const group = rebuilt.filter((_, row) => rows[row].section === index);
      if (group.length) children.push(child.copy(Fragment.fromArray(group)));
    } else if (child.type.name !== 'table_row') children.push(child);
  });
  children.push(...rebuilt.filter((_, row) => rows[row].section === -1));
  return grid.node.copy(Fragment.fromArray(children));
}

export function editColumns(grid: Grid, at: number, count: number, remove: boolean) {
  const columns: Column[] = [];
  grid.node.forEach((group, _, index) => {
    if (group.type.name !== 'colgroup') return;
    const attrs = { ...group.attrs.htmlAttrs };
    if (!group.childCount) {
      for (let i = 0; i < span(attrs.span); i++) columns.push({ node: group.type.schema.nodes.col.create({ htmlAttrs: {}, sourceKey: null }), group: index });
    }
    group.forEach(col => {
      for (let i = 0; i < span(col.attrs.htmlAttrs?.span); i++) {
        const htmlAttrs = { ...col.attrs.htmlAttrs };
        delete htmlAttrs.span;
        if (i) delete htmlAttrs.id;
        columns.push({ node: col.type.create({ ...col.attrs, sourceKey: i ? null : col.attrs.sourceKey, htmlAttrs }), group: index });
      }
    });
  });
  if (!columns.length) return;
  while (columns.length < grid.width) columns.push({ node: grid.node.type.schema.nodes.col.create(), group: columns[columns.length - 1].group });
  columns.length = grid.width;
  if (remove) columns.splice(at, count);
  else columns.splice(at, 0, { node: grid.node.type.schema.nodes.col.create(), group: columns[Math.min(at, columns.length - 1)].group });
  return columns;
}
