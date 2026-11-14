// @ts-nocheck
import { closeHistory, history, redo, undo } from 'prosemirror-history';
import { EditorState } from 'prosemirror-state';
import { projectLunarHtml } from '../../schema/index';
import {
  applySourceMutationBatch,
  compileLunarSourceTransaction,
  createLunarSourceMapPlugin,
  createRemoveNodeMutation,
  createReplaceChildrenMutation,
  createReplaceNodesMutation,
  createReplaceTextMutation,
  createSourceMutationBatch,
  createSourceNodeMapOverlay,
  createUnwrapNodeMutation,
  findSourceParentKey,
  getLunarSourceState,
  parseSourceHtml,
  SourceNodeMapOverlayBuilder,
} from '../../source/index';

function element(document, id) {
  return Array.from(document.nodes.values()).find(node => (
    node.kind === 'element' && node.attributes.some(attr => attr.name === 'id' && attr.value === id)
  ));
}

function text(document, value) {
  return Array.from(document.nodes.values()).find(node => node.kind === 'text' && node.value === value);
}

describe('source parent index', () => {
  it.each([1000, 10000])('does not rescan %i sibling entries for repeated lookups or a text-only snapshot', count => {
    const parsed = parseSourceHtml(Array.from({ length: count }, (_, i) => `<p id="p-${i}">Text ${i}</p>`).join(''));
    const root = parsed.nodes.get(parsed.rootKey);
    let siblingReads = 0;
    const childKeys = new Proxy(root.childKeys, {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) siblingReads++;
        return Reflect.get(target, key, receiver);
      },
    });
    const nodes = new Map(parsed.nodes);
    nodes.set(root.key, { ...root, childKeys });
    const original = { ...parsed, nodes };
    const paragraph = element(original, `p-${count - 1}`);
    const target = text(original, `Text ${count - 1}`);
    expect(findSourceParentKey(original, target.key)).toBe(paragraph.key);
    const afterWarmup = siblingReads;
    for (let i = 0; i < 50; i++) {
      expect(findSourceParentKey(original, target.key)).toBe(paragraph.key);
      expect(findSourceParentKey(original, 'missing')).toBeUndefined();
    }
    expect(siblingReads).toBe(afterWarmup);

    const changed = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceTextMutation(original, target.key, 0, 4, 'Changed'),
    ]));
    const afterMutation = siblingReads; // Tree validation has its own independent traversal.
    for (let i = 0; i < 50; i++) expect(findSourceParentKey(changed.document, target.key)).toBe(paragraph.key);
    expect(siblingReads).toBe(afterMutation);
  });

  it.each([false, true])('handles subtree moves and detach/undo/redo independently of mutation order (reversed: %s)', reverse => {
    const original = parseSourceHtml('<section id="a"><p id="child">Text</p></section><section id="b">Keep</section>');
    const a = element(original, 'a'), b = element(original, 'b'), child = element(original, 'child');
    const leaf = text(original, 'Text');
    expect(findSourceParentKey(original, leaf.key)).toBe(child.key);
    const mutations = [
      createReplaceChildrenMutation(original, a.key, []),
      createReplaceChildrenMutation(original, b.key, [...b.childKeys, child.key]),
    ];
    const moved = applySourceMutationBatch(original, createSourceMutationBatch(reverse ? mutations.reverse() : mutations));
    expect(findSourceParentKey(moved.document, child.key)).toBe(b.key);
    expect(findSourceParentKey(moved.document, leaf.key)).toBe(child.key);
    expect(findSourceParentKey(original, child.key)).toBe(a.key);

    const detached = applySourceMutationBatch(moved.document, createSourceMutationBatch([
      createRemoveNodeMutation(moved.document, child.key),
    ]));
    expect(detached.document.nodes.has(leaf.key)).toBe(true);
    expect(findSourceParentKey(detached.document, child.key)).toBeUndefined();
    expect(findSourceParentKey(detached.document, leaf.key)).toBeUndefined();
    const restored = applySourceMutationBatch(detached.document, detached.inverse);
    expect(findSourceParentKey(restored.document, leaf.key)).toBe(child.key);
    expect(findSourceParentKey(restored.document, child.key)).toBe(b.key);
    const redetached = applySourceMutationBatch(restored.document, restored.inverse);
    expect(findSourceParentKey(redetached.document, leaf.key)).toBeUndefined();
    const unmoved = applySourceMutationBatch(moved.document, moved.inverse);
    expect(findSourceParentKey(unmoved.document, child.key)).toBe(a.key);
  });

  it('updates canonical SourceUnit input without rebuilding an index for untouched nodes', () => {
    const projection = projectLunarHtml(Array.from({ length: 1000 }, (_, i) => `<p id="p-${i}">Text ${i}</p>`).join(''));
    const state = EditorState.create({
      doc: projection.doc,
      plugins: [createLunarSourceMapPlugin({ document: projection.sourceDocument, sourceMap: projection.sourceMap })],
    });
    const original = getLunarSourceState(state).document;
    const paragraph = element(original, 'p-999');
    expect(findSourceParentKey(original, paragraph.key)).toBe(original.rootKey);
    const position = state.doc.content.size - 1;
    const next = state.apply(compileLunarSourceTransaction(state, state.tr.insertText('X', position)));
    const changed = getLunarSourceState(next).document;
    const leaf = text(changed, 'Text 999X');
    expect(leaf).toBeDefined();
    const getNode = jest.spyOn(changed.nodes, 'get');
    try {
      expect(findSourceParentKey(changed, leaf.key)).toBe(paragraph.key);
      expect(findSourceParentKey(changed, paragraph.key)).toBe(changed.rootKey);
      expect(getNode.mock.calls.length).toBeLessThan(8);
    } finally {
      getNode.mockRestore();
    }
  });

  it('indexes a previously unindexed orphan subtree when it is attached', () => {
    const original = parseSourceHtml('<section id="hidden"><p id="child">Text</p></section><p id="keep">Keep</p>');
    const root = original.nodes.get(original.rootKey), hidden = element(original, 'hidden');
    const child = element(original, 'child'), leaf = text(original, 'Text'), keep = element(original, 'keep');
    const nodes = new Map(original.nodes);
    nodes.set(root.key, { ...root, childKeys: [keep.key] });
    const detached = { ...original, nodes };
    expect(findSourceParentKey(detached, leaf.key)).toBeUndefined();
    const attached = applySourceMutationBatch(detached, createSourceMutationBatch([
      createReplaceChildrenMutation(detached, root.key, [hidden.key, keep.key]),
    ]));
    expect(findSourceParentKey(attached.document, leaf.key)).toBe(child.key);
    expect(findSourceParentKey(attached.document, hidden.key)).toBe(root.key);
  });

  it.each([false, true])('does not let a simultaneously edited orphan steal a live parent (reversed: %s)', reverse => {
    const original = parseSourceHtml('<section id="a">A</section><section id="b">B</section><section id="c"><p id="child">Text</p></section>');
    const root = original.nodes.get(original.rootKey);
    const a = element(original, 'a'), b = element(original, 'b'), c = element(original, 'c');
    const child = element(original, 'child'), leaf = text(original, 'Text');
    expect(findSourceParentKey(original, leaf.key)).toBe(child.key);
    const mutations = [
      createReplaceChildrenMutation(original, root.key, [b.key, c.key]),
      createReplaceChildrenMutation(original, a.key, [child.key]),
      createReplaceChildrenMutation(original, b.key, [...b.childKeys, child.key]),
      createReplaceChildrenMutation(original, c.key, []),
    ];
    const applied = applySourceMutationBatch(original, createSourceMutationBatch(reverse ? mutations.reverse() : mutations));
    expect(findSourceParentKey(applied.document, a.key)).toBeUndefined();
    expect(findSourceParentKey(applied.document, child.key)).toBe(b.key);
    expect(findSourceParentKey(applied.document, leaf.key)).toBe(child.key);
  });

  it('indexes a restricted projection without visiting all excluded sibling subtrees', () => {
    const original = parseSourceHtml(`<section id="wrapper">${Array.from({ length: 1000 }, (_, i) => `<p id="p-${i}">Text ${i}</p>`).join('')}</section>`);
    const wrapper = element(original, 'wrapper'), first = element(original, 'p-0');
    const firstText = text(original, 'Text 0'), lastText = text(original, 'Text 999');
    expect(findSourceParentKey(original, lastText.key)).toBe(element(original, 'p-999').key);
    const getNode = jest.spyOn(original.nodes, 'get');
    try {
      const projection = { ...original, nodes: createSourceNodeMapOverlay(original.nodes, new Map([
        [wrapper.key, { ...wrapper, childKeys: [first.key] }],
      ])) };
      expect(findSourceParentKey(projection, firstText.key)).toBe(first.key);
      expect(findSourceParentKey(projection, lastText.key)).toBeUndefined();
      expect(getNode.mock.calls.length).toBeLessThan(32);
      expect(findSourceParentKey(original, lastText.key)).toBe(element(original, 'p-999').key);
    } finally {
      getNode.mockRestore();
    }
  });

  it('isolates subtree roots and ignores changed parents outside the indexed view', () => {
    const original = parseSourceHtml('<section id="wrapper"><p id="child">Text</p></section>');
    const wrapper = element(original, 'wrapper'), child = element(original, 'child');
    const leaf = text(original, 'Text');
    const scoped = { ...original, rootKey: wrapper.key };
    expect(findSourceParentKey(original, wrapper.key)).toBe(original.rootKey);
    expect(findSourceParentKey(scoped, wrapper.key)).toBeUndefined();
    expect(findSourceParentKey(scoped, leaf.key)).toBe(child.key);
    const unwrapped = applySourceMutationBatch(original, createSourceMutationBatch([
      createUnwrapNodeMutation(original, wrapper.key),
    ]));
    expect(findSourceParentKey(unwrapped.document, child.key)).toBe(original.rootKey);
    expect(findSourceParentKey(unwrapped.document, wrapper.key)).toBeUndefined();
    expect(findSourceParentKey({ ...unwrapped.document, rootKey: wrapper.key }, child.key)).toBe(wrapper.key);
    expect(findSourceParentKey(scoped, child.key)).toBe(wrapper.key);
  });

  it('tracks inserted and deleted nodes through node-map compaction without trusting originalParentKey', () => {
    const original = parseSourceHtml('<p id="keep">Keep</p>');
    const root = original.nodes.get(original.rootKey), keep = element(original, 'keep');
    expect(findSourceParentKey(original, keep.key)).toBe(root.key);
    const replacements = new Map();
    const inserted = Array.from({ length: 1100 }, (_, i) => {
      const key = `new-${i}`;
      replacements.set(key, { key, kind: 'text', origin: 'inserted', value: 'New', originalValue: 'New', originalParentKey: 'wrong' });
      return key;
    });
    replacements.set(root.key, { ...root, childKeys: [...root.childKeys, ...inserted] });
    const changed = { ...original, nodes: createSourceNodeMapOverlay(original.nodes, replacements) };
    expect(findSourceParentKey(changed, inserted[1099])).toBe(root.key);
    const removed = applySourceMutationBatch(changed, createSourceMutationBatch([
      createReplaceChildrenMutation(changed, root.key, root.childKeys),
      createReplaceNodesMutation(changed, inserted.map(key => ({ key }))),
    ]));
    expect(findSourceParentKey(removed.document, inserted[1099])).toBeUndefined();
    expect(findSourceParentKey(changed, inserted[1099])).toBe(root.key);
    const restored = applySourceMutationBatch(removed.document, removed.inverse);
    expect(findSourceParentKey(restored.document, inserted[1099])).toBe(root.key);
  });

  it('invalidates cached mutable-builder views after each edit', () => {
    const original = parseSourceHtml('<p id="child">Text</p>');
    const root = original.nodes.get(original.rootKey), child = element(original, 'child');
    const leaf = text(original, 'Text');
    const builder = new SourceNodeMapOverlayBuilder(original.nodes);
    const staged = { ...original, nodes: builder };
    expect(findSourceParentKey(staged, leaf.key)).toBe(child.key);
    builder.set(root.key, { ...root, childKeys: [] });
    expect(findSourceParentKey(staged, leaf.key)).toBeUndefined();
    builder.set(root.key, root);
    expect(findSourceParentKey(staged, leaf.key)).toBe(child.key);
    expect(findSourceParentKey(original, leaf.key)).toBe(child.key);
  });

  it('keeps the actual compiler and PM history synchronized after split, undo and redo', () => {
    const projection = projectLunarHtml('<p id="line">Alpha Beta</p><p>Keep</p>');
    let state = EditorState.create({
      doc: projection.doc,
      plugins: [createLunarSourceMapPlugin({ document: projection.sourceDocument, sourceMap: projection.sourceMap }), history()],
    });
    const original = getLunarSourceState(state).document;
    const line = element(original, 'line');
    expect(findSourceParentKey(original, line.key)).toBe(original.rootKey);
    state = state.apply(compileLunarSourceTransaction(state, closeHistory(state.tr.split(7))));
    const assertParents = () => {
      const document = getLunarSourceState(state).document;
      const root = document.nodes.get(document.rootKey);
      root.childKeys.forEach(key => expect(findSourceParentKey(document, key)).toBe(root.key));
    };
    expect(state.doc.childCount).toBe(3);
    assertParents();
    expect(undo(state, transaction => { state = state.apply(compileLunarSourceTransaction(state, transaction)); })).toBe(true);
    expect(state.doc.childCount).toBe(2);
    assertParents();
    expect(redo(state, transaction => { state = state.apply(compileLunarSourceTransaction(state, transaction)); })).toBe(true);
    expect(state.doc.childCount).toBe(3);
    assertParents();
    expect(findSourceParentKey(original, line.key)).toBe(original.rootKey);
  });
});
