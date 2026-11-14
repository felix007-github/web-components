import { getEditorSchemaConfiguration } from '../extensions';
import type { EditorState, Transaction } from 'prosemirror-state';
import {
  getLunarSourceState,
  setLunarSourceCompileFailure,
} from './source-map-plugin';
import { getSourceMutationSteps } from './source-mutation-step';
import { compileSourceRangeFallback } from './source-range-fallback';
import { compileSourceStructuralTransaction } from './structural-compiler';
import { compileSourceUnitTransaction } from './source-unit-compiler';

export function compileLunarSourceTransaction(
  state: EditorState,
  transaction: Transaction
) {
  const sourceState = getLunarSourceState(state);
  if (
    !sourceState ||
    !transaction.docChanged ||
    getSourceMutationSteps(transaction.steps).length
  ) {
    return transaction;
  }
  if (sourceState.status !== 'synchronized') {
    return setLunarSourceCompileFailure(transaction, {
      code: 'source-state-not-synchronized',
      message: `Source transaction compilation is disabled while state is ${sourceState.status}.`,
    });
  }

  const extension = getEditorSchemaConfiguration(
    state.schema
  ).compileTransaction?.(state, transaction, sourceState);
  if (extension?.kind === 'compiled') {
    if (
      !extension.transaction.before.eq(state.doc) ||
      !getSourceMutationSteps(extension.transaction.steps).length
    ) {
      return setLunarSourceCompileFailure(transaction, {
        code: 'extension-source-mutation-missing',
        message:
          'A compiled extension edit must contain a source mutation for the current document.',
      });
    }
    return extension.transaction;
  }
  if (!extension) {
    const sourceUnitResult = compileSourceUnitTransaction(
      transaction,
      sourceState.document,
      sourceState.sourceMap
    );
    if (sourceUnitResult.kind === 'compiled') {
      return sourceUnitResult.transaction;
    }
    const rangeResult = compileSourceRangeFallback(
      transaction,
      sourceState.document,
      sourceState.sourceMap
    );
    if (rangeResult.kind !== 'unsupported') {
      return rangeResult.transaction;
    }
  }

  const structuralResult = compileSourceStructuralTransaction(
    transaction,
    sourceState.document,
    sourceState.sourceMap,
    { operationId: extension?.operationId }
  );
  return structuralResult.kind === 'unsupported'
    ? setLunarSourceCompileFailure(structuralResult.transaction, {
        code: extension?.diagnostic?.code ?? structuralResult.code,
        message: extension?.diagnostic?.message ?? structuralResult.message,
      })
    : structuralResult.transaction;
}
