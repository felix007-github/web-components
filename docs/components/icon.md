# Icon

`WtIcon` is used to display scalable SVG icons and supports multiple sizes, colors, and effects.

## Sizes

:::demo
```vue
<template>
  <div class="demo-row">
    <WtIcon name="add" size="32"></WtIcon>
    <WtIcon name="add" size="24"></WtIcon>
    <WtIcon name="add" size="16"></WtIcon>
    <WtIcon name="add" size="12"></WtIcon>
  </div>
</template>

<script setup>
import { WtIcon } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 24px;
  align-items: center;
}
</style>
```
:::

## Colors

:::demo
```vue
<template>
  <div class="demo-row">
    <WtIcon name="add" size="24" color="#425ef2"></WtIcon>
    <WtIcon name="add" size="24" color="#22c55e"></WtIcon>
    <WtIcon name="add" size="24" color="#f59e0b"></WtIcon>
    <WtIcon name="add" size="24" color="#ef4444"></WtIcon>
  </div>
</template>

<script setup>
import { WtIcon } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 24px;
  align-items: center;
}
</style>
```
:::

## Rotation

:::demo
```vue
<template>
  <div class="demo-row">
    <WtIcon name="refresh" size="24" rotate="0"></WtIcon>
    <WtIcon name="refresh" size="24" rotate="45"></WtIcon>
    <WtIcon name="refresh" size="24" rotate="90"></WtIcon>
    <WtIcon name="refresh" size="24" rotate="180"></WtIcon>
  </div>
</template>

<script setup>
import { WtIcon } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 24px;
  align-items: center;
}
</style>
```
:::

## Spinning Animation

:::demo
```vue
<template>
  <div class="demo-row">
    <WtIcon name="refresh" size="24" spin></WtIcon>
    <WtIcon name="settings" size="24" spin></WtIcon>
  </div>
</template>

<script setup>
import { WtIcon } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 24px;
  align-items: center;
}
</style>
```
:::


## Icon Catalog

:::demo
```vue
<template>
  <div class="icon-row">
    <div v-for="iconName in iconList" class="icon-item">
      <WtIcon :name="iconName" :size="24"></WtIcon>
      <div class="icon-name">{{ iconName }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { icons } from '@lpcp/icons';
import { WtIcon } from '@lpcp/components/vue';
const iconList = [...icons].filter(Boolean).sort((a, b) => a.localeCompare(b));
</script>

<style scoped>
.demo-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  max-height: 420px;
  overflow: auto;
  padding-right: 4px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

.icon-name {
  font-size: 12px;
  line-height: 1.25;
  color: #4b5563;
  text-align: center;
  word-break: break-all;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Icon name, corresponding to the `WtIcon-{name}` component. |
| `size` | `string` | - | Icon size, such as a pixel value like `24` or any CSS length. |
| `color` | `string` | - | Icon color as a CSS color value. |
| `rotate` | `number` | - | Rotation angle from 0 to 360. |
| `spin` | `boolean` | `false` | Whether to enable automatic spinning animation. |
| `styles` | `object` | - | Custom CSS style object. |
| `classNames` | `string` | - | Custom class name. |
