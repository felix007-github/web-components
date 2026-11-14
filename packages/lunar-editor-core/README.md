# Lunar Editor Core

基础 HTML 编辑内核，负责 SourceDocument、SourceMap、通用投影、事务编译、
版本校验和 Undo/Redo。运行、构建和测试均不依赖 React、Stencil 或 App。

## 边界

- src/source：无损源码、mutation、父索引、增量映射、局部及结构编译。
- src/schema：基础 HTML Schema、DOM 投影、序列化和未知 HTML fallback。
- src/extensions：扩展契约、依赖检查、按 Schema 隔离的扩展配置。
- src/lunar-editor.ts、history.ts：基础 PM 引擎、命令和历史。
- src/code、controllers：源码编辑引擎、通用生命周期与事件。
- src/utils：完整文档 session、版本与源码检查点；输入和投影策略由调用方注入。

公式与表格视图等通用扩展位于 [lunar-editor-react](../lunar-editor-react/README.md)。
Redline 修订、引文、PDF 页码、AI 协议和摘要模板由使用方业务层维护，
不包含在本仓库中。core 不导出这些业务类型。

## ProseMirror 依赖入口

ProseMirror 的依赖和版本由 core 统一管理。App、React 适配层及扩展无需额外
安装或声明 prosemirror-*；需要引擎 API 时，统一从独立子入口导入：

```ts
import { Plugin, TextSelection, type EditorView } from '@mache-hangar/lunar-editor-core/pm';
```

该入口直接重导出 model、state、view、transform、history、commands、keymap
的公开 API，与 core 内部使用同一套依赖，保持 Schema、Selection、Step 等对象身份一致。
它仍是 ProseMirror API，编写此类插件需要了解引擎契约；普通 React 使用方只需组件 API。
ProseMirror 不从 core 根入口重导出，便于将引擎扩展 API 与基础编辑接口分开使用。

## 扩展合同

EditorExtension 提供命名、依赖声明、NodeSpecs、插件工厂、NodeViews、
事务处理以及投影/导出策略。App 显式组合；默认 core 不安装产品插件。
配置绑定 Schema 实例，无进程级业务注册表；插件工厂为每个视图创建独立 PM 插件。

Schema、扩展配置应在一个编辑会话中保持稳定。当前 React 适配器在切换
Schema/扩展集合时重建视图，不提供带历史迁移的运行时插件卸载。

扩展必须保留 sourceKey/htmlAttrs，并通过内核 mutation 机制修改源码。
声明已编译的事务必须包含当前文档的 SourceMutationStep；内核继续负责版本、
同步状态及历史校验。serializeDom 的 previousHtml 接收前一阶段的序列化结果，
不得通过重新解析无上下文的 HTML 片段串联处理（表格行/单元格尤其需要保留上下文）。

未知 HTML 按通用 fallback/source-only 规则保留，core 不推断修订或引文含义。
无法安全同步的编辑会阻止导出。框架无关仍包含 DOM/PM/CM 的浏览器模块；
纯数据入口可单独使用，浏览器编辑器需在挂载后创建、卸载时销毁。

Rich 历史使用 ProseMirror `history()` 的默认配置（`depth=100`、
`newGroupDelay=500ms`），由库负责事件分组和旧事件淘汰。自定义 SourceMutationStep
跟随同一历史生命周期；真实大文档、长会话及大操作下的自定义载荷内存占用尚待测量，
属于性能验证项，不代表缺少历史管理能力。

## SourceNode 清理

SourceUnit、结构编辑和 App Review 在准备提交时使用
`applySourceMutationBatchWithCleanup(document, batch)`。它跟踪本次移除的子树及
替换节点，复用已有树校验得到的可达关系，仅清理这批候选中已不属于当前树的节点。
同批次移动、unwrap 后仍在使用的后代会保留；不会额外枚举整张节点表或重遍未修改子树。

返回值包含 `document`、`forward`、`inverse`，调用方必须将返回的正反批次存入
SourceMutationStep。清理以显式 `replace-nodes` 删除加入 forward；inverse 先恢复
节点，再恢复父子关系，因此普通重放、Undo/Redo 和 JSON 序列化重放均可恢复节点表。

低层 `applySourceMutationBatch()` 保留临时拆离和批次重放能力，不隐式清理；
投影视图也不触发清理。该机制处理本次编辑产生的不可达节点，不全局扫描旧快照中的
历史残留。原始 source buffer、历史记录及 overlay 基础快照仍有各自生命周期；
当前节点表不再累积这些新残留，不等于浏览器会立即释放全部相关内存。

## 结构编译模块

`src/source/structural-compiler.ts` 保留 `compileSourceStructuralTransaction()` 入口及
原有类型导出，负责串联阶段、构建 mutation、更新 SourceMap、追加最终 Step。
SourceUnit、格式化和 App AI 调用方继续使用此入口。阶段实现位于 `src/source/structural/`：

| 模块 | 职责 |
|---|---|
| [range.ts](src/source/structural/range.ts) | 受影响 block、稳定父级、旧/新范围及直接 children 规划 |
| [identity.ts](src/source/structural/identity.ts) | 受影响范围内的 sourceKey 保留、分配与去重 |
| [import.ts](src/source/structural/import.ts) | 局部 PM 序列化、SourceNode 导入及未修改邻居复用 |
| [projection.ts](src/source/structural/projection.ts) | 局部投影验证、必要的父级范围回退及协调 |
| [selection.ts](src/source/structural/selection.ts) | text/node selection 意图捕获与恢复 |
| [types.ts](src/source/structural/types.ts) | 编译结果、诊断和选项的类型定义，由原入口继续重导出 |

阶段模块不反向依赖编排入口。源码导入不修改输入 SourceDocument；投影协调先在临时
Transform 上验证，成功后由入口追加到原 transaction，保持失败不提交部分源码修改。
这次拆分改进维护边界，未改变编译规则、局部投影范围、Schema 传递或历史事件归属。

## 开发与验证

在本仓库根目录运行：

- pnpm --filter @mache-hangar/lunar-editor-core build
- pnpm --filter @mache-hangar/lunar-editor-core typecheck
- pnpm --filter @mache-hangar/lunar-editor-core test
- pnpm dev:lunar-editor-core

构建输出 ESM/CJS 和声明，并阻止反向导入 App/UI。
核心测试使用 Jest + jsdom；业务集成回归由使用方项目维护。

[历史 RFC](docs/source-aware-mutation-engine-rfc.md)、
[历史任务进度](docs/source-aware-mutation-progress.md)。
