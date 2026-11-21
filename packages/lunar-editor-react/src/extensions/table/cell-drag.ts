import { TextSelection, type EditorView, type Node as PMNode } from '@mache-hangar/lunar-editor-core/pm';
import { cellAt, readGrid, tableAt, type Cell, type Grid } from './grid';
import { tableSelectionKey } from './selection-state';

function hitCell(view: EditorView, target: EventTarget | null) {
  const element = (target as Element | null)?.closest?.('td, th');
  if (!element || !view.dom.contains(element)) return;
  const pos = view.posAtDOM(element, 0);
  const table = tableAt(view.state.doc.resolve(pos));
  const grid = table && readGrid(table.node, table.pos);
  const cell = grid && cellAt(grid, pos);
  const tableElement = element.closest('table');
  return grid && cell && tableElement ? { grid, cell, tableElement } : undefined;
}

/** Cell padding can resolve to a block boundary; never search beyond this cell. */
function cellTextPosition(cell: Cell, position: number): number | undefined {
  let nearest: number | undefined;
  cell.node.descendants((node, offset) => {
    if (node.isAtom) return false;
    if (!node.inlineContent) return;
    const from = cell.pos + offset + 2;
    const candidate = Math.max(from, Math.min(position, from + node.content.size));
    if (
      nearest === undefined ||
      Math.abs(candidate - position) < Math.abs(nearest - position) ||
      (Math.abs(candidate - position) === Math.abs(nearest - position) && candidate > nearest)
    )
      nearest = candidate;
    return false;
  });
  return nearest;
}

/** Resolve a word without handing the mouse gesture back to native HTML selection. */
function clickSelection(view: EditorView, pos: number, count: number) {
  const $pos = view.state.doc.resolve(pos);
  if (count >= 3 && $pos.parent.inlineContent) return TextSelection.create(view.state.doc, $pos.start(), $pos.end());
  if (count === 2 && $pos.parent.inlineContent) {
    const text = $pos.parent.textBetween(0, $pos.parent.content.size, '', '\ufffc');
    const index = $pos.parent.textBetween(0, $pos.parentOffset, '', '\ufffc').length;
    const segment = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)].find(part => index >= part.index && index < part.index + part.segment.length);
    if (segment) {
      let offset = 0,
        from: number | undefined,
        to: number | undefined;
      $pos.parent.descendants((node, at) => {
        if (!node.isText && !node.isLeaf) return;
        const length = node.isText ? node.text!.length : 1;
        if (from === undefined && segment.index < offset + length) from = $pos.start() + at + Math.max(0, segment.index - offset);
        const end = segment.index + segment.segment.length;
        if (to === undefined && end <= offset + length) to = $pos.start() + at + Math.max(0, end - offset);
        offset += length;
      });
      if (from !== undefined && to !== undefined) return TextSelection.create(view.state.doc, from, to);
    }
  }
  return TextSelection.create(view.state.doc, pos);
}

type Drag = {
  view: EditorView;
  doc: PMNode;
  grid: Grid;
  tableElement: HTMLTableElement;
  anchor: Cell;
  head: Cell;
  selecting: boolean;
  textFrom: number;
  textTo: number;
};

/** One owner per gesture: text within a cell, a bounded rectangle across cells. */
export class CellDragSelection {
  private drag?: Drag;
  get active() {
    return Boolean(this.drag?.view.editable);
  }

  start(view: EditorView, event: MouseEvent): boolean {
    this.cancel();
    if (!view.editable || event.button !== 0 || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return false;
    const hit = hitCell(view, event.target);
    if (!hit) return false;
    const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
    const pos = cellTextPosition(hit.cell, at !== undefined && cellAt(hit.grid, at)?.pos === hit.cell.pos ? at : hit.cell.pos + 1);
    if (pos === undefined) return false;
    const selection = clickSelection(view, pos, event.detail);
    this.drag = { view, doc: view.state.doc, ...hit, anchor: hit.cell, head: hit.cell, selecting: false, textFrom: selection.from, textTo: selection.to };
    // Starting a native text drag as well would race with our rectangular selection.
    event.preventDefault();
    view.dispatch(view.state.tr.setSelection(selection).setMeta(tableSelectionKey, { anchor: hit.cell.pos + 1, head: hit.cell.pos + 1, dragging: true }));
    view.focus();
    const document = view.dom.ownerDocument;
    document.addEventListener('mousemove', this.move, true);
    document.addEventListener('mouseup', this.end, true);
    document.defaultView?.addEventListener('blur', this.cancel);
    return true;
  }

  cancelIfStale(view: EditorView) {
    if (this.drag && (this.drag.doc !== view.state.doc || !view.editable)) this.destroy();
  }

  /** Clamp hit-testing to the current table and editor viewport, including on mouseup. */
  private point(event: MouseEvent, drag: Drag) {
    const table = drag.tableElement.getBoundingClientRect(),
      root = drag.view.dom.getBoundingClientRect();
    const win = drag.view.dom.ownerDocument.defaultView!;
    return {
      left: Math.max(Math.max(table.left + 1, root.left + 1, 1), Math.min(event.clientX, table.right - 1, root.right - 1, win.innerWidth - 1)),
      top: Math.max(Math.max(table.top + 1, root.top + 1, 1), Math.min(event.clientY, table.bottom - 1, root.bottom - 1, win.innerHeight - 1)),
    };
  }

  private move = (event: MouseEvent) => {
    const drag = this.drag;
    if (!drag) return;
    if (!(event.buttons & 1)) {
      this.end();
      return;
    }
    if (drag.doc !== drag.view.state.doc || !drag.view.editable) {
      this.cancel();
      return;
    }
    event.preventDefault();
    const point = this.point(event, drag);
    const document = drag.view.dom.ownerDocument;
    const target = document.elementFromPoint?.(point.left, point.top) ?? event.target;
    const hit = hitCell(drag.view, target);
    if (!hit || hit.grid.pos !== drag.grid.pos) return;
    const { view, anchor } = drag;
    if (hit.cell.pos !== anchor.pos) drag.selecting = true;
    drag.head = hit.cell;
    let selection;
    if (drag.selecting) {
      const forward = anchor.pos <= hit.cell.pos;
      selection = TextSelection.between(
        view.state.doc.resolve(anchor.pos + (forward ? 1 : anchor.node.nodeSize - 1)),
        view.state.doc.resolve(hit.cell.pos + (forward ? hit.cell.node.nodeSize - 1 : 1)),
      );
    } else {
      const at = view.posAtCoords(point)?.pos;
      if (at === undefined || cellAt(drag.grid, at)?.pos !== anchor.pos) return;
      selection = TextSelection.between(view.state.doc.resolve(at < drag.textFrom ? drag.textTo : drag.textFrom), view.state.doc.resolve(at));
    }
    const range = tableSelectionKey.getState(view.state);
    if (selection.eq(view.state.selection) && range?.head === hit.cell.pos + 1) return;
    view.dispatch(view.state.tr.setSelection(selection).setMeta(tableSelectionKey, { anchor: anchor.pos + 1, head: hit.cell.pos + 1, dragging: true }));
    // Do not focus or scroll here: both can move the viewport during a drag.
  };

  private end = () => {
    const drag = this.drag;
    this.destroy();
    if (!drag || drag.doc !== drag.view.state.doc || drag.view.isDestroyed) return;
    drag.view.dispatch(drag.view.state.tr.setMeta(tableSelectionKey, drag.selecting ? { anchor: drag.anchor.pos + 1, head: drag.head.pos + 1 } : null));
  };

  cancel = () => {
    const drag = this.drag;
    this.destroy();
    if (!drag || drag.doc !== drag.view.state.doc || drag.view.isDestroyed) return;
    const range = tableSelectionKey.getState(drag.view.state);
    if (range?.dragging) drag.view.dispatch(drag.view.state.tr.setMeta(tableSelectionKey, { ...range, dragging: false }));
  };

  destroy = () => {
    const document = this.drag?.view.dom.ownerDocument;
    document?.removeEventListener('mousemove', this.move, true);
    document?.removeEventListener('mouseup', this.end, true);
    document?.defaultView?.removeEventListener('blur', this.cancel);
    this.drag = undefined;
  };
}
