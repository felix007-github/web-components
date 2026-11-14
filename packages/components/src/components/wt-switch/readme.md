# wt-switch

<!-- Auto Generated Below -->

## Properties

| Property     | Attribute     | Description                                 | Type                             | Default     |
| ------------ | ------------- | ------------------------------------------- | -------------------------------- | ----------- |
| `disabled`   | `disabled`    | 是否禁用                                    | `boolean`                        | `false`     |
| `modelValue` | `model-value` | Vue v-model 绑定值 / React controlled value | `boolean`                        | `undefined` |
| `size`       | `size`        | 开关尺寸                                    | `"large" \| "medium" \| "small"` | `'medium'`  |

## Events

| Event              | Description             | Type                   |
| ------------------ | ----------------------- | ---------------------- |
| `updateModelValue` | 跨框架 v-model 更新事件 | `CustomEvent<boolean>` |
| `wt-change`        | 值变更事件              | `CustomEvent<boolean>` |

---

_Built with [StencilJS](https://stenciljs.com/)_
