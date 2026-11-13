# Checkbox

`WtCheckbox` is used to select one or more options, and it can also be used independently as a single toggle.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <WtCheckbox v-model="checkedA">Default State</WtCheckbox>
    <WtCheckbox v-model="checkedB">Checked</WtCheckbox>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtCheckbox } from '@mache-hangar/components/vue';

const checkedA = ref(false);
const checkedB = ref(true);
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```
:::

## Disabled State

:::demo
```vue
<template>
  <div class="demo-col">
    <WtCheckbox disabled>Disabled</WtCheckbox>
    <WtCheckbox disabled checked>Checked And Disabled</WtCheckbox>
  </div>
</template>

<script setup>
import { WtCheckbox } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```
:::

## Indeterminate State

:::demo
```vue
<template>
  <WtCheckbox indeterminate>Indeterminate</WtCheckbox>
</template>

<script setup>
import { WtCheckbox } from '@mache-hangar/components/vue';
</script>
```
:::

## Sizes

:::demo
```vue
<template>
  <div class="demo-col">
    <WtCheckbox size="large">Large</WtCheckbox>
    <WtCheckbox size="medium">Medium</WtCheckbox>
    <WtCheckbox size="small">Small</WtCheckbox>
  </div>
</template>

<script setup>
import { WtCheckbox } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```
:::

## Custom Bound Values

Map the checked and unchecked states with `true-value` and `false-value`.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtCheckbox v-model="status" true-value="yes" false-value="no">Custom Value</WtCheckbox>
    <span class="demo-text">Current Value: {{ status }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtCheckbox } from '@mache-hangar/components/vue';

const status = ref('no');
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-text {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Whether the checkbox is checked. |
| `modelValue` | `any` | `undefined` | Bound value for cross-framework `v-model`. |
| `trueValue` / `falseValue` | `any` | `true` / `false` | Values mapped to checked and unchecked states. |
| `label` | `string` | `undefined` | Label text. |
| `disabled` | `boolean` | `false` | Whether the checkbox is disabled. |
| `indeterminate` | `boolean` | `false` | Whether the checkbox is indeterminate. Visual state only. |
| `size` | `'large' \| 'medium' \| 'small'` | `undefined` | Checkbox size. |
| `name` | `string` | `undefined` | Native `name` attribute. |
| `required` | `boolean` | `false` | Whether the field is required. |

### Events

| Event | Payload | Description |
|--------|---------|-------------|
| `wt-change` | `any` | Triggered when the value changes. |
| `updateModelValue` | `any` | Used for two-way binding updates. |
