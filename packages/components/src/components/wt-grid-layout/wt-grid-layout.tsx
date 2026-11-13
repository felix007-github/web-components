import { Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, Watch, h } from '@stencil/core';
import { cloneLayout, fitGridLayout, moveGridItem, validateLayout } from './layout';
import type { GridLayoutItem, GridLayoutOptions } from './layout';

interface Gesture {
  id: string; action: 'move' | 'resize'; active: boolean; base: GridLayoutItem[]; item: GridLayoutItem;
  startX: number; startY: number; lastX: number; lastY: number; unit: number;
  width: number; height: number; handle: HTMLElement; pointerId: number;
}

@Component({ tag: 'wt-grid-layout', styleUrl: 'wt-grid-layout.scss', shadow: true })
export class WtGridLayout {
  @Element() el!: HTMLElement;
  /** Initial/externally controlled cards. Replace the array to apply new data. */
  @Prop() items: GridLayoutItem[] = [];
  @Prop() columns = 192;
  @Prop() editable = false;
  /** Card spacing in grid cells. */
  @Prop() gap = 1;
  /** Actual overlap in pixels required before live avoidance. */
  @Prop() collisionTolerance = 8;
  /** Optional persistence key. Storage is only written by saveLayout(). */
  @Prop() storageKey?: string;
  @State() private layout: GridLayoutItem[] = [];
  @State() private cell = 7;
  private baseline: GridLayoutItem[] = [];
  private initial: GridLayoutItem[] = [];
  private gesture?: Gesture;
  private observer?: ResizeObserver;
  /** True until the container width is measurable (custom elements start as inline boxes). */
  private measuring = false;

  @Event({ eventName: 'wt-layout-change' }) layoutChange!: EventEmitter<GridLayoutItem[]>;
  @Event({ eventName: 'wt-layout-save' }) layoutSave!: EventEmitter<GridLayoutItem[]>;
  @Event({ eventName: 'wt-layout-error' }) layoutError!: EventEmitter<{ message: string }>;
  @Event({ eventName: 'wt-layout-interaction' }) interaction!: EventEmitter<{ id: string; action: 'move' | 'resize'; phase: 'start' | 'end' | 'cancel' }>;

  private options(snap = true): GridLayoutOptions {
    return { columns: this.columnCount, cell: this.cell, gap: Math.max(0, Math.round(this.gap || 0)), collisionTolerance: Math.max(0, this.collisionTolerance || 0), snap, applyMinHeight: !this.measuring };
  }
  private get columnCount() { return Math.max(1, Math.min(1024, Math.round(this.columns) || 192)); }
  private apply(items: GridLayoutItem[]) {
    validateLayout(items, this.columnCount);
    this.layout = fitGridLayout(items, this.options());
  }
  private report(error: unknown) { this.layoutError.emit({ message: error instanceof Error ? error.message : 'Layout operation failed.' }); }

  componentWillLoad() {
    const width = this.el.clientWidth;
    this.measuring = width <= 0;
    this.cell = this.measuring ? 7 : width / this.columnCount;
    this.onItems();
    if (this.storageKey) {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.version !== 1 || saved.columns !== this.columnCount || !Array.isArray(saved.items)
            || saved.items.length !== this.items.length || saved.items.some(item => !this.items.some(original => original.id === item.id))) throw new Error('Saved layout does not match these cards.');
          // Stored geometry cannot override current titles or size constraints.
          this.apply(this.items.map(item => {
            const geometry = saved.items.find(savedItem => savedItem.id === item.id);
            return { ...item, x: geometry.x, y: geometry.y, w: geometry.w, h: geometry.h };
          }));
          this.baseline = cloneLayout(this.layout);
        }
      } catch (error) { this.report(error); }
    }
  }
  componentDidLoad() {
    this.updateCell(this.el.clientWidth / this.columnCount);
    this.observer = new ResizeObserver(() => this.updateCell(this.el.clientWidth / this.columnCount));
    this.observer.observe(this.el);
    // Styles land with the first paint, so retry once the grid has a real width.
    requestAnimationFrame(() => this.updateCell(this.el.clientWidth / this.columnCount));
  }
  private updateCell(cell: number) {
    if (cell <= 0 || Math.abs(cell - this.cell) < .001) return;
    this.measuring = false;
    this.finish(true); this.cell = cell;
    this.layout = fitGridLayout(this.layout, this.options());
    this.baseline = fitGridLayout(this.baseline, this.options());
  }
  connectedCallback() { this.observer?.observe(this.el); }
  disconnectedCallback() { this.observer?.disconnect(); this.finish(true); }
  @Watch('items') onItems() {
    try { this.finish(true); this.apply(this.items); this.initial = cloneLayout(this.items); this.baseline = cloneLayout(this.layout); }
    catch (error) { this.report(error); }
  }
  @Watch('columns') onColumns() {
    this.finish(true);
    const cell = this.el.clientWidth / this.columnCount;
    if (cell > 0) { this.measuring = false; this.cell = cell; }
    this.layout = fitGridLayout(this.layout, this.options()); this.baseline = fitGridLayout(this.baseline, this.options());
  }
  @Watch('editable') onEditable(value: boolean) { if (!value) this.finish(true); }
  @Watch('gap') onGap() { this.finish(true); this.layout = fitGridLayout(this.layout, this.options()); }

  /** Current committed geometry; during a gesture returns its pre-drag snapshot. */
  @Method() async getLayout(): Promise<GridLayoutItem[]> { return cloneLayout(this.gesture?.base || this.layout); }
  /** Set geometry without replacing the original reset target. */
  @Method() async setLayout(items: GridLayoutItem[]): Promise<void> { this.finish(true); this.apply(items); }
  /** Save a baseline, optionally persist it using storageKey. Rejects storage failures. */
  @Method() async saveLayout(): Promise<GridLayoutItem[]> {
    if (this.gesture) throw new Error('Finish dragging before saving.');
    const snapshot = cloneLayout(this.layout);
    if (this.storageKey) localStorage.setItem(this.storageKey, JSON.stringify({ version: 1, columns: this.columnCount, items: snapshot }));
    this.baseline = cloneLayout(snapshot); this.layoutSave.emit(cloneLayout(snapshot)); return snapshot;
  }
  /** Discard edits made since the last save or items replacement. */
  @Method() async restoreLayout(): Promise<void> { this.finish(true); this.apply(this.baseline); this.layoutChange.emit(cloneLayout(this.layout)); }
  /** Restore the initial items. Call saveLayout() to persist the reset. */
  @Method() async resetLayout(): Promise<void> { this.finish(true); this.apply(this.initial); this.layoutChange.emit(cloneLayout(this.layout)); }

  private changeFor(g: Gesture) {
    const dx = (g.lastX - g.startX) / g.unit, dy = (g.lastY - g.startY) / g.unit;
    return g.action === 'move' ? { x: g.item.x + dx, y: g.item.y + dy } : { w: g.item.w + dx, h: g.item.h + dy };
  }
  private finish(cancel = false) {
    const g = this.gesture; if (!g) return;
    this.gesture = undefined;
    this.layout = cancel || !g.active ? g.base : moveGridItem(g.base, g.id, this.changeFor(g), { ...this.options(), cell: g.unit });
    if (g.handle.hasPointerCapture(g.pointerId)) g.handle.releasePointerCapture(g.pointerId);
    if (g.active) {
      this.interaction.emit({ id: g.id, action: g.action, phase: cancel ? 'cancel' : 'end' });
      if (!cancel) this.layoutChange.emit(cloneLayout(this.layout));
    }
  }
  @Listen('pointerdown', { passive: false }) onPointerDown(event: PointerEvent) {
    if (!this.editable || this.gesture || event.button !== 0) return;
    const path = event.composedPath().filter(item => item instanceof HTMLElement) as HTMLElement[];
    const tile = path.find(item => item.hasAttribute('data-grid-id'));
    const control = path.find(item => item.hasAttribute('data-grid-action'));
    if (!tile || !this.el.shadowRoot?.contains(tile)) return;
    if (!control && path.some(item => item.matches('button,a,input,select,textarea,wt-button,wt-checkbox,[contenteditable],[data-no-drag]'))) return;
    if (path.some(item => {
      if (item.scrollHeight <= item.clientHeight && item.scrollWidth <= item.clientWidth) return false;
      const rect = item.getBoundingClientRect();
      return event.clientX >= rect.left + item.clientWidth || event.clientY >= rect.top + item.clientHeight;
    })) return;
    const id = tile.dataset.gridId!, item = this.layout.find(item => item.id === id)!;
    const rect = tile.getBoundingClientRect(), handle = control || tile;
    event.preventDefault(); (control || tile.querySelector<HTMLElement>('[data-grid-action="move"]'))?.focus({ preventScroll: true });
    this.gesture = { id, action: control?.dataset.gridAction === 'resize' ? 'resize' : 'move', active: !!control, base: cloneLayout(this.layout), item: { ...item }, startX: event.pageX, startY: event.pageY, lastX: event.pageX, lastY: event.pageY, unit: this.cell, width: rect.width, height: rect.height, handle, pointerId: event.pointerId };
    handle.setPointerCapture(event.pointerId);
    if (this.gesture.active) this.interaction.emit({ id, action: this.gesture.action, phase: 'start' });
    this.layout = cloneLayout(this.layout);
  }
  @Listen('pointermove') onPointerMove(event: PointerEvent) {
    const g = this.gesture; if (!g || event.pointerId !== g.pointerId) return;
    g.lastX = event.pageX; g.lastY = event.pageY;
    if (!g.active) {
      if (Math.hypot(g.lastX - g.startX, g.lastY - g.startY) < 4) return;
      g.active = true; this.interaction.emit({ id: g.id, action: g.action, phase: 'start' });
    }
    this.layout = moveGridItem(g.base, g.id, this.changeFor(g), { ...this.options(false), cell: g.unit });
  }
  @Listen('pointerup') onPointerUp(event: PointerEvent) { if (event.pointerId === this.gesture?.pointerId) { this.onPointerMove(event); this.finish(); } }
  @Listen('pointercancel') onPointerCancel() { this.finish(true); }
  @Listen('lostpointercapture') onLostCapture(event: PointerEvent) { if (event.pointerId === this.gesture?.pointerId) this.finish(true); }
  @Listen('blur', { target: 'window' }) onBlur() { this.finish(true); }
  @Listen('keydown', { target: 'window' }) onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.gesture) { event.preventDefault(); this.finish(true); return; }
    if (!event.composedPath().includes(this.el)) return;
    if (!this.editable || this.gesture || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    const handle = event.composedPath().find(item => item instanceof HTMLElement && item.hasAttribute('data-grid-action')) as HTMLElement | undefined;
    const tile = handle?.closest<HTMLElement>('[data-grid-id]'); if (!tile) return;
    event.preventDefault();
    const item = this.layout.find(item => item.id === tile.dataset.gridId)!;
    const dx = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0, dy = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    this.layout = moveGridItem(this.layout, item.id, handle!.dataset.gridAction === 'resize' ? { w: item.w + dx, h: item.h + dy } : { x: item.x + dx, y: item.y + dy }, this.options());
    this.layoutChange.emit(cloneLayout(this.layout));
  }

  render() {
    const g = this.gesture;
    const rows = Math.max(0, ...this.layout.map(item => Math.ceil(item.y + item.h)), g ? g.item.y + g.item.h : 0);
    return <Host data-editing={this.editable ? '' : undefined} data-dragging={g?.active ? '' : undefined}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${this.columnCount}, minmax(0, 1fr))`, gridTemplateRows: rows ? `repeat(${rows}, minmax(0, 1fr))` : 'none', height: `${rows * this.cell}px`, '--wt-grid-cell': `${this.cell}px` }}>
      {this.layout.map(item => {
        const active = g?.id === item.id, shown = active ? g!.item : item;
        const style: Record<string, string> = { gridColumn: `${shown.x + 1} / span ${shown.w}`, gridRow: `${shown.y + 1} / span ${shown.h}` };
        if (active && g!.active) {
          if (g!.action === 'move') style.transform = `translate(${(item.x - shown.x) * g!.unit}px, ${(item.y - shown.y) * g!.unit}px)`;
          else { style.width = `${g!.width + (item.w - shown.w) * g!.unit}px`; style.height = `${g!.height + (item.h - shown.h) * g!.unit}px`; }
        }
        return <article key={item.id} part="card" class={{ tile: true, interacting: active && !!g?.active }} data-grid-id={item.id} data-id={item.id} style={style} aria-label={item.title || item.id}>
          <div part="header" class="header"><slot name={`header-${item.id}`}><h3>{item.title || item.id}</h3></slot>
            <button part="drag-handle" class="drag-handle" hidden={!this.editable} data-grid-action="move" aria-label={`移动${item.title || item.id}`} title="拖动调整位置；方向键移动">⠿</button></div>
          <div part="body" class="body"><slot name={item.id}></slot></div>
          <span class="size" hidden={!this.editable} aria-hidden="true">{Math.round(item.w)} × {Math.round(item.h)}</span>
          <button part="resize-handle" class="resize-handle" hidden={!this.editable} data-grid-action="resize" aria-label={`缩放${item.title || item.id}`} title="拖动缩放；方向键调整尺寸">⌟</button>
        </article>;
      })}
    </Host>;
  }
}
