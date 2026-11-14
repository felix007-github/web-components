import type { EditorExtension } from '@mache-hangar/lunar-editor-core/extensions';
import { TableNodeView } from './table-node-view';
export function createTableExtension(): EditorExtension {
  return {
    name: 'table-view',
    nodeViews: {
      table: (node, view, getPos) => new TableNodeView(node, view, getPos),
    },
  };
}
