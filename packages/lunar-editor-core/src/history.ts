import { redo, redoDepth, undo, undoDepth } from 'prosemirror-history';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type LunarHistoryState = {
  canUndo: boolean;
  canRedo: boolean;
};

export const EMPTY_LUNAR_HISTORY_STATE: LunarHistoryState = {
  canUndo: false,
  canRedo: false,
};

export function getLunarHistoryState(state: EditorState | undefined): LunarHistoryState {
  return state
    ? { canUndo: undoDepth(state) > 0, canRedo: redoDepth(state) > 0 }
    : EMPTY_LUNAR_HISTORY_STATE;
}

export function runLunarHistoryCommand(view: EditorView, action: 'undo' | 'redo') {
  // Use the same commands and source-aware dispatch as the keyboard shortcuts.
  return (action === 'undo' ? undo : redo)(view.state, view.dispatch);
}
