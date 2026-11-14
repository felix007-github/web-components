import type { EditorExtension } from '@mache-hangar/lunar-editor-core/extensions';
import { mathNodes } from './nodes';
import { MathNodeView } from './math-node-view';
import { createMathInputPlugin } from './math-input';
export * from './math-input';
export function createMathExtension(): EditorExtension {
  return {
    name: 'math',
    nodes: {
      math_block: { ...mathNodes.math_block, sourceUnit: true },
      math_inline: { ...mathNodes.math_inline, sourceUnit: true },
    },
    plugins: () => [createMathInputPlugin()],
    nodeViews: {
      math_block: (node, view, getPos) => new MathNodeView(node, view, getPos),
      math_inline: (node, view, getPos) => new MathNodeView(node, view, getPos),
    },
  };
}
