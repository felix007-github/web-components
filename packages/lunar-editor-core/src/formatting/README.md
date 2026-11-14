# Lunar 行内格式化核心

该目录提供 AI 编辑和手动编辑共用的行内格式变换能力。它以 Lunar 的通用
`cnode_inline` 节点表达真实 HTML 标签，不使用 ProseMirror mark，也不直接操作 DOM。

公共入口为 `@mache-hangar/lunar-editor-core/formatting`，手动命令入口为
`@mache-hangar/lunar-editor-core/selection/selection-formatting`；ProseMirror 类型和插件从
`@mache-hangar/lunar-editor-core/pm` 导入。core 不依赖 App AI 协议，AI 侧调用位于 App 的
`src/editor/plugins/ai/proposal-compiler.ts`，页面按钮也由 App 装配。

## 支持标签

安全白名单为 `b`、`i`、`u`、`s`、`mark`、`code`、`sup`、`sub`。新 wrapper
不能携带属性；结果不能同时包含 `sup` 与 `sub`。

## 调用路径

- AI proposal 先完成协议和可信 source target 校验，再调用
  `applyLunarInlineFormattingEdit`。
- 页面顶部工具栏通过 `selection-formatting.ts` 解析当前 exact SourceMap ranges，
  再调用同一个变换器。
- 两条路径最终都必须由 SourceUnit/Structural compiler 生成 `SourceMutationStep`，
  确保 ProseMirror、SourceDocument 与 Undo/Redo 保持同步。

顶部工具栏当前展示 `b`、`i`、`u`、`s`、`sup`、`sub`。同段跨 inline 的
`multi_text` 选区会作为一个批次处理；跨段、代码块、非精确映射和无法安全拆分的
带属性 wrapper 会拒绝格式化。
