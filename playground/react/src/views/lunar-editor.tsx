import { lazy, Suspense, useRef, useState } from 'react';
import { RichEditor, type RichEditorApi, type RichEditorProps } from '@mache-hangar/lunar-editor-react/rich-editor';
import type { CodeEditorApi } from '@mache-hangar/lunar-editor-react/code-editor';
import { createTableExtension } from '@mache-hangar/lunar-editor-react/extensions/table';
import '@mache-hangar/lunar-editor-react/styles.css';
import '@mache-hangar/lunar-editor-react/extensions/table.css';
import './scss/lunar-editor.scss';

const CodeEditor = lazy(() => import('./lunar-editor-source'));
const tableExtensions = [createTableExtension()];
const initialHtml = `<h1>Lunar Editor 体验文档</h1>
<p>欢迎使用 Lunar Editor。点击这里开始编辑，选中文字后可以使用 <b>Ctrl / ⌘ + B</b> 加粗、<i>Ctrl / ⌘ + I</i> 斜体、<u>Ctrl / ⌘ + U</u> 下划线。</p>
<h2>试试这些功能</h2>
<ul>
  <li>编辑文字，在右侧查看实时 HTML 源码。</li>
  <li>修改右侧源码，点击“应用源码”更新文档。</li>
  <li>拖动下方表格的列分隔线，或点击“启用公式”体验公式编辑。</li>
</ul>
<h2>项目进度</h2>
<table style="width:100%;border-collapse:collapse">
  <colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
  <tbody>
    <tr><th>功能</th><th>状态</th><th>说明</th></tr>
    <tr><td>富文本编辑</td><td>可体验</td><td>文字与历史</td></tr>
    <tr><td>HTML 源码</td><td>可体验</td><td>源码编辑与应用</td></tr>
  </tbody>
</table>
<p>继续在这里写下你的想法。</p>`;
const mathExampleHtml = `<h2>公式示例</h2>
<p>勾股定理：<span data-type="math" data-display="inline" data-latex="a^2+b^2=c^2"></span>。</p>`;

export function LunarEditorDemo() {
  const richEditor = useRef<RichEditorApi>(null);
  const codeEditor = useRef<CodeEditorApi>(null);
  // 外部输入与实时导出分开，避免每次输入都重置富文本的选区和历史。
  const [documentInput, setDocumentInput] = useState({ html: initialHtml, generation: 0 });
  const [sourceHtml, setSourceHtml] = useState(initialHtml);
  const [readonly, setReadonly] = useState(false);
  const [extensions, setExtensions] = useState<NonNullable<RichEditorProps['extensions']>>(tableExtensions);
  const [mathEnabled, setMathEnabled] = useState(false);
  const [loadingMath, setLoadingMath] = useState(false);
  const [editingSource, setEditingSource] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [message, setMessage] = useState('已载入示例文档');
  const [error, setError] = useState('');

  function syncSource() {
    const editor = richEditor.current;
    if (!editor) return;
    try {
      setSourceHtml(editor.getHtml());
      setError('');
      setMessage('富文本修改已同步到源码');
    } catch {
      setError('当前修改无法同步到 HTML 源码，请撤销后重试。');
    }
  }

  function loadDocument(html: string, feedback: string) {
    setDocumentInput(previous => ({ html, generation: previous.generation + 1 }));
    setSourceHtml(html);
    setHistory({ canUndo: false, canRedo: false });
    setError('');
    setMessage(feedback);
  }

  async function applySource() {
    if (readonly || !codeEditor.current) return;
    try {
      const html = await codeEditor.current.getValue(false);
      loadDocument(html, '已应用源码，富文本历史已重置');
    } catch {
      setError('源码应用失败，请检查内容后重试。');
    }
  }

  async function enableMath() {
    if (readonly || mathEnabled || loadingMath) return;
    setLoadingMath(true);
    try {
      const { createMathExtension } = await import('./lunar-editor-math');
      const html = richEditor.current?.getHtml();
      if (html === undefined) return;
      setExtensions([...tableExtensions, createMathExtension()]);
      setMathEnabled(true);
      loadDocument(`${html}\n${mathExampleHtml}`, '已启用公式并保留当前文档，富文本历史已重置');
    } catch {
      setError('公式启用失败，请重试。');
    } finally {
      setLoadingMath(false);
    }
  }

  return (
    <article className="demo-card lunar-demo" aria-labelledby="lunar-demo-title">
      <header className="lunar-demo__header">
        <div>
          <span className="lunar-demo__eyebrow">EDITOR PLAYGROUND</span>
          <h1 id="lunar-demo-title">Lunar Editor</h1>
          <p>在富文本与 HTML 之间，体验同一份文档的编辑。</p>
        </div>
        <div className="lunar-demo__actions">
          <button type="button" disabled={readonly || mathEnabled || loadingMath} onClick={() => void enableMath()}>
            {loadingMath ? '正在启用…' : mathEnabled ? '公式已启用' : '启用公式'}
          </button>
          <label className="lunar-demo__readonly">
            <input type="checkbox" checked={readonly} disabled={loadingMath} onChange={event => setReadonly(event.target.checked)} />
            只读模式
          </label>
        </div>
      </header>

      <div className="lunar-demo__panels">
        <section className="lunar-demo__panel" aria-labelledby="lunar-rich-title">
          <div className="lunar-demo__panel-header">
            <h2 id="lunar-rich-title">富文本</h2>
            <div className="lunar-demo__actions">
              <button type="button" disabled={readonly || !history.canUndo} onClick={() => richEditor.current?.undo()}>
                撤销
              </button>
              <button type="button" disabled={readonly || !history.canRedo} onClick={() => richEditor.current?.redo()}>
                重做
              </button>
              <button type="button" disabled={readonly} onClick={() => loadDocument(initialHtml + (mathEnabled ? `\n${mathExampleHtml}` : ''), '已重置为示例文档')}>
                重置示例
              </button>
            </div>
          </div>
          <div className="lunar-demo__rich">
            <RichEditor
              ref={richEditor}
              content={documentInput.html}
              sourceGeneration={documentInput.generation}
              extensions={extensions}
              readonly={readonly}
              onDocChanged={syncSource}
              onHistoryStateChange={setHistory}
            />
          </div>
          <p className="lunar-demo__hint">支持 Ctrl / ⌘ + B、I、U，以及 Ctrl / ⌘ + Z 撤销。</p>
        </section>

        <section className="lunar-demo__panel" aria-labelledby="lunar-source-title">
          <div className="lunar-demo__panel-header">
            <h2 id="lunar-source-title">HTML 源码</h2>
            <button type="button" className="lunar-demo__primary" disabled={readonly} onClick={() => (editingSource ? void applySource() : setEditingSource(true))}>
              {editingSource ? '应用源码' : '编辑源码'}
            </button>
          </div>
          <div className="lunar-demo__source">
            {editingSource ? (
              <Suspense
                fallback={
                  <p className="lunar-demo__hint" role="status">
                    正在打开源码编辑器…
                  </p>
                }
              >
                <CodeEditor key={documentInput.generation} ref={codeEditor} content={sourceHtml} readonly={readonly} language="html" />
              </Suspense>
            ) : (
              <pre className="lunar-demo__source-preview" tabIndex={0} aria-label="HTML 源码预览">
                {sourceHtml}
              </pre>
            )}
          </div>
          <p className="lunar-demo__hint">{editingSource ? '源码修改需点击“应用源码”，这会重置富文本历史。' : '富文本修改实时同步到这里；点击“编辑源码”可以修改 HTML。'}</p>
        </section>
      </div>

      <footer className="lunar-demo__footer">
        <span role="status">{message}</span>
        <span>
          {readonly ? '只读' : '可编辑'} · 表格{mathEnabled ? ' · 公式' : ''}
        </span>
      </footer>
      {error && (
        <p className="lunar-demo__error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
