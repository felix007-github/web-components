export interface GridLayoutItem {
  id: string;
  title?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  /** Minimum card height in pixels. */
  minHeight?: number;
}

export interface GridLayoutOptions {
  columns: number;
  cell: number;
  gap: number;
  collisionTolerance: number;
  snap?: boolean;
  /** Skip min-height inflation while the container width is still unknown. */
  applyMinHeight?: boolean;
}

export const cloneLayout = (items: GridLayoutItem[]): GridLayoutItem[] => items.map(item => ({ ...item }));
const ceil = (value: number) => Math.ceil(value - 1e-7);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const minWidth = (item: GridLayoutItem, columns: number) => Math.min(columns, Math.max(1, item.minW ?? 1));
const minHeight = (item: GridLayoutItem, cell: number) => Math.max(1, ceil((item.minHeight ?? 80) / cell));

export function intersects(a: GridLayoutItem, b: GridLayoutItem, gap = 0): boolean {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

export function validateLayout(items: GridLayoutItem[], columns: number): void {
  if (!Array.isArray(items) || items.length > 200) throw new Error('Layout must contain at most 200 cards.');
  const ids = new Set<string>();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)
      || !['x', 'y', 'w', 'h'].every(key => Number.isInteger(item[key]) && item[key] >= 0)
      || item.w < 1 || item.h < 1 || item.x + item.w > columns || item.y + item.h > 10000
      || (item.minW !== undefined && (!Number.isInteger(item.minW) || item.minW < 1 || item.minW > columns))
      || (item.minHeight !== undefined && (!Number.isFinite(item.minHeight) || item.minHeight < 0 || item.minHeight > 10000))) {
      throw new Error('Invalid card identity, dimensions or bounds.');
    }
    ids.add(item.id);
  }
}

export function fitGridLayout(items: GridLayoutItem[], options: GridLayoutOptions): GridLayoutItem[] {
  const placed: GridLayoutItem[] = [];
  for (const item of cloneLayout(items).sort((a, b) => a.y - b.y || a.x - b.x)) {
    item.w = clamp(item.w, minWidth(item, options.columns), options.columns);
    item.x = clamp(item.x, 0, options.columns - item.w);
    item.h = Math.max(item.h, options.applyMinHeight === false ? 1 : minHeight(item, options.cell));
    let collisions: GridLayoutItem[];
    while ((collisions = placed.filter(other => intersects(item, other, options.gap))).length) {
      item.y = ceil(Math.max(...collisions.map(other => other.y + other.h + options.gap)));
    }
    placed.push(item);
  }
  return items.map(item => placed.find(other => other.id === item.id)!);
}

export function moveGridItem(items: GridLayoutItem[], id: string, change: Partial<Pick<GridLayoutItem, 'x' | 'y' | 'w' | 'h'>>, options: GridLayoutOptions): GridLayoutItem[] {
  const next = cloneLayout(items), target = next.find(item => item.id === id);
  if (!target) return next;
  Object.assign(target, change);
  const snap = options.snap !== false, align = (value: number) => snap ? Math.round(value) : value;
  const widthLimit = 'w' in change && !('x' in change) ? options.columns - target.x : options.columns;
  target.w = clamp(align(target.w), minWidth(target, options.columns), widthLimit);
  target.h = clamp(align(target.h), minHeight(target, options.cell), 1000);
  target.x = clamp(align(target.x), 0, options.columns - target.w);
  target.y = clamp(align(target.y), 0, 5000);
  const collides = (a: GridLayoutItem, b: GridLayoutItem) => {
    if (!snap && (a.id === id || b.id === id)) {
      return Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > options.collisionTolerance / options.cell
        && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > options.collisionTolerance / options.cell;
    }
    return intersects(a, b, options.gap);
  };
  const placed = [target];
  for (const item of next.filter(item => item.id !== id).sort((a, b) => a.y - b.y || a.x - b.x)) {
    let collisions: GridLayoutItem[];
    while ((collisions = placed.filter(other => collides(item, other))).length) {
      item.y = ceil(Math.max(...collisions.map(other => other.y + other.h + options.gap)));
    }
    while (snap && item.y > 0 && !placed.some(other => collides({ ...item, y: item.y - 1 }, other))) item.y--;
    placed.push(item);
  }
  return next;
}
