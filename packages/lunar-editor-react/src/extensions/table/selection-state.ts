import { PluginKey } from '@mache-hangar/lunar-editor-core/pm';
import type { CellRange } from './commands';

export const tableSelectionKey = new PluginKey<CellRange>('lunar-table-selection');
