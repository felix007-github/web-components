import type { Transaction } from 'prosemirror-state';

export type StructuralTransactionCompileFailure = {
  code:
    | 'structural-parent-not-found'
    | 'structural-projection-mismatch'
    | 'structural-range-not-found'
    | 'structural-source-import-failed';
  message: string;
};

export type StructuralTransactionCompileResult =
  | { kind: 'compiled'; transaction: Transaction; operationId: string }
  | ({ kind: 'unsupported'; transaction: Transaction } & StructuralTransactionCompileFailure);

export type StructuralTransactionCompileOptions = {
  canonicalizeSourceUnitKey?: string;
  operationId?: string;
};
