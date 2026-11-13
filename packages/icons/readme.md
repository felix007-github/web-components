# Web Component 图标库

为 [@mache-hangar/components] Web Component 组件库封装的图标库


## 注册使用

1、批量一次性引入所有图标注册

```js
// 全量引入
import { defineCustomElements} from '@mache-hangar/icons/loader'
defineCustomElements()

```

2、按需引入图标注册【推荐】

```js
// 按需引入，自动注册
import '@mache-hangar/icons/dist/components/wt-icon-add-location.js'
```

像普通 html 标签一样使用
```html
<wt-icon-add-location></wt-icon-add-location>
```

3、所有 icon 名称

```js
import { icons } from '@mache-hangar/icons'
```

## 基础用法

通过设置 `name` 来使用其他图标

```html
<!-- 使用 wt-icon 为 SVG 图标提供属性 -->
<wt-icon name="edit" color="red"></wt-icon>

<!-- 或者独立使用它，不从父级获取属性 -->
<wt-icon-edit></wt-icon-edit>
```

## 倾斜 rotate

通过`rotate`倾斜 icon 角度

```html
<wt-icon name="edit" rotate="30"></wt-icon>
<wt-icon name="reading" rotate="60"></wt-icon>
```

## 旋转

添加`spin`属性来使 icon 旋转

```html
<wt-icon name="loading" spin></wt-icon>
<wt-icon name="refresh-right" spin></wt-icon>
<wt-icon name="refresh" spin></wt-icon>
```

## 大小

添加`size`属性来设置大小

```html
<wt-icon name="loading" size="16"></wt-icon>
<wt-icon name="loading"></wt-icon>
<wt-icon name="loading" size="24"></wt-icon>
<wt-icon name="loading" size="30"></wt-icon>
<wt-icon name="loading" size="36"></wt-icon>
```

## 颜色

添加`color`属性来设置颜色

```html
<wt-icon name="loading"></wt-icon>
<wt-icon name="loading" color="red"></wt-icon>
<wt-icon name="loading" color="blue"></wt-icon>
<wt-icon name="loading" color="pink"></wt-icon>
<wt-icon name="loading" color="green"></wt-icon>
```

## Attrs

| 属性名   | 说明   |类型| 可选值       | 默认值    |
|-------|------|-|-----------|--------|
| name  | 图标名称 |`string`| @mache-hangar/icons 图标 | - |
| rotate  | 图标旋转角度 |`number`| 0 | - |
| spin  | 360度旋转 |`boolean`| `true`、`false` | `false` |
| size  | 图标大小 |`string`| 合法的 css 单位 | `1em` |
| color | 图标颜色 |`string`| 合法的颜色值    | -      |

