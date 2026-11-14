import { MathfieldElement } from 'mathlive';
import {
  type Node as ProseMirrorNode,
  NodeSelection,
  Selection,
  type EditorView,
  type NodeView,
} from '@mache-hangar/lunar-editor-core/pm';

type HtmlAttributes = Record<string, string>;
type GetPos = () => number | undefined;
type MathDisplay = 'block' | 'inline';

MathfieldElement.soundsDirectory = null;

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

function mathNodeAttributes(
  node: ProseMirrorNode,
  selected: boolean,
  editing: boolean,
  display: MathDisplay
): HtmlAttributes {
  const htmlAttrs = { ...(node.attrs.htmlAttrs || {}) };
  const classNames = new Set(
    String(htmlAttrs.class || '')
      .split(/\s+/)
      .filter(Boolean)
  );
  classNames.add('lunar-math-node');
  classNames.add(`lunar-math-${display}`);
  if (selected) {
    classNames.add('ProseMirror-selectednode');
  }
  if (editing) {
    classNames.add('lunar-math-node--editing');
  }

  return {
    ...htmlAttrs,
    class: Array.from(classNames).join(' '),
    'data-type': 'math',
    'data-display': display,
    'data-latex': node.attrs.latex || '',
    contenteditable: 'false',
  };
}

export class MathNodeView implements NodeView {
  readonly dom: HTMLElement;

  private node: ProseMirrorNode;
  private readonly mathfield: MathfieldElement;
  private readonly display: MathDisplay;
  private selected = false;
  private editing = false;

  constructor(
    node: ProseMirrorNode,
    private readonly view: EditorView,
    private readonly getPos: GetPos
  ) {
    this.node = node;
    this.display = node.type.name === 'math_inline' ? 'inline' : 'block';
    this.dom = document.createElement(this.display === 'inline' ? 'span' : 'p');
    this.mathfield = new MathfieldElement();
    this.mathfield.className = `lunar-math-field lunar-math-field--${this.display}`;
    this.mathfield.smartFence = true;
    this.mathfield.mathVirtualKeyboardPolicy = 'auto';
    this.mathfield.setAttribute(
      'aria-label',
      this.display === 'inline' ? 'Inline math formula' : 'Math formula'
    );
    this.mathfield.addEventListener('change', this.handleChange);
    this.mathfield.addEventListener('focus', this.handleFocus);
    this.mathfield.addEventListener('blur', this.handleBlur);
    this.mathfield.addEventListener('keydown', this.handleKeyDown);
    this.dom.addEventListener('pointerdown', this.handlePointerDown, true);
    this.dom.appendChild(this.mathfield);
    this.update(node);
  }

  private handlePointerDown = () => {
    if (!this.view.editable) {
      this.setEditing(false);
      return;
    }

    this.setEditing(true);

    const position = this.getPos();
    if (position === undefined) {
      return;
    }

    const selection = this.view.state.selection;
    if (!(selection instanceof NodeSelection) || selection.from !== position) {
      this.view.dispatch(
        this.view.state.tr.setSelection(
          NodeSelection.create(this.view.state.doc, position)
        )
      );
    }

    window.requestAnimationFrame(() => {
      if (this.editing && this.view.editable) {
        this.mathfield.focus();
      }
    });
  };

  private handleFocus = () => {
    this.setEditing(true);
  };

  private handleBlur = () => {
    this.setEditing(false);
  };

  private setEditing(editing: boolean) {
    this.editing = editing && this.view.editable;
    this.dom.classList.toggle('lunar-math-node--editing', this.editing);
    this.mathfield.readOnly = !this.view.editable;
  }

  private handleChange = () => {
    const position = this.getPos();
    if (position === undefined || !this.view.editable) {
      return;
    }

    const currentNode = this.view.state.doc.nodeAt(position);
    const latex = this.mathfield.value;
    if (
      currentNode?.type !== this.node.type ||
      currentNode.attrs.latex === latex
    ) {
      return;
    }

    this.view.dispatch(
      this.view.state.tr.setNodeMarkup(position, undefined, {
        ...currentNode.attrs,
        latex,
      })
    );
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      this.mathfield.value.trim() === ''
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.deleteEmptyBlock(event.key === 'Backspace' ? -1 : 1);
      return;
    }

    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.mathfield.blur();
    this.view.focus();
  };

  private deleteEmptyBlock(direction: -1 | 1) {
    const position = this.getPos();
    if (position === undefined || !this.view.editable) {
      return;
    }

    const currentNode = this.view.state.doc.nodeAt(position);
    if (currentNode?.type !== this.node.type) {
      return;
    }

    const transaction = this.view.state.tr.delete(
      position,
      position + currentNode.nodeSize
    );
    const selectionPosition = Math.min(position, transaction.doc.content.size);
    transaction.setSelection(
      Selection.near(transaction.doc.resolve(selectionPosition), direction)
    );
    this.view.dispatch(transaction);

    window.requestAnimationFrame(() => {
      this.view.focus();
    });
  }

  update(node: ProseMirrorNode) {
    if (node.type.name !== `math_${this.display}`) {
      return false;
    }

    this.node = node;
    updateHtmlAttributes(
      this.dom,
      mathNodeAttributes(node, this.selected, this.editing, this.display)
    );
    this.mathfield.readOnly = !this.view.editable;

    const latex = node.attrs.latex || '';
    if (this.mathfield.value !== latex) {
      this.mathfield.setValue(latex, { silenceNotifications: true });
    }
    return true;
  }

  selectNode() {
    this.selected = true;
    this.dom.classList.add('ProseMirror-selectednode');
    if (!this.view.editable) {
      this.setEditing(false);
      return;
    }

    this.setEditing(true);

    window.requestAnimationFrame(() => {
      this.mathfield.focus();
    });
  }

  deselectNode() {
    this.selected = false;
    this.dom.classList.remove('ProseMirror-selectednode');
    this.setEditing(false);
  }

  stopEvent(event: Event) {
    return event.target instanceof Node && this.dom.contains(event.target);
  }

  ignoreMutation() {
    return true;
  }

  destroy() {
    this.mathfield.removeEventListener('change', this.handleChange);
    this.mathfield.removeEventListener('focus', this.handleFocus);
    this.mathfield.removeEventListener('blur', this.handleBlur);
    this.mathfield.removeEventListener('keydown', this.handleKeyDown);
    this.dom.removeEventListener('pointerdown', this.handlePointerDown, true);
  }
}
