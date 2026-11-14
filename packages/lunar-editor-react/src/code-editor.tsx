import { CodeEditorController } from '@mache-hangar/lunar-editor-core/controllers/code-editor-controller';
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { useController, useControllerProps } from './controller-hooks';
import type { CodeEditorApi, CodeEditorProps } from './code-editor-types';
export type { CodeEditorApi, CodeEditorProps } from './code-editor-types';

export const CodeEditor = forwardRef<CodeEditorApi, CodeEditorProps>(
  function CodeEditor(props, ref) {
    const {
      content = '',
      readonly = false,
      isShowDiff = false,
      format = false,
      language = 'html',
      className = '',
    } = props;
    const controller = useController(() =>
      Object.assign(new CodeEditorController(), {
        content,
        readonly,
        isShowDiff,
        format,
        language,
      })
    );
    const host = useRef<HTMLDivElement>(null);
    const editor = useRef<HTMLDivElement>(null);
    const diff = useRef<HTMLDivElement>(null);
    useControllerProps(controller, {
      content,
      readonly,
      isShowDiff,
      format,
      language,
    });
    useLayoutEffect(() => {
      controller.hostEl = host.current!;
      controller.editorContainerEl = editor.current!;
      controller.diffContainerEl = diff.current!;
      void controller.connect();
      return () => controller.dispose();
    }, [controller]);
    useImperativeHandle(ref, () => controller, [controller]);
    return (
      <div ref={host} className={`code-editor-host ${className}`}>
        <div className="code-editor">
          <div
            ref={editor}
            className={`editor-container ${isShowDiff ? 'dialog-ani-lr' : ''}`}
          />
          <div
            ref={diff}
            className={`diff-container ${isShowDiff ? 'dialog-ani-rl' : ''}`}
          />
        </div>
      </div>
    );
  }
);
