# Lunar Editor React

通用 React 适配器及可复用编辑扩展，依赖 lunar-editor-core；不导入 App 或 Redline 规则。

采用 [MIT 许可](LICENSE)，随包资源的许可说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
npm 发布配置为公开访问，`prepublishOnly` 会自动执行构建。

## 通用入口

RichEditor 提供基础富文本挂载、生命周期、source/history 回调和类型化 ref。
CodeEditor 提供源码编辑适配。useController 等 hooks 可用于 App 自己的组合组件。

只使用一种编辑器时，可以从 `@mache-hangar/lunar-editor-react/rich-editor`
或 `@mache-hangar/lunar-editor-react/code-editor` 子入口导入。源码编辑器、
公式扩展和格式化器支持按需加载，普通富文本页面无需预先加载这些能力。

基础样式从 @mache-hangar/lunar-editor-react/styles.css 引入。
RichEditor 的 content 表示外部文档输入；普通父组件重渲染保留 view/history，
修改 content/source version 则重置输入。Schema 和 extensions 使用稳定引用。
ref 提供 getView/getHtml/getSourceState/undo/redo。

## 可选通用扩展

- @mache-hangar/lunar-editor-react/extensions/math：createMathExtension，公式节点、输入与 MathLive 视图。
- @mache-hangar/lunar-editor-react/extensions/table：createTableExtension，表格选区、结构命令、属性、滚动视图和列宽拖拽。
- 样式分别从 extensions/math.css 和 extensions/table.css 引入。

扩展实现遵守 core 的 EditorExtension 接口，普通 TS 引擎逻辑与 React 挂载分开。
基础入口不重导出公式扩展，因此普通 HTML 编辑不会自动加载 MathLive。
公式入口使用浏览器能力；SSR 应延迟到浏览器加载。

表格内部分隔线支持拖拽，相邻两列一增一减，保持表格总宽度。
支持 rowspan/colspan，默认最小列宽 48px（已有更窄的列保留原下限）。
拖动仅预览，松手后通过源码事务一次提交标准 colgroup/col 宽度，支持保存、撤销和重做。
Esc、指针取消或窗口失焦会取消当前拖动；只读模式不显示手柄。
手柄获得键盘焦点后，可用左右方向键以 10px 步长调整。

自定义扩展所需的 ProseMirror 类型、插件和命令统一从 @mache-hangar/lunar-editor-core/pm
导入，无需在使用方重复声明 prosemirror-* 依赖。此包构建会拒绝直接导入这些包。

扩展由 App 显式选择，例如创建稳定的数组：

```tsx
import { RichEditor } from '@mache-hangar/lunar-editor-react';
import { createMathExtension } from '@mache-hangar/lunar-editor-react/extensions/math';
import { createTableExtension } from '@mache-hangar/lunar-editor-react/extensions/table';
import '@mache-hangar/lunar-editor-react/styles.css';
import '@mache-hangar/lunar-editor-react/extensions/math.css';
import '@mache-hangar/lunar-editor-react/extensions/table.css';

// 在组件外创建，或在组件内用稳定的 memo 引用。
const extensions = [createMathExtension(), createTableExtension()];
<RichEditor content={html} extensions={extensions} />;
```

## App 业务

带修订/AI/PDF 联动的 HtmlEditor、LunarEditor、HtmlPreview 和菜单组合由使用方
项目维护，不包含在本仓库中。使用方可以实现自己的组合层。

## 验证

在本仓库根目录运行 pnpm build:lunar-editor-react 或 pnpm dev:lunar-editor-react。
测试命令为 pnpm --filter @mache-hangar/lunar-editor-react test，
覆盖 StrictMode/重渲染、文档切换、源码与历史、基础入口隔离、
表格拖拽预览、合并单元格、列属性、保存重载、取消和只读状态。

## 表格命令与状态

通用命令通过表格逻辑网格处理 rowspan/colspan，保留 caption、thead/tbody/tfoot、列组和已有属性。
createTableExtension({ onStateChange }) 回调提供 TableState；getTableState(view) 可主动读取。
工具栏可从可选的 table-ui 入口使用，也可自定义 UI 调用 runTableCommand(view, command)，返回是否实际应用。

- insert：rows、columns（1–50），可选 headerRow。
- row_before/row_after/delete_rows、column_before/column_after/delete_columns、delete_table。
- merge/split：矩形选区合并、按原跨度拆分；合并按阅读顺序保留所有内容。
- header_row/header_column、caption：切换选中行列的 th/scope 和可编辑标题。
- cell_style：textAlign、verticalAlign、backgroundColor（#RRGGBB 或 transparent）。
- table_style：align（left/center/right）、width（25%/50%/75%/100%）。
- clear_cells：清空选中格内容，保留表格结构。

跨单元格拖选（包含空单元格）或 Shift + 单击可建立矩形选区；单格内保留原生文字选择。
跨格拖选由表格接管鼠标，选区限制在当前表格，避免选中后续正文或滚动跳动。
格内拖选文字、双击单词与三击段落保留；Escape 收起为光标，多格选中时输入或 Delete 替换/清空内容。
Tab/Shift+Tab 在单元格间移动，末格 Tab 新增一行并移动到第一格。
结构编辑上限为 200 行、100 列（单格 rowspan/colspan 上限 100）。
不规则/超限表格保留原 HTML 并禁用网格结构命令；跨行组无法合并。
只读、源码不同步或无法编译源码事务时命令返回 false，避免只改视图未改源码。
每条修改命令独立支持撤销/重做，并保持表格外源码内容。

## 可选表格工具栏

`extensions/table-ui` 提供 `InsertTableButton`、`TableToolbar` 和 props 类型。
包含尺寸选择器、浮动工具栏、行列菜单、合并/拆分、属性面板、选区边框及键盘焦点交互。
UI 使用 Ant Design 5 和组件库的 WtIcon；仅使用该入口时需要安装可选 peer dependencies
`antd@^5.27.6`、`@mache-hangar/components@^0.1.4`。基础编辑器和 table 命令入口不加载这两个 UI 包。
引入 `extensions/table-ui.css`，配合 `extensions/table.css` 使用。

```tsx
import { useRef, useState } from 'react';
import { RichEditor } from '@mache-hangar/lunar-editor-react/rich-editor';
import { createTableExtension, EMPTY_TABLE_STATE, runTableCommand } from '@mache-hangar/lunar-editor-react/extensions/table';
import { InsertTableButton, TableToolbar } from '@mache-hangar/lunar-editor-react/extensions/table-ui';
import '@mache-hangar/lunar-editor-react/styles.css';
import '@mache-hangar/lunar-editor-react/extensions/table.css';
import '@mache-hangar/lunar-editor-react/extensions/table-ui.css';

function Editor({ html }: { html: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<import('@mache-hangar/lunar-editor-react/rich-editor').RichEditorApi>(null);
  const [state, setState] = useState(EMPTY_TABLE_STATE);
  const [extensions] = useState(() => [createTableExtension({ onStateChange: setState })]);
  const onCommand = (command: import('@mache-hangar/lunar-editor-react/extensions/table').TableCommand) => {
    runTableCommand(editorRef.current?.getView(), command);
  };
  return (
    <div ref={rootRef}>
      <InsertTableButton state={state} onCommand={onCommand} />
      <RichEditor ref={editorRef} content={html} extensions={extensions} />
      <TableToolbar rootRef={rootRef} state={state} onCommand={onCommand} />
    </div>
  );
}
```

`state` 来自表格扩展回调，`onCommand` 交由宿主执行并处理失败提示，`disabled` 用于只读或模式切换。
`rootRef` 指向编辑器根元素或包含编辑器及其工具栏的容器。组件自行定位表格、跟随滚动并清理监听器，
不依赖应用页面类名。浮层通过 portal 挂到编辑区域外，不会进入保存 HTML。
保存、AI、PDF 联动及业务通知仍由消费应用维护。
