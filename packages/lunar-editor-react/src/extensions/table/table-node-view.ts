import type {
  Node as ProseMirrorNode,
  NodeView,
  EditorView,
  ViewMutationRecord,
} from '@mache-hangar/lunar-editor-core/pm';
import {
  measureColumns,
  resizeColumns,
  MIN_COLUMN_WIDTH,
  type ColumnLayout,
} from './column-layout';
import { commitColumnWidths, withWidth } from './resize-transaction';

type HtmlAttributes = Record<string, string>;

function updateHtmlAttributes(
  element: HTMLElement,
  attributes: HtmlAttributes
) {
  Array.from(element.attributes).forEach((attribute) => {
    if (!(attribute.name in attributes)) {
      element.removeAttribute(attribute.name);
    }
  });

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

export class TableNodeView implements NodeView {
  readonly dom: HTMLDivElement;
  readonly contentDOM: HTMLTableElement;
  private readonly controls: HTMLDivElement;
  private node: ProseMirrorNode;
  private observer?: ResizeObserver;
  private frame = 0;
  private readonly previewNodes = new WeakSet<Node>();
  private drag?: {
    pointerId: number;
    column: number;
    startX: number;
    layout: ColumnLayout;
    edgeOffset: number;
    widths: number[];
    document: ProseMirrorNode;
    preview: HTMLTableColElement;
    originals: { node: Element; next: ChildNode | null }[];
    style: string | null;
  };

  constructor(
    node: ProseMirrorNode,
    private readonly view: EditorView,
    private readonly getPos: () => number | undefined
  ) {
    const document = view.dom.ownerDocument;
    this.node = node;
    this.dom = document.createElement('div');
    this.dom.className = 'lunar-table-scroll';
    this.contentDOM = document.createElement('table');
    this.dom.appendChild(this.contentDOM);
    this.controls = document.createElement('div');
    this.controls.className = 'lunar-table-resize-controls';
    this.controls.contentEditable = 'false';
    this.dom.append(this.controls);
    this.dom.addEventListener('pointerover', this.showControls);
    this.dom.addEventListener('pointerleave', this.hideControls);
    this.dom.addEventListener('focusin', this.showControls);
    this.dom.addEventListener('focusout', this.hideControls);
    this.dom.addEventListener('scroll', this.scheduleLayout);
    this.controls.addEventListener('pointerdown', this.startDrag);
    this.controls.addEventListener('keydown', this.onHandleKeyDown);
    this.update(node);
  }

  update(node: ProseMirrorNode) {
    if (node.type.name !== 'table') {
      return false;
    }

    if (this.drag && (node !== this.node || !this.view.editable))
      this.finishDrag(false);
    this.node = node;
    if (!this.drag)
      updateHtmlAttributes(this.contentDOM, node.attrs.htmlAttrs || {});
    this.dom.classList.toggle(
      'lunar-table-scroll--fixed',
      this.contentDOM.style.tableLayout === 'fixed'
    );
    if (this.controls.childElementCount) this.scheduleLayout();
    return true;
  }

  private showControls = (event: Event) => {
    if (!this.view.editable || this.drag || this.controls.childElementCount)
      return;
    const target = event.target as Element;
    if (target.closest?.('.lunar-table-scroll') !== this.dom) return;
    this.refreshControls();
    const Observer = this.dom.ownerDocument.defaultView?.ResizeObserver;
    if (Observer && !this.observer) {
      this.observer = new Observer(this.scheduleLayout);
      this.observer.observe(this.contentDOM);
    }
  };

  private hideControls = (event: Event) => {
    if (this.drag) return;
    const related = (event as FocusEvent).relatedTarget as Node | null;
    if (related && this.dom.contains(related)) return;
    if (
      event.type === 'pointerleave' &&
      this.controls.contains(this.dom.ownerDocument.activeElement)
    )
      return;
    this.controls.replaceChildren();
    this.observer?.disconnect();
    this.observer = undefined;
  };

  private scheduleLayout = () => {
    if (this.frame) return;
    this.frame = this.dom.ownerDocument.defaultView!.requestAnimationFrame(
      () => {
        this.frame = 0;
        if (this.controls.childElementCount) this.refreshControls();
      }
    );
  };

  private refreshControls() {
    if (!this.view.editable) {
      this.controls.replaceChildren();
      return;
    }
    const table = this.contentDOM.getBoundingClientRect();
    const drag = this.drag;
    let layout: ColumnLayout | undefined;
    if (drag) {
      // Column topology cannot change during a drag. Reuse it instead of
      // walking every row and measuring every cell on every animation frame.
      const boundaries = [table.left + drag.edgeOffset];
      drag.widths.forEach((width) =>
        boundaries.push(
          boundaries[boundaries.length - 1] + width * drag.layout.direction
        )
      );
      layout = {
        widths: drag.widths,
        boundaries,
        direction: drag.layout.direction,
      };
    } else layout = measureColumns(this.contentDOM);
    if (!layout) {
      this.controls.replaceChildren();
      return;
    }
    const count = layout.widths.length - 1;
    if (this.controls.childElementCount !== count) {
      this.controls.replaceChildren();
      for (let column = 0; column < count; column++) {
        const handle = this.dom.ownerDocument.createElement('div');
        handle.className = 'lunar-table-column-handle';
        handle.dataset.column = String(column);
        handle.setAttribute('role', 'separator');
        handle.setAttribute('aria-orientation', 'vertical');
        handle.setAttribute('aria-label', `Resize column ${column + 1}`);
        handle.title =
          'Drag to resize column · Arrow keys to adjust · Esc to cancel';
        handle.tabIndex = 0;
        this.controls.append(handle);
      }
    }
    // Use the actual positioning layer as the origin. Its viewport rectangle
    // already includes container borders, indentation and horizontal scrolling.
    const controls = this.controls.getBoundingClientRect();
    const bodyTop = Math.max(
      table.top,
      this.contentDOM.rows[0]?.getBoundingClientRect().top ?? table.top
    );
    Array.from(this.controls.children).forEach((element, index) => {
      const handle = element as HTMLElement;
      handle.style.left = `${layout.boundaries[index + 1] - controls.left}px`;
      handle.style.top = `${bodyTop - controls.top}px`;
      handle.style.height = `${table.bottom - bodyTop}px`;
      handle.setAttribute(
        'aria-valuenow',
        String(Math.round(layout.widths[index]))
      );
      handle.setAttribute(
        'aria-valuemin',
        String(Math.min(MIN_COLUMN_WIDTH, Math.round(layout.widths[index])))
      );
      handle.setAttribute(
        'aria-valuemax',
        String(
          Math.round(
            layout.widths[index] +
              layout.widths[index + 1] -
              Math.min(MIN_COLUMN_WIDTH, layout.widths[index + 1])
          )
        )
      );
    });
  }

  private handleColumn(event: Event) {
    const handle = (event.target as Element).closest<HTMLElement>(
      '.lunar-table-column-handle'
    );
    return handle && this.controls.contains(handle)
      ? Number(handle.dataset.column)
      : undefined;
  }

  private startDrag = (event: PointerEvent) => {
    const column = this.handleColumn(event);
    const layout = measureColumns(this.contentDOM);
    if (
      !this.view.editable ||
      event.button !== 0 ||
      column === undefined ||
      !layout ||
      column >= layout.widths.length - 1 ||
      this.drag
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    const document = this.dom.ownerDocument;
    const preview = document.createElement('colgroup');
    this.previewNodes.add(preview);
    const originals = Array.from(this.contentDOM.children)
      .filter((child) => child.tagName === 'COLGROUP')
      .map((node) => ({ node, next: node.nextSibling }));
    this.drag = {
      column,
      pointerId: event.pointerId,
      startX: event.clientX,
      layout,
      edgeOffset:
        layout.boundaries[0] - this.contentDOM.getBoundingClientRect().left,
      widths: layout.widths,
      document: this.view.state.doc,
      preview,
      originals,
      style: this.contentDOM.getAttribute('style'),
    };
    for (const { node } of originals) {
      this.previewNodes.add(node);
      node.remove();
    }
    layout.widths.forEach((width) => {
      const col = document.createElement('col');
      col.style.width = `${width}px`;
      this.previewNodes.add(col);
      preview.append(col);
    });
    const caption = this.contentDOM.caption;
    this.contentDOM.insertBefore(
      preview,
      caption ? caption.nextSibling : this.contentDOM.firstChild
    );
    this.contentDOM.style.cssText = withWidth(
      this.drag.style || '',
      layout.widths.reduce((a, b) => a + b, 0),
      document,
      true
    );
    this.dom.classList.add(
      'lunar-table-scroll--fixed',
      'lunar-table-scroll--resizing'
    );
    this.controls.children[column]?.classList.add(
      'lunar-table-column-handle--active'
    );
    document.addEventListener('pointermove', this.moveDrag, true);
    document.addEventListener('pointerup', this.endDrag, true);
    document.addEventListener('pointercancel', this.cancelDrag, true);
    document.addEventListener('keydown', this.onDragKeyDown, true);
    document.defaultView?.addEventListener('blur', this.cancelDrag);
    this.scheduleLayout();
  };

  private moveDrag = (event: PointerEvent) => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!this.view.editable || this.view.state.doc !== drag.document) {
      this.finishDrag(false);
      return;
    }
    event.preventDefault();
    drag.widths = resizeColumns(
      drag.layout.widths,
      drag.column,
      (event.clientX - drag.startX) * drag.layout.direction
    );
    for (const index of [drag.column, drag.column + 1]) {
      (
        drag.preview.children[index] as HTMLElement
      ).style.width = `${drag.widths[index]}px`;
    }
    this.scheduleLayout();
  };

  private endDrag = (event: PointerEvent) => {
    if (event.pointerId !== this.drag?.pointerId) return;
    this.moveDrag(event);
    this.finishDrag(true);
  };

  private cancelDrag = () => this.finishDrag(false);
  private onDragKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.finishDrag(false);
    }
  };

  private finishDrag(commit: boolean) {
    const drag = this.drag;
    if (!drag) return;
    this.drag = undefined;
    const document = this.dom.ownerDocument;
    document.removeEventListener('pointermove', this.moveDrag, true);
    document.removeEventListener('pointerup', this.endDrag, true);
    document.removeEventListener('pointercancel', this.cancelDrag, true);
    document.removeEventListener('keydown', this.onDragKeyDown, true);
    document.defaultView?.removeEventListener('blur', this.cancelDrag);
    drag.preview.remove();
    [...drag.originals]
      .reverse()
      .forEach(({ node, next }) => this.contentDOM.insertBefore(node, next));
    if (drag.style === null) this.contentDOM.removeAttribute('style');
    else this.contentDOM.setAttribute('style', drag.style);
    this.dom.classList.remove('lunar-table-scroll--resizing');
    this.controls.children[drag.column]?.classList.remove(
      'lunar-table-column-handle--active'
    );
    this.dom.classList.toggle(
      'lunar-table-scroll--fixed',
      this.contentDOM.style.tableLayout === 'fixed'
    );
    const position = this.getPos();
    if (
      commit &&
      this.view.editable &&
      this.view.state.doc === drag.document &&
      position !== undefined &&
      drag.widths.some(
        (width, index) => Math.abs(width - drag.layout.widths[index]) >= 0.5
      )
    ) {
      commitColumnWidths(this.view, position, drag.widths);
    }
    this.scheduleLayout();
  }

  private onHandleKeyDown = (event: KeyboardEvent) => {
    const column = this.handleColumn(event);
    const layout = measureColumns(this.contentDOM);
    const position = this.getPos();
    if (
      !this.view.editable ||
      column === undefined ||
      !layout ||
      column >= layout.widths.length - 1 ||
      position === undefined ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return;
    event.preventDefault();
    const delta = (event.key === 'ArrowRight' ? 10 : -10) * layout.direction;
    const widths = resizeColumns(layout.widths, column, delta);
    if (widths[column] !== layout.widths[column])
      commitColumnWidths(this.view, position, widths);
    this.scheduleLayout();
  };

  stopEvent(event: Event) {
    return this.controls.contains(event.target as Node);
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    if (mutation.type === 'selection') return false;
    if (!this.contentDOM.contains(mutation.target)) return true;
    if (mutation.type === 'attributes' && mutation.target === this.contentDOM)
      return true;
    if (this.previewNodes.has(mutation.target)) return true;
    return (
      mutation.type === 'childList' &&
      mutation.target === this.contentDOM &&
      [
        ...Array.from(mutation.addedNodes),
        ...Array.from(mutation.removedNodes),
      ].every((node) => this.previewNodes.has(node))
    );
  }

  destroy() {
    this.finishDrag(false);
    this.observer?.disconnect();
    this.dom.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);
    this.dom.removeEventListener('pointerover', this.showControls);
    this.dom.removeEventListener('pointerleave', this.hideControls);
    this.dom.removeEventListener('focusin', this.showControls);
    this.dom.removeEventListener('focusout', this.hideControls);
    this.dom.removeEventListener('scroll', this.scheduleLayout);
    this.controls.removeEventListener('pointerdown', this.startDrag);
    this.controls.removeEventListener('keydown', this.onHandleKeyDown);
  }
}
