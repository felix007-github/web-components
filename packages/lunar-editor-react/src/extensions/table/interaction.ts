import { Decoration, DecorationSet, Plugin, TextSelection, type EditorView } from '@mache-hangar/lunar-editor-core/pm';
import { cellAt, tableAt } from './grid';
import { getTableState, runTableCommand, tableContext, type CellRange, type TableState } from './commands';
import { tableSelectionKey } from './selection-state';
import { CellDragSelection } from './cell-drag';

export type TableExtensionOptions = { onStateChange?: (state: TableState) => void };

function focusCell(view: EditorView, pos: number) {
  view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(pos + 1))));
  view.focus();
}

export function createTableInteraction(options: TableExtensionOptions) {
  const drag = new CellDragSelection();
  return new Plugin<CellRange>({
    key: tableSelectionKey,
    state: {
      init: () => null,
      apply(tr, value, previous) {
        const range = tr.getMeta(tableSelectionKey);
        if (range !== undefined) return range;
        if (tr.docChanged) return null;
        return tr.selectionSet && !drag.active && !tr.selection.eq(previous.selection) ? null : value;
      },
    },
    props: {
      attributes(state) {
        const classes: string[] = [];
        if ((tableContext(state)?.cells?.length || 0) > 1) classes.push('lunar-table-cell-selection');
        if (tableSelectionKey.getState(state)?.dragging && drag.active) classes.push('lunar-table-dragging');
        return { class: classes.join(' ') };
      },
      decorations(state) {
        const context = tableContext(state);
        if (!context?.cells || context.cells.length < 2) return null;
        return DecorationSet.create(
          state.doc,
          context.cells.map(cell => Decoration.node(cell.pos, cell.pos + cell.node.nodeSize, { class: 'lunar-table-cell--selected' })),
        );
      },
      handleDOMEvents: {
        keydown(view, event) {
          drag.cancel();
          const handled = handleTableKey(view, event);
          if (handled) event.preventDefault();
          return handled;
        },

        mousedown(view, event) {
          drag.cancel();
          if (!view.editable || event.button !== 0) return false;
          const target = (event.target as Element | null)?.closest?.('td, th');
          if (event.shiftKey && target && view.dom.contains(target)) {
            const context = tableContext(view.state);
            const pos = view.posAtDOM(target, 0);
            if (context?.grid && tableAt(view.state.doc.resolve(pos))?.pos === context.grid.pos) {
              const head = cellAt(context.grid, pos);
              const anchor = cellAt(context.grid, tableSelectionKey.getState(view.state)?.anchor ?? view.state.selection.anchor);
              if (anchor && head) {
                event.preventDefault();
                view.dispatch(view.state.tr.setMeta(tableSelectionKey, { anchor: anchor.pos + 1, head: head.pos + 1 }));
                return true;
              }
            }
          }
          if (tableSelectionKey.getState(view.state)) view.dispatch(view.state.tr.setMeta(tableSelectionKey, null));
          return drag.start(view, event);
        },
      },
      handleTextInput(view, _from, _to, text) {
        if ((tableContext(view.state)?.cells?.length || 0) < 2) return false;
        return runTableCommand(view, { action: 'clear_cells' }, text);
      },
    },
    view(view) {
      let signature = '';
      const publish = () => {
        const state = getTableState(view),
          next = JSON.stringify(state);
        if (signature !== next) {
          signature = next;
          options.onStateChange?.(state);
        }
      };
      publish();
      return {
        update() {
          drag.cancelIfStale(view);
          publish();
        },
        destroy: drag.destroy,
      };
    },
  });
}

function handleTableKey(view: EditorView, event: KeyboardEvent): boolean {
  if (!view.editable) return false;
  const context = tableContext(view.state);
  if (!context?.grid || !context.rect) return false;
  if (event.key === 'Escape' && (tableSelectionKey.getState(view.state) || context.cells!.length > 1)) {
    view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.selection.$head)).setMeta(tableSelectionKey, null));
    return true;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (['Backspace', 'Delete'].includes(event.key) && context.cells!.length > 1) {
    return runTableCommand(view, { action: 'clear_cells' });
  }
  if (event.key !== 'Tab') return false;
  const grid = context.grid;
  const current = cellAt(grid, view.state.selection.head);
  if (!current) return false;
  const index = grid.cells.indexOf(current) + (event.shiftKey ? -1 : 1);
  if (index < 0) return false;
  if (index < grid.cells.length) {
    focusCell(view, grid.cells[index].pos);
    return true;
  }
  // The final Tab appends a row; the command focuses its first cell.
  if (!runTableCommand(view, { action: 'row_after' })) return false;
  const next = tableContext(view.state)?.grid;
  const first = next?.matrix[next.rows.length - 1]?.[0];
  if (first) focusCell(view, first.pos);
  return true;
}
