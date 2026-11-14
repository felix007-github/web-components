/** Measure logical columns, including cells spanning rows or columns. */
export type ColumnLayout = {
  widths: number[];
  boundaries: number[];
  direction: number;
};

export const MIN_COLUMN_WIDTH = 48;

export function measureColumns(
  table: HTMLTableElement
): ColumnLayout | undefined {
  const rows = Array.from(table.rows);
  const occupied: boolean[][] = [];
  const edges: number[][] = [];
  const rtl =
    table.ownerDocument.defaultView!.getComputedStyle(table).direction ===
    'rtl';
  const direction = rtl ? -1 : 1;
  let count = 0;
  const addEdge = (index: number, x: number) => (edges[index] ??= []).push(x);
  const groupEnds = new Map<Element | null, number>();
  rows.forEach((row, index) => groupEnds.set(row.parentElement, index + 1));
  rows.forEach((row, rowIndex) => {
    let column = 0;
    for (const cell of Array.from(row.cells)) {
      while (occupied[rowIndex]?.[column]) column++;
      const colspan = cell.colSpan;
      const lastRow = groupEnds.get(row.parentElement)!;
      const rowspan = cell.rowSpan || lastRow - rowIndex;
      for (let r = rowIndex; r < Math.min(rowIndex + rowspan, lastRow); r++) {
        for (let c = column; c < column + colspan; c++)
          (occupied[r] ??= [])[c] = true;
      }
      const rect = cell.getBoundingClientRect();
      addEdge(column, rtl ? rect.right : rect.left);
      addEdge(column + colspan, rtl ? rect.left : rect.right);
      column += colspan;
      count = Math.max(count, column);
    }
  });
  let column = 0;
  // Explicit columns also expose boundaries hidden by merged cells in every row.
  for (const group of Array.from(table.children).filter(
    (child) => child.tagName === 'COLGROUP'
  )) {
    const cols = Array.from(group.children) as HTMLTableColElement[];
    for (const col of cols.length ? cols : [group as HTMLTableColElement]) {
      const rect = col.getBoundingClientRect();
      if (rect.width > 0) {
        addEdge(column, rtl ? rect.right : rect.left);
        addEdge(column + col.span, rtl ? rect.left : rect.right);
      }
      column += col.span;
    }
  }
  count = Math.max(count, column);
  if (count < 2 || table.getBoundingClientRect().width <= 0) return undefined;
  const tableRect = table.getBoundingClientRect();
  edges[0] ??= [rtl ? tableRect.right : tableRect.left];
  edges[count] ??= [rtl ? tableRect.left : tableRect.right];
  const boundaries = Array.from({ length: count + 1 }, (_, index) => {
    const values = edges[index];
    return values ? values.reduce((sum, x) => sum + x, 0) / values.length : NaN;
  });
  // A boundary hidden in every row by colspan has no DOM edge; interpolate it.
  let start = 0;
  while (start < count) {
    let end = start + 1;
    while (end < count && !Number.isFinite(boundaries[end])) end++;
    for (let index = start + 1; index < end; index++) {
      boundaries[index] =
        boundaries[start] +
        ((boundaries[end] - boundaries[start]) * (index - start)) /
          (end - start);
    }
    start = end;
  }
  const widths = boundaries
    .slice(1)
    .map((edge, index) => Math.abs(edge - boundaries[index]));
  return widths.every((width) => Number.isFinite(width) && width > 0)
    ? { widths, boundaries, direction }
    : undefined;
}

export function resizeColumns(
  widths: readonly number[],
  column: number,
  delta: number
) {
  const next = [...widths];
  // Preserve pre-existing narrow columns until the user increases their width.
  const minLeft = Math.min(MIN_COLUMN_WIDTH, widths[column]);
  const minRight = Math.min(MIN_COLUMN_WIDTH, widths[column + 1]);
  const change = Math.max(
    minLeft - widths[column],
    Math.min(delta, widths[column + 1] - minRight)
  );
  next[column] += change;
  next[column + 1] -= change;
  return next;
}
