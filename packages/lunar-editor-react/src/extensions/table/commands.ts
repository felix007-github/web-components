import { Fragment, NodeSelection, TextSelection, closeHistory, type EditorState, type EditorView, type Node as PMNode, type Transaction } from '@mache-hangar/lunar-editor-core/pm';
import { compileLunarSourceTransaction } from '@mache-hangar/lunar-editor-core/source/compile-transaction';
import { getLunarSourceState } from '@mache-hangar/lunar-editor-core/source/source-map-plugin';
import { getSourceMutationSteps } from '@mache-hangar/lunar-editor-core/source/source-mutation-step';
import { blankCell, buildTable, cellAt, editColumns, intersects, readGrid, selectionRect, tableAt, type Cell, type Grid, type Rect } from './grid';
import { tableSelectionKey } from './selection-state';

export type TableAction =
  | 'row_before'
  | 'row_after'
  | 'delete_rows'
  | 'column_before'
  | 'column_after'
  | 'delete_columns'
  | 'delete_table'
  | 'merge'
  | 'split'
  | 'header_row'
  | 'header_column'
  | 'caption'
  | 'clear_cells';
export type TableCommand =
  | { action: TableAction }
  | { action: 'insert'; rows: number; columns: number; headerRow?: boolean }
  | { action: 'cell_style'; textAlign?: 'left' | 'center' | 'right' | 'justify'; verticalAlign?: 'top' | 'middle' | 'bottom'; backgroundColor?: string }
  | { action: 'table_style'; align?: 'left' | 'center' | 'right'; width?: '25%' | '50%' | '75%' | '100%' };
export type CellRange = { anchor: number; head: number; dragging?: boolean } | null;
export type TableState = {
  available: boolean;
  inTable: boolean;
  valid: boolean;
  inCell: boolean;
  rows: number;
  columns: number;
  row: number;
  column: number;
  selectedCells: number;
  canMerge: boolean;
  canSplit: boolean;
  headerRow: boolean;
  headerColumn: boolean;
  caption: boolean;
  textAlign: string;
  verticalAlign: string;
  backgroundColor: string;
};
export const EMPTY_TABLE_STATE: TableState = {
  available: false,
  inTable: false,
  valid: false,
  inCell: false,
  rows: 0,
  columns: 0,
  row: 0,
  column: 0,
  selectedCells: 0,
  canMerge: false,
  canSplit: false,
  headerRow: false,
  headerColumn: false,
  caption: false,
  textAlign: 'left',
  verticalAlign: 'top',
  backgroundColor: '#ffffff',
};

export function tableContext(state: EditorState) {
  const range = tableSelectionKey.getState(state);
  const selected = state.selection instanceof NodeSelection && state.selection.node.type.name === 'table' ? { node: state.selection.node, pos: state.selection.from } : undefined;
  const table = range ? tableAt(state.doc.resolve(range.anchor)) : selected || tableAt(state.selection.$anchor);
  if (!table) return;
  if (!range && !selected && tableAt(state.selection.$head)?.pos !== table.pos) return;
  const grid = readGrid(table.node, table.pos);
  if (!grid) return { table };
  const anchor = cellAt(grid, range?.anchor ?? state.selection.anchor);
  const first = anchor || grid.cells[0];
  const last = cellAt(grid, range?.head ?? state.selection.head) || first;
  const rect = selected ? { top: 0, bottom: grid.rows.length, left: 0, right: grid.width } : selectionRect(grid, first, last);
  return { table, grid, rect, inCell: Boolean(selected || anchor), cells: grid.cells.filter(cell => intersects(cell, rect)) };
}

export function getTableState(view: EditorView | undefined): TableState {
  if (!view) return EMPTY_TABLE_STATE;
  const available = view.editable && (!getLunarSourceState(view.state) || getLunarSourceState(view.state)?.status === 'synchronized');
  const context = tableContext(view.state);
  if (!context) return { ...EMPTY_TABLE_STATE, available };
  if (!context.grid) return { ...EMPTY_TABLE_STATE, available, inTable: true };
  const { grid, rect, cells } = context;
  const section = grid.rows[rect!.top].section;
  const style = view.dom.ownerDocument.createElement('span').style;
  style.cssText = cells![0].node.attrs.htmlAttrs?.style || '';
  return {
    available,
    inTable: true,
    valid: true,
    inCell: context.inCell!,
    rows: grid.rows.length,
    columns: grid.width,
    row: rect!.top + 1,
    column: rect!.left + 1,
    selectedCells: cells!.length,
    canMerge: cells!.length > 1 && grid.rows.slice(rect!.top, rect!.bottom).every(row => row.section === section),
    canSplit: cells!.some(cell => cell.rows > 1 || cell.cols > 1),
    headerRow: grid.cells.filter(c => c.row < rect!.bottom && c.row + c.rows > rect!.top).every(c => c.node.type.name === 'table_header'),
    headerColumn: grid.cells.filter(c => c.col < rect!.right && c.col + c.cols > rect!.left).every(c => c.node.type.name === 'table_header'),
    caption: Array.from({ length: grid.node.childCount }, (_, i) => grid.node.child(i)).some(n => n.type.name === 'caption'),
    textAlign: style.textAlign || 'left',
    verticalAlign: style.verticalAlign || 'top',
    backgroundColor: style.backgroundColor || '#ffffff',
  };
}

function commit(view: EditorView, transaction: Transaction) {
  if (!transaction.docChanged) return false;
  const source = getLunarSourceState(view.state);
  const prepared = compileLunarSourceTransaction(view.state, closeHistory(transaction));
  if (source && !getSourceMutationSteps(prepared.steps).length) return false;
  view.dispatch(prepared.scrollIntoView());
  view.dispatch(closeHistory(view.state.tr));
  view.focus();
  return true;
}

function removeTable(view: EditorView, node: PMNode, pos: number) {
  const before = view.state.doc.resolve(pos);
  const replacement = before.parent.canReplace(before.index(), before.index() + 1) ? Fragment.empty : Fragment.from(view.state.schema.nodes.paragraph.createAndFill()!);
  return commit(view, view.state.tr.replaceWith(pos, pos + node.nodeSize, replacement));
}

function withStyle(node: PMNode, values: Record<string, string>, document: Document) {
  const style = document.createElement('span').style;
  style.cssText = node.attrs.htmlAttrs?.style || '';
  for (const [key, value] of Object.entries(values)) style.setProperty(key, value);
  return node.type.create({ ...node.attrs, htmlAttrs: { ...node.attrs.htmlAttrs, style: style.cssText } }, node.content);
}

function addRow(grid: Grid, rect: Rect, after: boolean, cells: Cell[]) {
  const at = after ? rect.bottom : rect.top;
  const source = grid.rows[after ? rect.bottom - 1 : rect.top];
  const attrs = { ...source.node.attrs.htmlAttrs };
  delete attrs.id;
  const row = { node: source.node.type.create({ ...source.node.attrs, sourceKey: null, htmlAttrs: attrs }), section: source.section, pos: -1 };
  for (const cell of cells) {
    if (cell.row >= at) cell.row++;
    else if (cell.row + cell.rows > at) cell.rows++;
  }
  for (let col = 0; col < grid.width; col++) {
    if (cells.some(c => c.row < at && c.row + c.rows > at && col >= c.col && col < c.col + c.cols)) continue;
    cells.push(blankCell(grid.matrix[after ? rect.bottom - 1 : rect.top][col].node, at, col));
  }
  const rows = [...grid.rows];
  rows.splice(at, 0, row);
  return { rows, focusRow: at };
}

/** All topology commands operate on a logical grid, including rowspan/colspan. */
export function runTableCommand(view: EditorView | undefined, command: TableCommand, text?: string): boolean {
  if (!view || !getTableState(view).available) return false;
  try {
    if (command.action === 'insert') {
      const { rows, columns } = command;
      if (![rows, columns].every(n => Number.isInteger(n) && n >= 1 && n <= 50)) return false;
      const schema = view.state.schema;
      const content = Array.from({ length: rows }, (_, row) =>
        schema.nodes.table_row.create(
          null,
          Array.from({ length: columns }, () =>
            (command.headerRow && row === 0 ? schema.nodes.table_header : schema.nodes.table_cell).createAndFill({
              htmlAttrs: command.headerRow && row === 0 ? { scope: 'col' } : {},
            })!,
          ),
        ),
      );
      const table = schema.nodes.table.create({ htmlAttrs: { style: 'width: 100%;' } }, schema.nodes.table_body.create(null, content));
      const tr = view.state.tr.replaceSelectionWith(table);
      let first = -1;
      tr.doc.descendants((node, pos) => {
        if (first < 0 && node === table) first = pos;
      });
      if (first >= 0) tr.setSelection(TextSelection.near(tr.doc.resolve(first + 4)));
      return commit(view, tr);
    }
    const context = tableContext(view.state);
    if (!context) return false;
    if (command.action === 'delete_table') return removeTable(view, context.table.node, context.table.pos);
    if (!context.grid || !context.rect || !context.cells) return false;
    if (!context.inCell && !['caption', 'table_style'].includes(command.action)) return false;
    const { grid, rect } = context;
    let cells = grid.cells.map(cell => ({ ...cell })),
      rows = [...grid.rows];
    let columns: ReturnType<typeof editColumns>,
      focusRow = rect.top,
      focusColumn = rect.left;
    const selected = (cell: Cell) => intersects(cell, rect);
    if (command.action === 'row_before' || command.action === 'row_after') {
      if (rows.length >= 200) return false;
      ({ rows, focusRow } = addRow(grid, rect, command.action === 'row_after', cells));
    } else if (command.action === 'delete_rows') {
      if (rect.bottom - rect.top === rows.length) return removeTable(view, grid.node, grid.pos);
      const count = rect.bottom - rect.top;
      rows.splice(rect.top, count);
      cells = cells.filter(cell => {
        const overlap = Math.max(0, Math.min(cell.row + cell.rows, rect.bottom) - Math.max(cell.row, rect.top));
        if (overlap === cell.rows) return false;
        if (cell.row >= rect.bottom) cell.row -= count;
        else if (cell.row >= rect.top) cell.row = rect.top;
        cell.rows -= overlap;
        return true;
      });
    } else if (command.action === 'column_before' || command.action === 'column_after') {
      if (grid.width >= 100) return false;
      const at = command.action === 'column_after' ? rect.right : rect.left;
      for (const cell of cells) {
        if (cell.col >= at) cell.col++;
        else if (cell.col + cell.cols > at) cell.cols++;
      }
      for (let r = 0; r < rows.length; r++) {
        if (cells.some(c => c.col < at && c.col + c.cols > at && r >= c.row && r < c.row + c.rows)) continue;
        cells.push(blankCell(grid.matrix[r][Math.min(rect.left, grid.width - 1)].node, r, at));
      }
      columns = editColumns(grid, at, 1, false);
      focusColumn = at;
    } else if (command.action === 'delete_columns') {
      if (rect.right - rect.left === grid.width) return removeTable(view, grid.node, grid.pos);
      const count = rect.right - rect.left;
      cells = cells.filter(cell => {
        const overlap = Math.max(0, Math.min(cell.col + cell.cols, rect.right) - Math.max(cell.col, rect.left));
        if (overlap === cell.cols) return false;
        if (cell.col >= rect.right) cell.col -= count;
        else if (cell.col >= rect.left) cell.col = rect.left;
        cell.cols -= overlap;
        return true;
      });
      columns = editColumns(grid, rect.left, count, true);
    } else if (command.action === 'merge') {
      if (!getTableState(view).canMerge) return false;
      const members = cells.filter(selected),
        first = members[0];
      const content = members.reduce((all, cell) => all.append(cell.node.content), Fragment.empty);
      first.node = first.node.copy(content);
      first.rows = rect.bottom - rect.top;
      first.cols = rect.right - rect.left;
      cells = cells.filter(cell => cell === first || !members.includes(cell));
    } else if (command.action === 'split') {
      for (const cell of [...cells].filter(selected)) {
        const { rows: height, cols: width } = cell;
        for (let r = 0; r < height; r++)
          for (let c = 0; c < width; c++) {
            if (r || c) cells.push(blankCell(cell.node, cell.row + r, cell.col + c));
          }
        cell.rows = 1;
        cell.cols = 1;
      }
    } else if (command.action === 'header_row' || command.action === 'header_column') {
      const row = command.action === 'header_row';
      const header = row ? !getTableState(view).headerRow : !getTableState(view).headerColumn;
      for (const cell of cells.filter(c => (row ? c.row < rect.bottom && c.row + c.rows > rect.top : c.col < rect.right && c.col + c.cols > rect.left))) {
        const attrs = { ...cell.node.attrs.htmlAttrs };
        if (header) attrs.scope = row ? 'col' : 'row';
        else delete attrs.scope;
        const type = view.state.schema.nodes[header ? 'table_header' : 'table_cell'];
        cell.node = type.create({ ...cell.node.attrs, htmlAttrs: attrs }, cell.node.content);
      }
    } else if (command.action === 'clear_cells') {
      let first = true;
      for (const cell of cells.filter(selected)) {
        cell.node = cell.node.copy(Fragment.from(view.state.schema.nodes.paragraph.create(null, first && text ? view.state.schema.text(text) : undefined)));
        first = false;
      }
    } else if (command.action === 'cell_style') {
      const values: Record<string, string> = {};
      if (command.textAlign && ['left', 'center', 'right', 'justify'].includes(command.textAlign)) values['text-align'] = command.textAlign;
      if (command.verticalAlign && ['top', 'middle', 'bottom'].includes(command.verticalAlign)) values['vertical-align'] = command.verticalAlign;
      if (command.backgroundColor && /^(#[\da-f]{6}|transparent)$/i.test(command.backgroundColor)) values['background-color'] = command.backgroundColor;
      if (!Object.keys(values).length) return false;
      for (const cell of cells.filter(selected)) cell.node = withStyle(cell.node, values, view.dom.ownerDocument);
    }
    let table = buildTable(grid, rows, cells, columns);
    if (command.action === 'caption') {
      const children: PMNode[] = [];
      table.forEach(node => {
        if (node.type.name !== 'caption') children.push(node);
      });
      if (!getTableState(view).caption)
        children.unshift(view.state.schema.nodes.caption.createAndFill(null, view.state.schema.nodes.paragraph.create(null, view.state.schema.text('Table caption')))!);
      table = table.copy(Fragment.fromArray(children));
    } else if (command.action === 'table_style') {
      const values: Record<string, string> = {};
      if (command.align && ['left', 'center', 'right'].includes(command.align)) {
        values['margin-left'] = command.align === 'left' ? '0' : 'auto';
        values['margin-right'] = command.align === 'right' ? '0' : 'auto';
        values.float = 'none';
      }
      if (command.width && ['25%', '50%', '75%', '100%'].includes(command.width)) values.width = command.width;
      if (!Object.keys(values).length) return false;
      table = withStyle(table, values, view.dom.ownerDocument);
    }
    if (table.eq(grid.node)) return false;
    const tr = view.state.tr.replaceWith(grid.pos, grid.pos + grid.node.nodeSize, table);
    const next = readGrid(table, grid.pos);
    if (!next) return false;
    const cell = next?.matrix[Math.min(focusRow, next.rows.length - 1)]?.[Math.min(focusColumn, next.width - 1)];
    if (cell) tr.setSelection(TextSelection.near(tr.doc.resolve(cell.pos + 1)));
    if (context.cells.length > 1 && ['cell_style', 'table_style', 'header_row', 'header_column', 'caption'].includes(command.action)) {
      const anchor = next.matrix[rect.top][rect.left],
        head = next.matrix[rect.bottom - 1][rect.right - 1];
      tr.setMeta(tableSelectionKey, { anchor: anchor.pos + 1, head: head.pos + 1 });
    }
    return commit(view, tr);
  } catch {
    return false;
  }
}
