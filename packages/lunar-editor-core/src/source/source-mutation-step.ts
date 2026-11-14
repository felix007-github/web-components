import type { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { Step, StepResult, type Mappable } from 'prosemirror-transform';
import type { SourceMutationBatch } from './mutation';
import type { LunarSourceMap } from './source-map';

const sourceMutationStepJsonId = 'lunarSourceMutation';

export class SourceMutationStep extends Step {
  constructor(
    readonly forward: SourceMutationBatch,
    readonly inverse: SourceMutationBatch,
    readonly sourceMap: LunarSourceMap,
    readonly inverseSourceMap: LunarSourceMap,
  ) {
    super();
  }

  apply(doc: ProseMirrorNode) {
    return StepResult.ok(doc);
  }

  invert(_doc: ProseMirrorNode) {
    return new SourceMutationStep(
      this.inverse,
      this.forward,
      this.inverseSourceMap,
      this.sourceMap,
    );
  }

  map(_mapping: Mappable) {
    return this;
  }

  toJSON() {
    return {
      stepType: sourceMutationStepJsonId,
      forward: this.forward,
      inverse: this.inverse,
      sourceMap: this.sourceMap,
      inverseSourceMap: this.inverseSourceMap,
    };
  }

  static fromJSON(
    _schema: Schema,
    value: {
      forward: SourceMutationBatch;
      inverse: SourceMutationBatch;
      sourceMap?: LunarSourceMap;
      inverseSourceMap?: LunarSourceMap;
    },
  ) {
    if (!value.sourceMap || !value.inverseSourceMap) {
      throw new RangeError(
        'Serialized lunar source mutations must include forward and inverse SourceMaps.',
      );
    }
    return new SourceMutationStep(
      value.forward,
      value.inverse,
      value.sourceMap,
      value.inverseSourceMap,
    );
  }
}

Step.jsonID(sourceMutationStepJsonId, SourceMutationStep);

export function getSourceMutationSteps(steps: readonly Step[]) {
  return steps.filter(
    (step): step is SourceMutationStep => step instanceof SourceMutationStep,
  );
}
