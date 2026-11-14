// @ts-nocheck
import {
  applySourceMutationBatch,
  createRemoveNodeMutation,
  createReplaceChildrenMutation,
  createReplaceNodesMutation,
  createReplaceTextMutation,
  createSourceMutationBatch,
  createSourceNodeMapOverlay,
  createUnwrapNodeMutation,
  findSourceParentKey,
  parseSourceHtml,
  serializeSourceDocument,
  SourceMutationError,
  type SourceDocument,
  type SourceNode,
} from '../../source/index';

function findNode(
  document: SourceDocument,
  predicate: (node: SourceNode) => boolean,
) {
  const node = Array.from(document.nodes.values()).find(predicate);
  expect(node).toBeDefined();
  return node!;
}

function findElement(document: SourceDocument, id: string) {
  return findNode(document, (node) => (
    node.kind === 'element' &&
    node.attributes.some((attribute) => attribute.name === 'id' && attribute.value === id)
  ));
}

function findText(document: SourceDocument, value: string) {
  return findNode(document, (node) => node.kind === 'text' && node.value === value);
}

describe('source-aware HTML core', () => {
  it('preserves old node snapshots while compacting sparse updates', () => {
    const document = parseSourceHtml('<p>Text</p>');
    const text = findText(document, 'Text');
    let nodes = document.nodes;
    const expected = new Map(nodes);
    const previous = createSourceNodeMapOverlay(nodes, new Map([[text.key, { ...text, value: 'Before' }]]));
    nodes = previous;
    expected.set(text.key, { ...text, value: 'Before' });
    for (let index = 0; index < 1100; index++) {
      const key = `inserted-text-${index}`;
      const node = { ...text, key, value: String(index) };
      nodes = createSourceNodeMapOverlay(nodes, new Map([[key, node]]));
      expected.set(key, node);
    }
    nodes = createSourceNodeMapOverlay(nodes, new Map([[text.key, undefined]]));
    expected.delete(text.key);
    expect(nodes.size).toBe(expected.size);
    expect(new Map(nodes)).toEqual(expected);
    expected.forEach((value, key) => expect(nodes.get(key)).toEqual(value));
    expect(nodes.has(text.key)).toBe(false);
    expect(previous.get(text.key)?.value).toBe('Before');
    expect(previous.size).toBe(document.nodes.size);
    expect(document.nodes.get(text.key)?.value).toBe('Text');
  });

  it('ignores stale parent hints after a subtree is moved or detached', () => {
    const original = parseSourceHtml('<section id="first"><p id="child">Text</p></section><section id="second">Keep</section>');
    const first = findElement(original, 'first');
    const second = findElement(original, 'second');
    const child = findElement(original, 'child');
    const text = findText(original, 'Text');
    expect(findSourceParentKey(original, text.key)).toBe(child.key);
    const nodes = new Map(original.nodes);
    nodes.set(first.key, { ...first, childKeys: [] });
    nodes.set(second.key, { ...second, childKeys: [...second.childKeys, child.key] });
    const moved = { ...original, nodes };
    expect(findSourceParentKey(moved, child.key)).toBe(second.key);
    expect(findSourceParentKey(moved, text.key)).toBe(child.key);
    const detachedNodes = new Map(nodes);
    detachedNodes.set(second.key, second);
    const detached = { ...moved, nodes: detachedNodes };
    expect(findSourceParentKey(detached, child.key)).toBeUndefined();
    expect(findSourceParentKey(detached, text.key)).toBeUndefined();
    expect(findSourceParentKey(moved, child.key)).toBe(second.key);
  });

  it('round-trips untouched source including comments, unknown tags, entities, and formatting', () => {
    const html = [
      '<!-- page 11 -->',
      '<ol id="law-list" style="list-style-type: none">',
      "  <li data-pe='2'><law-citation data-ref='A&amp;B'>A&nbsp;<b>text</b></law-citation></li>",
      '</ol>',
    ].join('\r\n');

    const document = parseSourceHtml(html);

    expect(serializeSourceDocument(document)).toBe(html);
    expect(Array.from(document.nodes.values()).some((node) => (
      node.kind === 'element' && node.tagName === 'law-citation'
    ))).toBe(true);
  });

  it('round-trips a complete document with its original doctype', () => {
    const html = '<!doctype HTML>\n<html><head><title>Law</title></head><body><p>Text</p></body></html>';
    const document = parseSourceHtml(html, { mode: 'document' });

    expect(serializeSourceDocument(document)).toBe(html);
  });

  it('applies and reverses a text mutation without rewriting surrounding markup', () => {
    const html = "<p id='line' data-kind = \"law\">Alpha <b>Beta</b>.</p>";
    const original = parseSourceHtml(html);
    const text = findText(original, 'Beta');
    const batch = createSourceMutationBatch([
      createReplaceTextMutation(original, text.key, 0, 4, 'Gamma'),
    ], 'replace-beta');

    const applied = applySourceMutationBatch(original, batch);
    expect(serializeSourceDocument(applied.document)).toBe(
      "<p id='line' data-kind = \"law\">Alpha <b>Gamma</b>.</p>",
    );

    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(serializeSourceDocument(undone.document)).toBe(html);
  });

  it('canonicalizes a modified text node and restores its exact entity source on undo', () => {
    const html = '<p>A&nbsp;B &amp; C</p>';
    const original = parseSourceHtml(html);
    const text = findText(original, 'A\u00a0B & C');
    const index = text.value.indexOf('B');
    const applied = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceTextMutation(original, text.key, index, index + 1, 'Z'),
    ], 'replace-entity-neighbor'));

    expect(serializeSourceDocument(applied.document)).toBe('<p>A\u00a0Z &amp; C</p>');
    expect(serializeSourceDocument(
      applySourceMutationBatch(applied.document, applied.inverse).document,
    )).toBe(html);
  });

  it('canonicalizes a modified CRLF text node and restores the original newline on undo', () => {
    const html = '<p>A\r\nB</p>';
    const original = parseSourceHtml(html);
    const text = findText(original, 'A\nB');
    const applied = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceTextMutation(original, text.key, 2, 3, 'Z'),
    ], 'replace-after-crlf'));

    expect(serializeSourceDocument(applied.document)).toBe('<p>A\nZ</p>');
    expect(serializeSourceDocument(
      applySourceMutationBatch(applied.document, applied.inverse).document,
    )).toBe(html);
  });

  it('stores long text with constant-shape metadata instead of character pieces', () => {
    const value = 'word '.repeat(20_000);
    const document = parseSourceHtml(`<p>${value}</p>`);
    const text = findText(document, value);

    expect(text).toMatchObject({
      kind: 'text',
      value,
      originalValue: value,
    });
    expect(Object.hasOwn(text, 'pieces')).toBe(false);
    expect(Object.hasOwn(text, 'originalPieces')).toBe(false);
  });

  it('deletes one Chinese character with a direct string range and reverses it', () => {
    const html = '<p>法条修订</p>';
    const original = parseSourceHtml(html);
    const text = findText(original, '法条修订');
    const applied = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceTextMutation(original, text.key, 1, 2, ''),
    ], 'delete-chinese-character'));

    expect(serializeSourceDocument(applied.document)).toBe('<p>法修订</p>');
    expect(serializeSourceDocument(
      applySourceMutationBatch(applied.document, applied.inverse).document,
    )).toBe(html);
  });

  it('rejects a text mutation compiled against a stale source revision', () => {
    const original = parseSourceHtml('<p>Beta</p>');
    const text = findText(original, 'Beta');
    const staleMutation = createReplaceTextMutation(original, text.key, 0, 4, 'Gamma');
    const current = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceTextMutation(original, text.key, 0, 1, 'Z'),
    ], 'replace-first-letter')).document;

    expect(() => applySourceMutationBatch(current, createSourceMutationBatch([
      staleMutation,
    ], 'stale-replacement'))).toThrow(SourceMutationError);
  });

  it('unwraps a review element and restores its exact source on undo', () => {
    const html = "<p id='line'>Keep <add data-kind='review'><b>new</b></add> tail</p>";
    const original = parseSourceHtml(html);
    const add = findNode(original, (node) => node.kind === 'element' && node.tagName === 'add');
    const applied = applySourceMutationBatch(original, createSourceMutationBatch([
      createUnwrapNodeMutation(original, add.key),
    ], 'unwrap-add'));

    expect(serializeSourceDocument(applied.document)).toBe(
      "<p id='line'>Keep <b>new</b> tail</p>",
    );

    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(serializeSourceDocument(undone.document)).toBe(html);
  });

  it('removes a source node without requiring it in the serialized result', () => {
    const original = parseSourceHtml('<p id="a">One</p><p id="b">Two</p>');
    const second = findElement(original, 'b');
    const applied = applySourceMutationBatch(original, createSourceMutationBatch([
      createRemoveNodeMutation(original, second.key),
    ], 'remove-second'));

    expect(serializeSourceDocument(applied.document)).toBe('<p id="a">One</p>');
    expect(serializeSourceDocument(
      applySourceMutationBatch(applied.document, applied.inverse).document,
    )).toBe('<p id="a">One</p><p id="b">Two</p>');
  });

  it('merges children across paragraphs and reverses the structural batch', () => {
    const html = '<p id="a">One</p><p id="b">Two</p>';
    const original = parseSourceHtml(html);
    const first = findElement(original, 'a');
    const secondText = findText(original, 'Two');
    const root = original.nodes.get(original.rootKey)!;
    const batch = createSourceMutationBatch([
      createReplaceChildrenMutation(original, first.key, [
        ...first.childKeys,
        secondText.key,
      ]),
      createReplaceChildrenMutation(original, root.key, [first.key]),
    ], 'merge-paragraphs');

    const applied = applySourceMutationBatch(original, batch);
    expect(serializeSourceDocument(applied.document)).toBe('<p id="a">OneTwo</p>');

    const undone = applySourceMutationBatch(applied.document, applied.inverse);
    expect(serializeSourceDocument(undone.document)).toBe(html);
  });

  it('atomically inserts nodes and updates their parent with an exact inverse', () => {
    const html = '<p id="a">One</p>';
    const original = parseSourceHtml(html);
    const paragraph = findElement(original, 'a');
    const insertedText = {
      key: 'inserted:test:text',
      kind: 'text',
      origin: 'inserted',
      originalParentKey: paragraph.key,
      value: 'Two',
      originalValue: 'Two',
    };
    const batch = createSourceMutationBatch([
      createReplaceNodesMutation(original, [
        { key: insertedText.key, value: insertedText },
        {
          key: paragraph.key,
          value: {
            ...paragraph,
            childKeys: [...paragraph.childKeys, insertedText.key],
          },
        },
      ]),
    ], 'insert-node-set');

    const applied = applySourceMutationBatch(original, batch);
    expect(serializeSourceDocument(applied.document)).toBe('<p id="a">OneTwo</p>');
    expect(serializeSourceDocument(
      applySourceMutationBatch(applied.document, applied.inverse).document,
    )).toBe(html);
  });

  it('restores canonical inserted text before a structural inverse', () => {
    const original = parseSourceHtml('<p id="a">Keep</p>');
    const paragraph = findElement(original, 'a');
    const insertedText = {
      key: 'inserted:test:undo-text',
      kind: 'text',
      origin: 'inserted',
      originalParentKey: paragraph.key,
      value: 'Alpha ',
      originalValue: 'Alpha ',
    };
    const structural = applySourceMutationBatch(original, createSourceMutationBatch([
      createReplaceNodesMutation(original, [
        { key: insertedText.key, value: insertedText },
        {
          key: paragraph.key,
          value: {
            ...paragraph,
            childKeys: [insertedText.key],
          },
        },
      ]),
    ], 'structural-insert'));
    const deleted = applySourceMutationBatch(structural.document, createSourceMutationBatch([
      createReplaceTextMutation(structural.document, insertedText.key, 4, 5, ''),
    ], 'delete-inserted-letter'));
    const textUndone = applySourceMutationBatch(deleted.document, deleted.inverse);

    expect(textUndone.document.nodes.get(insertedText.key)).toEqual(insertedText);
    expect(serializeSourceDocument(
      applySourceMutationBatch(textUndone.document, structural.inverse).document,
    )).toBe('<p id="a">Keep</p>');
  });
});
