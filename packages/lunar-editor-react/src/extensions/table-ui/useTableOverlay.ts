import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { TableState } from '../table/commands';

type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
type Overlay = {
  element: HTMLTableElement;
  table: Rect;
  visible: Rect;
  cell?: Rect;
  toolbar: { left: number; top: number };
  placement: 'above' | 'below' | 'inside';
};

const rect = (left: number, top: number, right: number, bottom: number): Rect => ({
  left,
  top,
  right,
  bottom,
  width: Math.max(0, right - left),
  height: Math.max(0, bottom - top),
});

function clippingRect(element: HTMLElement) {
  let bounds = rect(0, 0, window.innerWidth, window.innerHeight);
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent),
      box = parent.getBoundingClientRect();
    const clipsX = /auto|scroll|hidden|clip/.test(style.overflowX);
    const clipsY = /auto|scroll|hidden|clip/.test(style.overflowY);
    bounds = rect(
      clipsX ? Math.max(bounds.left, box.left) : bounds.left,
      clipsY ? Math.max(bounds.top, box.top) : bounds.top,
      clipsX ? Math.min(bounds.right, box.right) : bounds.right,
      clipsY ? Math.min(bounds.bottom, box.bottom) : bounds.bottom,
    );
  }
  return bounds;
}

function closestElement(node: Node | null) {
  return node instanceof Element ? node : node?.parentElement;
}

const isTableUi = (element: Element | null | undefined) => Boolean(element?.closest('.lunar-table-toolbar, .lunar-table-popover, .lunar-table-button'));

/** Presentation only: overlays live outside the editable DOM and never enter exported HTML. */
export function useTableOverlay(rootRef: RefObject<HTMLElement | null>, toolbarRef: RefObject<HTMLDivElement | null>, state: TableState, enabled: boolean) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const refresh = useRef<() => void>(() => {});
  const active = enabled && state.inTable && state.available;

  useLayoutEffect(() => {
    if (!active) return;
    const host = rootRef.current;
    const root = host?.matches('.ProseMirror') ? host : host?.querySelector<HTMLElement>('.ProseMirror');
    if (!host || !root) return;
    let frame = 0,
      dismissed = false;
    let table: HTMLTableElement | undefined;
    const observer = new ResizeObserver(() => schedule());
    const update = () => {
      frame = 0;
      const selection = window.getSelection();
      const anchor = closestElement(selection?.anchorNode ?? null);
      const candidate = anchor?.closest<HTMLTableElement>('table');
      if (candidate && root.contains(candidate) && candidate !== table) {
        table = candidate;
        observer.disconnect();
        observer.observe(root);
        observer.observe(host);
        observer.observe(table);
      }
      if (!table?.isConnected || dismissed || (root.contains(anchor ?? null) && !candidate)) {
        setOverlay(null);
        return;
      }
      const box = table.getBoundingClientRect(),
        clip = clippingRect(table);
      const visible = rect(Math.max(box.left, clip.left), Math.max(box.top, clip.top), Math.min(box.right, clip.right), Math.min(box.bottom, clip.bottom));
      if (visible.width < 1 || visible.height < 1) {
        setOverlay(null);
        return;
      }
      const bar = toolbarRef.current?.getBoundingClientRect();
      // The table's own horizontal scroll wrapper clips the frame, not its toolbar.
      const rootBox = root.getBoundingClientRect(),
        rootClip = clippingRect(root);
      const toolbarClip = rect(
        Math.max(rootBox.left, rootClip.left),
        Math.max(rootBox.top, rootClip.top),
        Math.min(rootBox.right, rootClip.right),
        Math.min(rootBox.bottom, rootClip.bottom),
      );
      const width = bar?.width || 276,
        height = bar?.height || 40;
      const left = Math.max(
        8,
        Math.min(window.innerWidth - width - 8, Math.max(toolbarClip.left + 4, Math.min(toolbarClip.right - width - 4, visible.left + (visible.width - width) / 2))),
      );
      let top = box.top - height - 10;
      let placement: Overlay['placement'] = 'above';
      if (top < toolbarClip.top + 4) {
        if (box.top >= toolbarClip.top && box.bottom + height + 14 < toolbarClip.bottom) {
          top = box.bottom + 10;
          placement = 'below';
        } else {
          top = toolbarClip.top + 6;
          placement = 'inside';
        }
      }
      const focus = closestElement(selection?.focusNode ?? null)?.closest<HTMLTableCellElement>('td, th');
      const cell = focus && focus.closest('table') === table ? focus.getBoundingClientRect() : undefined;
      const next: Overlay = {
        element: table,
        table: rect(box.left, box.top, box.right, box.bottom),
        visible,
        cell: cell ? rect(cell.left, cell.top, cell.right, cell.bottom) : undefined,
        toolbar: { left, top },
        placement,
      };
      setOverlay(previous => (previous?.element === table && JSON.stringify({ ...previous, element: null }) === JSON.stringify({ ...next, element: null }) ? previous : next));
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const interact = (event: Event) => {
      const target = closestElement(event.target as Node);
      if (isTableUi(target)) return;
      dismissed = !host.contains(target ?? null);
      schedule();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'F10' && root.contains(document.activeElement)) {
        const button = toolbarRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
        if (button) {
          event.preventDefault();
          button.focus();
        }
      }
    };
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    refresh.current = schedule;
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('pointerdown', interact, true);
    document.addEventListener('focusin', interact, true);
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      refresh.current = () => {};
      document.removeEventListener('selectionchange', schedule);
      document.removeEventListener('pointerdown', interact, true);
      document.removeEventListener('focusin', interact, true);
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [active, rootRef, toolbarRef]);

  useLayoutEffect(() => {
    refresh.current();
  }, [state, overlay?.element]);
  return active ? overlay : null;
}
