# wt-scrollbar



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute | Description | Type                             | Default    |
| -------------- | --------- | ----------- | -------------------------------- | ---------- |
| `always`       | `always`  | 是否总是显示滚动条   | `boolean`                        | `false`    |
| `size`         | `size`    | 尺寸大小        | `"large" \| "medium" \| "small"` | `'medium'` |
| `wrapperClass` | --        |             | `{ [key: string]: boolean; }`    | `{}`       |


## Events

| Event       | Description | Type                                                                            |
| ----------- | ----------- | ------------------------------------------------------------------------------- |
| `wt-scroll` | 滚动事件        | `CustomEvent<{ scrollTop: number; scrollLeft: number; originalEvent: Event; }>` |


## Methods

### `wtScrollTo(options: { left?: number; top?: number; }) => Promise<void>`

滚动到指定位置，参数为一个对象，可以同时设置 left 和 top。

#### Parameters

| Name      | Type                               | Description |
| --------- | ---------------------------------- | ----------- |
| `options` | `{ left?: number; top?: number; }` |             |

#### Returns

Type: `Promise<void>`



### `wtSetScrollLeft(left: number) => Promise<void>`

设置横向滚动条滚动到指定位置。

#### Parameters

| Name   | Type     | Description |
| ------ | -------- | ----------- |
| `left` | `number` |             |

#### Returns

Type: `Promise<void>`



### `wtSetScrollTop(top: number) => Promise<void>`

设置竖向滚动条滚动到指定位置。

#### Parameters

| Name  | Type     | Description |
| ----- | -------- | ----------- |
| `top` | `number` |             |

#### Returns

Type: `Promise<void>`



### `wtWrapRef() => Promise<HTMLDivElement | null>`

获取滚动元素的引用，可以通过该引用访问滚动元素的属性和方法。

#### Returns

Type: `Promise<HTMLDivElement>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
