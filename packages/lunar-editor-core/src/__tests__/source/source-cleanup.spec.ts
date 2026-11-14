import {
  applySourceMutationBatch,
  applySourceMutationBatchWithCleanup,
  createRemoveNodeMutation,
  createReplaceChildrenMutation,
  createReplaceNodesMutation,
  createSourceMutationBatch,
  createUnwrapNodeMutation,
  findSourceParentKey,
  parseSourceHtml,
  serializeSourceDocument,
  type SourceDocument,
  type SourceElementNode,
  type SourceTextNode,
} from '../../source/index';

function element(document: SourceDocument, id: string) {
  return Array.from(document.nodes.values()).find(
    (node): node is SourceElementNode => node.kind === 'element' &&
      node.attributes.some((attribute) => attribute.name === 'id' && attribute.value === id),
  )!;
}

describe('committed source node cleanup', () => {
  it('removes a detached subtree and replays serialized forward/inverse batches exactly', () => {
    const html = "<p id='keep'>Keep&nbsp;Me</p><section id='drop'><!--old--><custom>Gone</custom></section>";
    const original = parseSourceHtml(html);
    const snapshot = new Map(original.nodes);
    const keep = element(original, 'keep');
    const drop = element(original, 'drop');
    const applied = applySourceMutationBatchWithCleanup(original, createSourceMutationBatch([
      createRemoveNodeMutation(original, drop.key),
    ]));

    expect(new Set(applied.document.nodes.keys())).toEqual(
      new Set([original.rootKey, keep.key, ...keep.childKeys]),
    );
    expect(serializeSourceDocument(applied.document)).toBe("<p id='keep'>Keep&nbsp;Me</p>");
    const replayed = applySourceMutationBatch(original, JSON.parse(JSON.stringify(applied.forward)));
    expect(new Map(replayed.document.nodes)).toEqual(new Map(applied.document.nodes));
    const undone = applySourceMutationBatch(applied.document, JSON.parse(JSON.stringify(applied.inverse)));
    expect(new Map(undone.document.nodes)).toEqual(snapshot);
    expect(serializeSourceDocument(undone.document)).toBe(html);
    const redone = applySourceMutationBatch(undone.document, undone.inverse);
    expect(new Map(redone.document.nodes)).toEqual(new Map(applied.document.nodes));
    expect(new Map(original.nodes)).toEqual(snapshot);
  });

  it('removes only an unwrapped shell and keeps its descendants with their new parent', () => {
    const html = "<p id='line'>A<add id='wrap'><b id='bold'>B&nbsp;C</b><!--keep--></add>Z</p>";
    const original = parseSourceHtml(html);
    const line = element(original, 'line');
    const wrap = element(original, 'wrap');
    const bold = element(original, 'bold');
    const applied = applySourceMutationBatchWithCleanup(original, createSourceMutationBatch([
      createUnwrapNodeMutation(original, wrap.key),
    ]));

    expect(applied.document.nodes.has(wrap.key)).toBe(false);
    expect(applied.document.nodes.size).toBe(original.nodes.size - 1);
    expect(applied.document.nodes.get(bold.key)).toBe(bold);
    expect(findSourceParentKey(applied.document, bold.key)).toBe(line.key);
    expect(serializeSourceDocument(applied.document)).toBe("<p id='line'>A<b id='bold'>B&nbsp;C</b><!--keep-->Z</p>");
    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(new Map(undone.document.nodes)).toEqual(new Map(original.nodes));
    expect(serializeSourceDocument(undone.document)).toBe(html);
  });

  it.each([false, true])('keeps moved descendants when their old parent is removed (reversed: %s)', (reverse) => {
    const original = parseSourceHtml('<section id="old"><b id="move">Text</b></section><p id="next">Keep</p>');
    const old = element(original, 'old');
    const moved = element(original, 'move');
    const next = element(original, 'next');
    const mutations = [
      createRemoveNodeMutation(original, old.key),
      createReplaceChildrenMutation(original, next.key, [...next.childKeys, moved.key]),
    ];
    const applied = applySourceMutationBatchWithCleanup(original, createSourceMutationBatch(
      reverse ? mutations.reverse() : mutations,
    ));

    expect(applied.document.nodes.has(old.key)).toBe(false);
    expect(applied.document.nodes.size).toBe(original.nodes.size - 1);
    expect(findSourceParentKey(applied.document, moved.key)).toBe(next.key);
    expect(applied.document.nodes.get(moved.childKeys[0])).toBe(original.nodes.get(moved.childKeys[0]));
    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(new Map(undone.document.nodes)).toEqual(new Map(original.nodes));
  });

  it('cleans replaced children and unattached imports together with an exact inverse', () => {
    const original = parseSourceHtml('<p id="line"><b id="old">Old</b></p>');
    const line = element(original, 'line');
    const replacement: SourceTextNode = {
      key: 'new-text', kind: 'text', origin: 'inserted', value: 'New', originalValue: 'New',
    };
    const discarded = { ...replacement, key: 'unused-import' };
    const applied = applySourceMutationBatchWithCleanup(original, createSourceMutationBatch([
      createReplaceNodesMutation(original, [
        { key: replacement.key, value: replacement },
        { key: discarded.key, value: discarded },
        { key: line.key, value: { ...line, childKeys: [replacement.key] } },
      ]),
    ]));

    expect(new Set(applied.document.nodes.keys())).toEqual(new Set([original.rootKey, line.key, replacement.key]));
    expect(serializeSourceDocument(applied.document)).toBe('<p id="line">New</p>');
    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(new Map(undone.document.nodes)).toEqual(new Map(original.nodes));
    const redone = applySourceMutationBatch(undone.document, undone.inverse);
    expect(new Map(redone.document.nodes)).toEqual(new Map(applied.document.nodes));
  });

  it('leaves a temporary detach intact when it is reattached before the batch commits', () => {
    const original = parseSourceHtml('<p id="line">Text</p>');
    const line = element(original, 'line');
    const remove = createRemoveNodeMutation(original, line.key);
    const staged = applySourceMutationBatch(original, createSourceMutationBatch([remove]));
    const applied = applySourceMutationBatchWithCleanup(original, createSourceMutationBatch([
      remove, ...staged.inverse.mutations,
    ]));
    expect(new Map(applied.document.nodes)).toEqual(new Map(original.nodes));
  });

  it('does not enumerate the node table or add a second walk of untouched subtrees', () => {
    const original = parseSourceHtml('<p id="drop">Delete</p>' +
      Array.from({ length: 1000 }, (_, index) => `<p id="p-${index}">Text ${index}</p>`).join(''));
    const drop = element(original, 'drop');
    const distant = element(original, 'p-999');
    const batch = createSourceMutationBatch([createRemoveNodeMutation(original, drop.key)]);
    const get = jest.spyOn(original.nodes, 'get');
    const iterator = jest.spyOn(original.nodes, Symbol.iterator);
    const entries = jest.spyOn(original.nodes, 'entries');
    const keys = jest.spyOn(original.nodes, 'keys');
    const values = jest.spyOn(original.nodes, 'values');
    const forEach = jest.spyOn(original.nodes, 'forEach');
    try {
      applySourceMutationBatch(original, batch);
      const baselineReads = get.mock.calls.filter(([key]) => key === distant.key).length;
      get.mockClear();
      const applied = applySourceMutationBatchWithCleanup(original, batch);
      expect(applied.document.nodes.has(drop.key)).toBe(false);
      expect(baselineReads).toBeGreaterThan(0);
      expect(get.mock.calls.filter(([key]) => key === distant.key)).toHaveLength(baselineReads);
      for (const enumerate of [iterator, entries, keys, values, forEach]) {
        expect(enumerate).not.toHaveBeenCalled();
      }
    } finally {
      jest.restoreAllMocks();
    }
  });
});
