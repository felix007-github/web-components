# wt-grid-layout

通用桌面卡片布局组件。正方形细网格、整卡拖动、右下角缩放、实时碰撞避让、松开后就近吸附均由组件管理。内容通过命名插槽传入，不依赖工时数据、图表库或 Agent 业务。

## 最小接入

先按组件库现有方式注册 loader（或使用 React/Vue 适配器），再传入 `items` 属性；数组属性不能写成 HTML JSON 字符串。

```html
<wt-grid-layout id="workspace" columns="48" editable>
  <div slot="overview">可以放指标、图表、业务节点或其他组件。</div>
  <div slot="activity">这里放另一个卡片的内容。</div>
</wt-grid-layout>
```

```js
await customElements.whenDefined('wt-grid-layout');
const grid = document.querySelector('#workspace');
grid.items = [
  { id: 'overview', title: '运行概览', x: 0, y: 0, w: 23, h: 9, minW: 12, minHeight: 120 },
  { id: 'activity', title: '最近活动', x: 24, y: 0, w: 23, h: 9, minW: 12, minHeight: 120 },
];
grid.addEventListener('wt-layout-change', event => {
  console.log('提交后的布局', event.detail);
});
// 对应外部“保存 / 取消 / 重置”按钮；保存只在显式调用时进行。
await grid.saveLayout();
await grid.restoreLayout();
await grid.resetLayout();
// resetLayout 不自动覆盖保存记录；需要时显式保存。
await grid.saveLayout();
```

上面的最小示例由应用接收布局，不自动写入浏览器存储。需要内置持久化时，设置 `storageKey`。如果程序创建元素并且需要自动加载 `storageKey` 对应的布局，应先设置 `items`、`columns`、`storageKey`，再插入页面。已经挂载的元素替换 `items` 会把该数组作为新的初始布局及取消基线；它不会再次读取存储。

## 卡片和坐标

- `id` 唯一，并与内容的 `slot` 名称相同；`title` 是默认标题。
- `x/y` 从 0 开始，`w/h` 以格子计数。格子边长为容器宽度除以 `columns`，行高自动跟随，默认 192 列。
- `minW` 为最小列数，`minHeight` 为最小像素高度。容器变窄时组件自动增加行数，避免裁掉必要内容。
- `gap` 是卡片间距，单位为格；`collisionTolerance` 是拖动时触发避让的实际重叠像素数，默认 8px。
- 拖动时不吸附，轻微擦边不重排；松开时宽高与位置按最近格线取整，半格取大值，最小尺寸仍会被限制。
- 网格只在当前组件正在拖动或缩放时显示。卡片标题、空白、图表等位置均可拖动；普通控件、滚动条及带 `data-no-drag` 的内容保留交互。
- 右上角手柄支持方向键移动，右下角手柄支持方向键缩放，Esc 取消本次拖动。普通卡片内容需移动至少 4px 才启动，避免误触。
- 多个区块使用多个组件实例，布局和键盘事件相互隔离；本组件不负责流程连线或 Agent 的执行顺序。

## 状态与保存

`getLayout()` 返回独立副本；拖动中返回拖动前已提交的布局。`setLayout(items)` 应用外部布局，不改变初始重置目标，也不自动保存。

`saveLayout()` 建立取消基线；设置 `storageKey` 时同时保存到 localStorage，否则仅返回布局，应用可以发送给后端。存储失败会使方法 Promise 拒绝，原有取消基线保持不变。`restoreLayout()` 恢复最近保存基线，`resetLayout()` 恢复初始 `items`。窗口尺寸变化只调整必要行数，不自动覆盖持久化记录。

`wt-layout-change` 仅在拖放提交、方向键调整、恢复或重置后发出，不逐像素发出。`wt-layout-interaction` 提供 `start/end/cancel`，用于禁用外部操作或显示提示；`wt-layout-save` 表示显式保存成功；初始化配置/缓存错误通过 `wt-layout-error` 报告。

## 插槽与样式

内容插槽为 `slot="卡片id"`；自定义标题可使用 `slot="header-卡片id"`。Shadow Parts 提供 `card/header/body/drag-handle/resize-handle`。组件内部布局与消费者样式隔离，内容仍由应用自身 CSS 设置。

```css
wt-grid-layout {
  --wt-grid-card-radius: 12px;
  --wt-grid-card-padding: 18px 22px;
  --wt-grid-card-background: #fff;
  --wt-grid-card-border: #e8ecf4;
  --wt-grid-card-color: #4d5a75;
  --wt-grid-line-color: #425ef218;
}
wt-grid-layout::part(header) { margin-bottom: 12px; }
```

业务数据、图表内容及应用自身的历史版本迁移由消费者管理，公共组件仅管理卡片布局与交互。

<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                               | Type               | Default     |
| -------------------- | --------------------- | ------------------------------------------------------------------------- | ------------------ | ----------- |
| `collisionTolerance` | `collision-tolerance` | Actual overlap in pixels required before live avoidance.                  | `number`           | `8`         |
| `columns`            | `columns`             |                                                                           | `number`           | `192`       |
| `editable`           | `editable`            |                                                                           | `boolean`          | `false`     |
| `gap`                | `gap`                 | Card spacing in grid cells.                                               | `number`           | `1`         |
| `items`              | --                    | Initial/externally controlled cards. Replace the array to apply new data. | `GridLayoutItem[]` | `[]`        |
| `storageKey`         | `storage-key`         | Optional persistence key. Storage is only written by saveLayout().        | `string`           | `undefined` |


## Events

| Event                   | Description | Type                                                                                            |
| ----------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `wt-layout-change`      |             | `CustomEvent<GridLayoutItem[]>`                                                                 |
| `wt-layout-error`       |             | `CustomEvent<{ message: string; }>`                                                             |
| `wt-layout-interaction` |             | `CustomEvent<{ id: string; action: "resize" \| "move"; phase: "start" \| "end" \| "cancel"; }>` |
| `wt-layout-save`        |             | `CustomEvent<GridLayoutItem[]>`                                                                 |


## Methods

### `getLayout() => Promise<GridLayoutItem[]>`

Current committed geometry; during a gesture returns its pre-drag snapshot.

#### Returns

Type: `Promise<GridLayoutItem[]>`



### `resetLayout() => Promise<void>`

Restore the initial items. Call saveLayout() to persist the reset.

#### Returns

Type: `Promise<void>`



### `restoreLayout() => Promise<void>`

Discard edits made since the last save or items replacement.

#### Returns

Type: `Promise<void>`



### `saveLayout() => Promise<GridLayoutItem[]>`

Save a baseline, optionally persist it using storageKey. Rejects storage failures.

#### Returns

Type: `Promise<GridLayoutItem[]>`



### `setLayout(items: GridLayoutItem[]) => Promise<void>`

Set geometry without replacing the original reset target.

#### Parameters

| Name    | Type               | Description |
| ------- | ------------------ | ----------- |
| `items` | `GridLayoutItem[]` |             |

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part              | Description |
| ----------------- | ----------- |
| `"body"`          |             |
| `"card"`          |             |
| `"drag-handle"`   |             |
| `"header"`        |             |
| `"resize-handle"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
