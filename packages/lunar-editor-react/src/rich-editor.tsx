import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  createLunarEditor,
  setLunarEditorHtml,
  getLunarEditorSourceHtml,
  getLunarEditorSourceSnapshot,
  type CreateLunarEditorOptions,
} from '@mache-hangar/lunar-editor-core/lunar-editor';
import { runLunarHistoryCommand } from '@mache-hangar/lunar-editor-core/history';
type EditorView = ReturnType<typeof createLunarEditor>;

export type RichEditorProps = Omit<
  CreateLunarEditorOptions,
  'html' | 'editable' | 'editorClass' | 'onDocChanged'
> & {
  content: string;
  readonly?: boolean;
  className?: string;
  editorClass?: string;
  onDocChanged?: () => void;
};
export type RichEditorApi = {
  getView: () => EditorView | undefined;
  getHtml: () => string;
  getSourceState: () => ReturnType<typeof getLunarEditorSourceSnapshot>;
  undo: () => boolean;
  redo: () => boolean;
};

/** Generic React adapter. Product plugins are supplied by the caller. */
export const RichEditor = forwardRef<RichEditorApi, RichEditorProps>(
  function RichEditor(props, ref) {
    const mount = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | undefined>(undefined);
    const latest = useRef(props);
    const applied = useRef({
      content: props.content,
      generation: props.sourceGeneration,
      revision: props.sourceRevision,
    });
    useLayoutEffect(() => {
      latest.current = props;
    });
    useLayoutEffect(() => {
      const current = latest.current;
      const engine = createLunarEditor(mount.current!, {
        ...current,
        html: current.content,
        editable: () => !latest.current.readonly,
        editorClass: () =>
          latest.current.editorClass ?? 'rich-editor__document',
        onDocChanged: () => latest.current.onDocChanged?.(),
        onHistoryStateChange: (detail) =>
          latest.current.onHistoryStateChange?.(detail),
        onSelectionFormattingChange: (detail) =>
          latest.current.onSelectionFormattingChange?.(detail),
        onSourceStateChange: (detail) =>
          latest.current.onSourceStateChange?.(detail),
        onTransaction: (before, next, transaction) =>
          latest.current.onTransaction?.(before, next, transaction),
      });
      view.current = engine;
      applied.current = {
        content: current.content,
        generation: current.sourceGeneration,
        revision: current.sourceRevision,
      };
      return () => {
        engine.destroy();
        view.current = undefined;
      };
    }, [props.schema, props.extensions]);
    useLayoutEffect(() => {
      if (!view.current) return;
      const previous = applied.current;
      if (
        previous.content !== props.content ||
        previous.generation !== props.sourceGeneration ||
        previous.revision !== props.sourceRevision
      ) {
        setLunarEditorHtml(
          view.current,
          props.content,
          props.sourceRevision,
          props.sourceGeneration
        );
        applied.current = {
          content: props.content,
          generation: props.sourceGeneration,
          revision: props.sourceRevision,
        };
      }
      view.current.setProps({ editable: () => !latest.current.readonly });
    }, [
      props.content,
      props.sourceGeneration,
      props.sourceRevision,
      props.readonly,
    ]);
    useImperativeHandle(
      ref,
      () => ({
        getView: () => view.current,
        getHtml: () => getLunarEditorSourceHtml(view.current),
        getSourceState: () => getLunarEditorSourceSnapshot(view.current),
        undo: () =>
          view.current ? runLunarHistoryCommand(view.current, 'undo') : false,
        redo: () =>
          view.current ? runLunarHistoryCommand(view.current, 'redo') : false,
      }),
      []
    );
    return (
      <div className={`rich-editor-host ${props.className ?? ''}`}>
        <div className="rich-editor__mount" ref={mount} />
      </div>
    );
  }
);
