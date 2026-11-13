# @mache-hangar/components

基于 [Stencil](https://stenciljs.com/) 构建的 Web Components 组件库。同一套组件可以：

- 以标准 Custom Elements 用在任意框架或纯 HTML 页面中（`/loader` 按需加载）
- 通过 React 适配层使用（`@mache-hangar/components/react`）
- 通过 Vue 3 适配层使用（`@mache-hangar/components/vue`），支持 `v-model`
- 用 CSS 变量和 Shadow Parts 定制主题

## 安装

```bash
pnpm add @mache-hangar/components
# 或 npm i @mache-hangar/components
```

React / Vue 适配层是可选入口，只装你用到的那一个即可（React 18+、Vue 3.3+）。

## 使用

### 1. 原生页面 / 任意框架

```ts
import { defineCustomElements } from '@mache-hangar/components/loader';
import '@mache-hangar/components/dist/lpcp-components.css';

defineCustomElements(window);
```

```html
<wt-button type="primary" size="large">提交</wt-button>
<wt-tag type="success">已完成</wt-tag>
```

`defineCustomElements()` 会按需注册组件，首屏只加载实际渲染的组件代码。

### 2. React

```tsx
import { WtButton, WtInput, WtTag } from '@mache-hangar/components/react';
import '@mache-hangar/components/dist/lpcp-components.css';

export function Example() {
  return (
    <>
      <WtInput placeholder="请输入" onUpdateModelValue={(event) => console.log(event.detail)} />
      <WtButton onClickBtn={() => console.log('clicked')}>提交</WtButton>
      <WtTag type="success">已完成</WtTag>
    </>
  );
}
```

- 事件用 `on` + 驼峰事件名：`onClickBtn`、`onWtChange`、`onUpdateModelValue`、`onWtLayoutChange`
- `ref` 指向真实 DOM 元素，可直接调用组件方法，例如 `ref.current.getLayout()`
- `items`、`tree` 这类数组/对象属性直接以 prop 传入，不要写成 HTML 字符串

### 3. Vue 3

```vue
<script setup lang="ts">
import { WtInput, WtSwitch } from '@mache-hangar/components/vue';
import { ref } from 'vue';
import '@mache-hangar/components/dist/lpcp-components.css';

const keyword = ref('');
const enabled = ref(false);
</script>

<template>
  <WtInput v-model="keyword" placeholder="搜索" />
  <WtSwitch v-model="enabled" />
</template>
```

`v-model` 目前覆盖 `wt-input`、`wt-checkbox`、`wt-radio`、`wt-switch`、`wt-modal`；
其余组件用 `:prop` + `@事件名` 即可。

## 样式

组件自带样式（含 Shadow DOM 隔离），需要引入一次全局样式表来加载设计变量与基础样式：

```ts
import '@mache-hangar/components/dist/lpcp-components.css';
```

覆盖主题变量：

```css
:root {
  --wt-color-primary: #425ef2;
  --wt-radius-md: 8px;
}
```

需要深入定制组件内部结构时使用 Shadow Parts：

```css
wt-button::part(header) { margin-bottom: 12px; }
```

## 组件一览

| 组件 | 说明 |
| --- | --- |
| `wt-avatar` / `wt-avatar-group` | 头像、头像组 |
| `wt-badge` | 徽标 |
| `wt-button` | 按钮 |
| `wt-checkbox` / `wt-radio` / `wt-switch` | 表单控件（支持 v-model） |
| `wt-divider` | 分割线 |
| `wt-grid-layout` | 可拖动/缩放的卡片网格布局 |
| `wt-heat-bar` | 热力条 |
| `wt-icon` | 图标（内置图标集） |
| `wt-input` / `wt-search` | 输入框、搜索框 |
| `wt-link` | 链接 |
| `wt-loading` / `wt-logo` | 加载、Logo |
| `wt-modal` / `wt-notification` | 弹窗、通知（含 `WtNotificationService` 服务式调用） |
| `wt-progress` | 进度条（线形 / 环形） |
| `wt-scrollbar` | 自定义滚动容器 |
| `wt-tab-bar` / `wt-tag` / `wt-tooltip` | 标签栏、标签、气泡提示 |
| `wt-tree` | 树形控件 |

组件级文档在仓库 `docs/` 目录，交互示例见 `playground/react` 与 `playground/vue`。

## 浏览器与构建工具

- 需要浏览器支持 Custom Elements v1 与 Shadow DOM（Chrome / Edge / Firefox / Safari 现代版本）
- 使用 Vite / webpack / Rollup 等支持 ESM 的构建工具；CSS 与 `loader` 入口需要构建工具处理资源路径
- 组件库同时提供 ESM、CJS 与 Stencil collection 产物；Stencil 工程可直接消费 `collection`

## 常见问题

- **组件没有样式**：忘记引入 `@mache-hangar/components/dist/lpcp-components.css`
- **图标不显示**：`wt-icon` 需要传入图标名，图标集已随组件包打包；如需单独使用图标包见 `@mache-hangar/icons`
- **Vue 事件不触发**：自定义事件名是 kebab-case（如 `wt-change`），Vue 模板中用 `@wt-change` 而非 `@change`

## License

MIT
