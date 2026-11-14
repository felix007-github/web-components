# wt-input

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute       | Description | Type                                      | Default          |
| -------------- | --------------- | ----------- | ----------------------------------------- | ---------------- |
| `class`        | `class`         |             | `string`                                  | `""`             |
| `defaultValue` | `default-value` |             | `string`                                  | `''`             |
| `disabled`     | `disabled`      |             | `boolean`                                 | `false`          |
| `error`        | `error`         |             | `boolean`                                 | `false`          |
| `modelValue`   | `model-value`   |             | `string`                                  | `undefined`      |
| `placeholder`  | `placeholder`   |             | `string`                                  | `'Please input'` |
| `size`         | `size`          |             | `"large" \| "medium" \| "min" \| "small"` | `'medium'`       |
| `type`         | `type`          |             | `"password" \| "text"`                    | `'text'`         |

## Events

| Event              | Description | Type                           |
| ------------------ | ----------- | ------------------------------ |
| `updateModelValue` |             | `CustomEvent<string>`          |
| `wt-focus`         |             | `CustomEvent<{ time: Date; }>` |
| `wt-input`         |             | `CustomEvent<string>`          |

## Slots

| Slot       | Description |
| ---------- | ----------- |
| `"after"`  |             |
| `"before"` |             |

---

_Built with [StencilJS](https://stenciljs.com/)_
