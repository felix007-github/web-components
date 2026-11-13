# Link

`WtLink` is a lightweight text link component that supports configurable font size, underline, disabled state, and custom color.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLink>Default Link</WtLink>
    <WtLink href="https://example.com" target="_blank">External Link</WtLink>
    <WtLink text="Text Prop Link" />
  </div>
</template>

<script setup>
import { WtLink } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
```
:::

## Three Font Sizes

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLink size="small">Small Link</WtLink>
    <WtLink size="medium">Medium Link</WtLink>
    <WtLink size="large">Large Link</WtLink>
  </div>
</template>

<script setup>
import { WtLink } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
```
:::

## Underline

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLink underline>Underline Link</WtLink>
    <WtLink>No Underline Link</WtLink>
  </div>
</template>

<script setup>
import { WtLink } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 14px;
  align-items: center;
}
</style>
```
:::

## Enabled And Disabled

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLink href="https://example.com" target="_blank">Available Link</WtLink>
    <WtLink disabled underline>Disabled Link</WtLink>
  </div>
</template>

<script setup>
import { WtLink } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 14px;
  align-items: center;
}
</style>
```
:::

## Custom Colors

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLink color="blue">Blue Link</WtLink>
    <WtLink color="green" underline>Green Link</WtLink>
    <WtLink color="red">Red Link</WtLink>
  </div>
</template>

<script setup>
import { WtLink } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | `''` | Link URL. When empty, clicking does not navigate. |
| `target` | `'_self' \| '_blank' \| '_parent' \| '_top'` | `'_self'` | Target used when opening the link. |
| `rel` | `string` | `''` | `rel` attribute for the link. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Link font size. |
| `underline` | `boolean` | `false` | Whether to show an underline. |
| `disabled` | `boolean` | `false` | Whether the link is disabled, with `0.24` opacity and no interaction. |
| `color` | `string` | `'rgba(69, 90, 100, 1)'` | Text color. |
| `text` | `string` | `''` | Text displayed when no default slot is provided. |
