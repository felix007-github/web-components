# Lunar Editor React

通用 React 适配器及可复用编辑扩展，依赖 lunar-editor-core；不导入 App 或 Redline 规则。

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
- @mache-hangar/lunar-editor-react/extensions/table：createTableExtension，表格滚动视图和列宽拖拽。
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
<RichEditor content={html} extensions={extensions} />
```

## App 业务

带修订/AI/PDF 联动的 HtmlEditor、LunarEditor、HtmlPreview 和菜单组合由使用方
项目维护，不包含在本仓库中。使用方可以实现自己的组合层。

## 验证

在本仓库根目录运行 pnpm build:lunar-editor-react 或 pnpm dev:lunar-editor-react。
测试命令为 pnpm --filter @mache-hangar/lunar-editor-react test，
覆盖 StrictMode/重渲染、文档切换、源码与历史、基础入口隔离、
表格拖拽预览、合并单元格、列属性、保存重载、取消和只读状态。
