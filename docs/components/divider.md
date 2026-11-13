# Divider

`WtDivider` is a divider component used to separate content areas horizontally or vertically. It supports solid and dashed styles, along with three color variants.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <wt-divider></wt-divider>
  </div>
</template>

<style scoped>
.demo-col {
  padding: 16px 0;
}
</style>
```
:::

## Color Variants

Use the `variant` prop to choose a preset color variant: `default`, `subdued`, or `strong`.

:::demo
```vue
<template>
  <div class="demo-col">
    <p class="label">default</p>
    <wt-divider variant="default"></wt-divider>
    <p class="label">subdued</p>
    <wt-divider variant="subdued"></wt-divider>
    <p class="label">strong</p>
    <wt-divider variant="strong"></wt-divider>
  </div>
</template>

<style scoped>
.demo-col { display: flex; flex-direction: column; gap: 8px; }
.label { margin: 0; font-size: 12px; color: #90A4AE; }
</style>
```
:::

## Dashed Style

Set `border-style="dashed"` to use a dashed divider.

:::demo
```vue
<template>
  <div class="demo-col">
    <wt-divider border-style="dashed" variant="default"></wt-divider>
    <wt-divider border-style="dashed" variant="subdued"></wt-divider>
    <wt-divider border-style="dashed" variant="strong"></wt-divider>
  </div>
</template>

<style scoped>
.demo-col { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
</style>
```
:::

## Custom Color

Pass a custom color with the `color` prop. It takes precedence over `variant`.

:::demo
```vue
<template>
  <div class="demo-col">
    <wt-divider color="rgba(108, 133, 248, 1)"></wt-divider>
    <wt-divider color="rgba(75, 171, 82, 1)" border-style="dashed"></wt-divider>
    <wt-divider color="rgba(232, 23, 31, 1)" border-width="2px"></wt-divider>
  </div>
</template>

<style scoped>
.demo-col { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
</style>
```
:::

## Custom Width

Use `border-width` to control divider thickness.

:::demo
```vue
<template>
  <div class="demo-col">
    <wt-divider border-width="1px" variant="strong"></wt-divider>
    <wt-divider border-width="2px" variant="strong"></wt-divider>
    <wt-divider border-width="4px" variant="strong"></wt-divider>
  </div>
</template>

<style scoped>
.demo-col { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
</style>
```
:::

## Vertical Divider

Set `direction="vertical"` to use a vertical divider, which works well between text or button groups.

:::demo
```vue
<template>
  <div class="demo-row">
    <span>Text A</span>
    <wt-divider direction="vertical" variant="default"></wt-divider>
    <span>Text B</span>
    <wt-divider direction="vertical" variant="subdued"></wt-divider>
    <span>Text C</span>
    <wt-divider direction="vertical" variant="strong"></wt-divider>
    <span>Text D</span>
    <wt-divider direction="vertical" border-style="dashed" color="rgba(108, 133, 248, 1)"></wt-divider>
    <span>Text E</span>
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  align-items: center;
  height: 32px;
  gap: 0;
  font-size: 13px;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Divider direction. |
| `borderStyle` | `'solid' \| 'dashed'` | `'solid'` | Divider style. |
| `variant` | `'default' \| 'subdued' \| 'strong'` | `'default'` | Color variant used when no custom `color` is provided. |
| `color` | `string` | `undefined` | Custom color. Takes precedence over `variant`. |
| `borderWidth` | `string` | `'1px'` | Divider thickness. Supports any valid CSS length. |

### Color Variant Reference

| variant | Color value |
|---------|-------------|
| `default` | `rgba(197, 206, 217, 1)` |
| `subdued` | `rgba(213, 221, 229, 1)` |
| `strong` | `rgba(80, 100, 133, 1)` |
