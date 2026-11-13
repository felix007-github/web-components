# Badge

`WtBadge` is used to display message counts, status markers, or reminder information.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-row">
    <WtBadge value="8">
      <wt-button type="primary">Messages</wt-button>
    </WtBadge>
    <WtBadge value="new" type="primary">
      <wt-button>Tag</wt-button>
    </WtBadge>
  </div>
</template>

<script setup>
import { WtBadge, WtButton } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
```
:::

## Types

:::demo
```vue
<template>
  <div class="demo-row">
    <WtBadge value="12" type="primary"><wt-button>Primary</wt-button></WtBadge>
    <WtBadge value="12" type="success"><wt-button>Success</wt-button></WtBadge>
    <WtBadge value="12" type="warning"><wt-button>Warning</wt-button></WtBadge>
    <WtBadge value="12" type="danger"><wt-button>Danger</wt-button></WtBadge>
    <WtBadge value="12" type="info"><wt-button>Info</wt-button></WtBadge>
  </div>
</template>

<script setup>
import { WtBadge, WtButton } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
```
:::

## Maximum Value

:::demo
```vue
<template>
  <div class="demo-row">
    <WtBadge :value="16" :max="9"><wt-button>max 9</wt-button></WtBadge>
    <WtBadge :value="120" :max="99" type="warning"><wt-button>max 99</wt-button></WtBadge>
  </div>
</template>

<script setup>
import { WtBadge, WtButton } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
```
:::

## Dot Mode And Hidden State

:::demo
```vue
<template>
  <div class="demo-row">
    <WtBadge is-dot type="danger"><wt-button>Dot</wt-button></WtBadge>
    <WtBadge value="5" :hidden="hidden"><wt-button @click-btn="hidden = !hidden">Toggle Hidden</wt-button></WtBadge>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtBadge, WtButton } from '@mache-hangar/components/vue';

const hidden = ref(false);
</script>

<style scoped>
.demo-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | `''` | Displayed content. |
| `max` | `number` | `99` | Maximum numeric value. Values above this show as `max+`. |
| `isDot` | `boolean` | `false` | Whether to display a small dot. |
| `hidden` | `boolean` | `false` | Whether to hide the badge. |
| `type` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'` | Badge type. |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Content wrapped by the badge. |
