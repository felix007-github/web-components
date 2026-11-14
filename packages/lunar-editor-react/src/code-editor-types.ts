import type { CodeEditorController } from '@mache-hangar/lunar-editor-core/controllers/code-editor-controller';
export type CodeEditorApi = Pick<
  CodeEditorController,
  | 'getValue'
  | 'setValue'
  | 'layout'
  | 'revealTarget'
  | 'getCurrentRevealTarget'
  | 'getUserSelectionVersion'
  | 'isChanged'
  | 'markClean'
  | 'resetHistory'
  | 'formatDocument'
  | 'diff'
  | 'whenReady'
>;
export type CodeEditorProps = Partial<
  Pick<
    CodeEditorController,
    'content' | 'readonly' | 'isShowDiff' | 'format' | 'language'
  >
> & { className?: string };
