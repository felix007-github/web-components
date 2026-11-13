# wt-tooltip



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                       | Type                                     | Default   |
| ------------ | ------------- | --------------------------------- | ---------------------------------------- | --------- |
| `autoAdjust` | `auto-adjust` | 是否在空间不足时自动调整位置                    | `boolean`                                | `true`    |
| `content`    | `content`     | Tooltip 内容（也可通过 content slot 自定义） | `string`                                 | `""`      |
| `disabled`   | `disabled`    | 是否禁用                              | `boolean`                                | `false`   |
| `hideAfter`  | `hide-after`  | 隐藏延迟（ms）                          | `number`                                 | `100`     |
| `maxWidth`   | `max-width`   | 弹层最大宽度                            | `string`                                 | `"240px"` |
| `open`       | `open`        | 受控显示状态                            | `boolean`                                | `false`   |
| `placement`  | `placement`   | 显示位置                              | `"bottom" \| "left" \| "right" \| "top"` | `"top"`   |
| `showAfter`  | `show-after`  | 显示延迟（ms）                          | `number`                                 | `120`     |
| `showArrow`  | `show-arrow`  | 是否显示箭头                            | `boolean`                                | `true`    |
| `trigger`    | `trigger`     | 触发方式：hover \| click \| manual     | `"click" \| "hover" \| "manual"`         | `"hover"` |


## Events

| Event              | Description | Type                   |
| ------------------ | ----------- | ---------------------- |
| `updateModelValue` |             | `CustomEvent<boolean>` |
| `wt-open-change`   |             | `CustomEvent<boolean>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
