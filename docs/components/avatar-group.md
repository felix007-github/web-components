# Avatar Group

`WtAvatarGroup` is an avatar group component for displaying multiple user avatars. It supports a maximum visible count and an overflow indicator.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-row">
    <WtAvatarGroup :list="[
      { text: 'Alice' },
      { text: 'Bob' },
      { text: 'Charlie' }
    ]"></WtAvatarGroup>
  </div>
</template>

<script setup>
import { WtAvatarGroup } from '@lpcp/components/vue';
</script>
```
:::

## Maximum Visible Count

Use the `max` prop to control how many avatars are shown. Extra avatars are represented as `+N`.

:::demo
```vue
<template>
  <div class="demo-row">
    <WtAvatarGroup :max="3" :list="[
      { text: 'Alice' },
      { text: 'Bob' },
      { text: 'Charlie' },
      { text: 'David' },
      { text: 'Eve' }
    ]"></WtAvatarGroup>
  </div>
</template>

<script setup>
import { WtAvatarGroup } from '@lpcp/components/vue';
</script>
```
:::

## Sizes

Supports three preset sizes: `small`, `medium`, and `large`.

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="demo-row">
      <span>Small:</span>
      <WtAvatarGroup size="small" :list="[
        { text: 'A' },
        { text: 'B' },
        { text: 'C' }
      ]"></WtAvatarGroup>
    </div>
    <div class="demo-row">
      <span>Medium:</span>
      <WtAvatarGroup size="medium" :list="[
        { text: 'A' },
        { text: 'B' },
        { text: 'C' }
      ]"></WtAvatarGroup>
    </div>
    <div class="demo-row">
      <span>Large:</span>
      <WtAvatarGroup size="large" :list="[
        { text: 'A' },
        { text: 'B' },
        { text: 'C' }
      ]"></WtAvatarGroup>
    </div>
  </div>
</template>

<script setup>
import { WtAvatarGroup } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
```
:::

## Shapes

Supports two shapes: `circle` and `square`.

:::demo
```vue
<template>
  <div class="demo-row">
    <WtAvatarGroup shape="circle" :list="[
      { text: 'Circle1' },
      { text: 'Circle2' }
    ]"></WtAvatarGroup>
    <WtAvatarGroup shape="square" :list="[
      { text: 'Square1' },
      { text: 'Square2' }
    ]"></WtAvatarGroup>
  </div>
</template>

<script setup>
import { WtAvatarGroup } from '@lpcp/components/vue';
</script>
```
:::

## Using Slots

You can also place `wt-avatar` components directly inside the group via slots.

:::demo
```vue
<template>
  <div class="demo-row">
    <WtAvatarGroup :max="2">
      <wt-avatar text="User1"></wt-avatar>
      <wt-avatar text="User2"></wt-avatar>
      <wt-avatar text="User3"></wt-avatar>
      <wt-avatar text="User4"></wt-avatar>
    </WtAvatarGroup>
  </div>
</template>

<script setup>
import { WtAvatarGroup, WtAvatar } from '@lpcp/components/vue';
</script>
```
:::
