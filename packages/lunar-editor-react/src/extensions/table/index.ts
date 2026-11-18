import type { EditorExtension } from '@mache-hangar/lunar-editor-core/extensions';
import { TableNodeView } from './table-node-view';
import { createTableInteraction, type TableExtensionOptions } from './interaction';
export { EMPTY_TABLE_STATE, getTableState, runTableCommand } from './commands';
export type { TableAction, TableCommand, TableState } from './commands';
export type { TableExtensionOptions } from './interaction';

export function createTableExtension(options: TableExtensionOptions = {}): EditorExtension {
  return {
    name: 'table-view',
    plugins: () => [createTableInteraction(options)],
    nodeViews: { table: (node, view, getPos) => new TableNodeView(node, view, getPos) },
  };
}
