# Radio

`WtRadio` is used to select a single value from multiple mutually exclusive options.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <div style="display: flex; align-items: center; gap: 8px;">
      <WtRadio v-model="selectedValue" value="option1" name="basic-group" />
      Option 1
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <WtRadio v-model="selectedValue" value="option2" name="basic-group" />
      Option 2
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <WtRadio v-model="selectedValue" value="option3" name="basic-group" />
      Option 3
    </div>
    <span class="demo-text">Current Selection: {{ selectedValue }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtRadio } from '@lpcp/components/vue';

const selectedValue = ref('option1');
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-text {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
```
:::

## Sizes

:::demo
```vue
<template>
  <div class="demo-col">
    <div class="demo-row">
      <span class="label">Small</span>
      <WtRadio size="small" v-model="sizeValue" value="small" name="size-group" />
    </div>
    <div class="demo-row">
      <span class="label">Medium</span>
      <WtRadio size="medium" v-model="sizeValue" value="medium" name="size-group" />
    </div>
    <div class="demo-row">
      <span class="label">Large</span>
      <WtRadio size="large" v-model="sizeValue" value="large" name="size-group" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtRadio } from '@lpcp/components/vue';

const sizeValue = ref('medium');
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-width: 60px;
}
</style>
```
:::

## Disabled State

:::demo
```vue
<template>
  <div class="demo-col">
    <WtRadio disabled value="disabled1" name="disabled-group" />
    <WtRadio disabled value="disabled2" name="disabled-group" modelValue="disabled2" />
  </div>
</template>

<script setup>
import { WtRadio } from '@lpcp/components/vue';
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

## Selected And Unselected States

:::demo
```vue
<template>
  <div class="demo-col">
    <div class="demo-row">
      <span class="label">Unchecked</span>
      <WtRadio v-model="stateValue" value="unchecked" name="state-group" />
    </div>
    <div class="demo-row">
      <span class="label">Checked</span>
      <WtRadio v-model="stateValue" value="checked" name="state-group" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtRadio } from '@lpcp/components/vue';

const stateValue = ref('checked');
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-width: 60px;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | `undefined` | Value of the radio option. |
| `modelValue` | `any` | `undefined` | Currently selected value for cross-framework `v-model`. |
| `disabled` | `boolean` | `false` | Whether the radio is disabled. |
| `size` | `'large' \| 'medium' \| 'small'` | `'medium'` | Radio size. |
| `name` | `string` | `undefined` | Native `name` attribute for grouping. |

### Events

| Event | Description | Callback Argument |
|--------|-------------|------------------|
| `wt-change` | Triggered when the value changes | `value: any` |
| `updateModelValue` | Cross-framework `v-model` update event | `value: any` |

### Slots

None

### CSS Variables

| Variable | Description | Default |
|--------|-------------|---------|
| `--wt-radio-size` | Medium size | `16px` |
| `--wt-radio-size-sm` | Small size | `14px` |
| `--wt-radio-size-lg` | Large size | `18px` |
| `--wt-radio-dot-size` | Medium dot size | `6px` |
| `--wt-radio-dot-size-sm` | Small dot size | `4px` |
| `--wt-radio-dot-size-lg` | Large dot size | `8px` |
| `--wt-radio-border-color` | Border color in the unchecked state | `rgba(69, 90, 100, 1)` |
| `--wt-radio-border-color-checked` | Border color in the checked state | `rgba(66, 94, 242, 1)` |
| `--wt-radio-dot-color` | Dot color | `rgba(66, 94, 242, 1)` |
| `--wt-radio-focus-ring-color` | Border color on hover when unchecked | `rgba(213, 221, 229, 1)` |
| `--wt-radio-focus-ring-color-checked` | Border color on hover when checked | `rgba(81, 181, 252, 0.24)` |
| `--wt-radio-focus-ring-width` | Border width on hover | `2px` |
| `--wt-radio-disabled-opacity` | Opacity in the disabled state | `0.24` |
| `--wt-radio-transition-duration` | Transition duration | `200ms` |
