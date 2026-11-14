# 基础 HTML Schema 与投影

本目录只负责 SourceDocument 与 ProseMirror 文档的结构适配。SourceDocument 保留
HTML 源码；PM Doc 提供交互视图。最终 HTML 不能直接由整个 PM DOM 覆盖生成。

## 文件职责

| 文件 | 职责 |
|---|---|
| `index.ts` | Schema、投影、序列化的公共导出 |
| `node-specs.ts` | 基础 NodeSpecs、`createEditorSchema()` 和基础默认 `lunarSchema` |
| `html-content-model.ts` | 通用 block/inline/void/raw 分类与 fallback |
| `constants.ts`、`dom-attributes.ts` | 内部属性、SourceUnit 标签与 HTML attrs 转换 |
| `generated-container.ts` | 为直接 inline 内容补内部 paragraph，序列化时展开 |
| `source-whitespace.ts` | 保留可映射的有效源码空白 |
| `projection.ts` | Source → 临时 DOM → 当前 Schema 的 PM Doc + SourceMap |
| `serialization.ts` | 局部 PM fragment → HTML，按当前 Schema 执行清理策略 |

表格 NodeSpec 是通用 HTML 结构，仍在 core；滚动 NodeView 位于
[共享 table 扩展](../../../lunar-editor-react/src/extensions/table/)。
公式 NodeSpecs/MathLive 位于[共享 math 扩展](../../../lunar-editor-react/src/extensions/math/)。
Review 和 page marker 的 NodeSpecs、清理与编译位于
[App 产品装配](../../../../app/src/editor/README.md)。core 默认不注册这些能力。

## Schema 组合与隔离

```ts
import { createEditorSchema } from '@mache-hangar/lunar-editor-core/schema';
import type { EditorExtension } from '@mache-hangar/lunar-editor-core/extensions';
import { Plugin, type NodeSpec } from '@mache-hangar/lunar-editor-core/pm';
```

`createEditorSchema(configuration, extensions)` 组合基础规则、扩展及调用方配置。
扩展名称、依赖顺序和扩展之间重复的节点名在创建前校验；配置通过 WeakMap 绑定
到 Schema 实例，不使用进程级产品注册表。NodeSpec 的 `sourceUnit` 与
`sourceUnitBoundary` 元数据声明局部编辑能力和边界。

App 的 `redlineSchema` 由产品工厂显式组合，在业务 facade 中兼容导出为
`lunarSchema`；它与本包的基础默认 Schema 职责不同。会话中 Schema/扩展应保持稳定，
重置、局部投影、异常恢复和序列化都必须传递当前 Schema。

## 数据流与扩展策略

```text
HTML → parseSourceHtml → SourceDocument
  → createSourceDomProjection（identity + textBindings）
  → 通用 artifact 清理 → Schema.prepareDom
  → containerPolicy 包装直接 inline 内容 → 有效空白保留
  → DOMParser.fromSchema(schema) → PM Doc + SourceMap
```

序列化先输出 PM fragment、执行扩展 `serializeDom`，再展开 generated paragraph。
多个 serializer 依次传递 `previousHtml` 字符串，不重新解析无上下文的 HTML 片段，
以免浏览器吞掉独立的 `tr/td`。最终 Source 导出另受 `omitSourceElement` 策略控制。

## 约束

- 外部统一从 `@mache-hangar/lunar-editor-core/schema` 导入，ProseMirror API 从 `/pm` 导入。
- `sourceKey` 从 DOM projection 的 identity 接口读取，不能消费普通用户属性冒充身份。
- `data-lunar-generated-container-paragraph` 只用于投影，不能写入最终 HTML。
- 未知 HTML 使用通用 fallback/source-only 保留；不能据此自动获得业务编辑能力。
- `node-specs.ts` 定义结构，mutation/compiler 定义修改；无法证明同步的编辑阻止导出。

完整示例见[数据流](../../../../LUNAR_EDITOR_DATA_FLOW.md)。
