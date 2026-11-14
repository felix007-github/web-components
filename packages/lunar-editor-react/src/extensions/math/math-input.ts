import {
  NodeSelection,
  Plugin,
  type EditorView,
} from '@mache-hangar/lunar-editor-core/pm';

function getParagraphTextWithInput(
  view: EditorView,
  from: number,
  to: number,
  text: string
) {
  const resolvedFrom = view.state.doc.resolve(from);
  const resolvedTo = view.state.doc.resolve(to);

  if (
    resolvedFrom.parent !== resolvedTo.parent ||
    resolvedFrom.parent.type !== view.state.schema.nodes.paragraph
  ) {
    return undefined;
  }

  const paragraph = resolvedFrom.parent;
  const before = paragraph.textBetween(0, resolvedFrom.parentOffset, '', '');
  const after = paragraph.textBetween(
    resolvedTo.parentOffset,
    paragraph.content.size,
    '',
    ''
  );

  return {
    paragraph,
    text: `${before}${text}${after}`,
    paragraphStart: resolvedFrom.before(),
    paragraphEnd: resolvedFrom.after(),
  };
}

export function insertBlockMathFromDollarInput(
  view: EditorView,
  from: number,
  to: number,
  text: string
) {
  if (!text.includes('$')) {
    return false;
  }

  const match = getParagraphTextWithInput(view, from, to, text);
  const mathBlock = view.state.schema.nodes.math_block;
  if (!match || match.text !== '$$' || !mathBlock) {
    return false;
  }

  const htmlAttrs = { ...(match.paragraph.attrs.htmlAttrs || {}) };
  delete htmlAttrs['data-type'];
  delete htmlAttrs['data-display'];
  delete htmlAttrs['data-latex'];

  const transaction = view.state.tr.replaceWith(
    match.paragraphStart,
    match.paragraphEnd,
    mathBlock.create({
      htmlAttrs,
      latex: '',
      sourceKey: match.paragraph.attrs.sourceKey || null,
    })
  );
  transaction.setSelection(
    NodeSelection.create(transaction.doc, match.paragraphStart)
  );
  view.dispatch(transaction.scrollIntoView());
  return true;
}

export function insertInlineMathFromDotDollarInput(
  view: EditorView,
  from: number,
  to: number,
  text: string
) {
  if (text !== '$' || from !== to) {
    return false;
  }

  const resolvedFrom = view.state.doc.resolve(from);
  if (
    resolvedFrom.parent.type !== view.state.schema.nodes.paragraph ||
    resolvedFrom.parentOffset < 2
  ) {
    return false;
  }

  const triggerStartOffset = resolvedFrom.parentOffset - 2;
  const triggerPrefix = resolvedFrom.parent.textBetween(
    triggerStartOffset,
    resolvedFrom.parentOffset,
    '',
    ''
  );
  const mathInline = view.state.schema.nodes.math_inline;
  if (triggerPrefix !== '$.' || !mathInline) {
    return false;
  }

  const triggerStart = from - 2;
  const transaction = view.state.tr.replaceWith(
    triggerStart,
    to,
    mathInline.create({ htmlAttrs: {}, latex: '' })
  );
  transaction.setSelection(NodeSelection.create(transaction.doc, triggerStart));
  view.dispatch(transaction.scrollIntoView());
  return true;
}

export function createMathInputPlugin() {
  return new Plugin({
    props: {
      handleTextInput: (view, from, to, text) =>
        insertInlineMathFromDotDollarInput(view, from, to, text) ||
        insertBlockMathFromDollarInput(view, from, to, text),
    },
  });
}
