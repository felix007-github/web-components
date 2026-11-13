# Input

`WtInput` is a flexible input component that supports multiple sizes, types, and states.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <WtInput v-model="text" placeholder="Enter text..." size="medium" />
    <p class="demo-note">Current value: {{ text || "Empty" }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtInput } from '@lpcp/components/vue';

const text = ref('');
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.demo-note {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
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
      <WtInput size="large" placeholder="Large"></WtInput>
      <WtInput size="medium" placeholder="Medium"></WtInput>
      <WtInput size="small" placeholder="Small"></WtInput>
      <WtInput size="min" placeholder="Min"></WtInput>
    </div>
  </div>
</template>

<script setup>
import { WtInput } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
```
:::

## Password Input

:::demo
```vue
<template>
  <div class="demo-col">
    <WtInput type="password" placeholder="Enter password..." size="medium" />
  </div>
</template>

<script setup>
import { WtInput } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```
:::

## Error State

:::demo
```vue
<template>
  <div class="demo-col">
    <WtInput error placeholder="Input with error state" />
    <p class="demo-note">This input is in an error state</p>
  </div>
</template>

<script setup>
import { WtInput } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo-note {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
```
:::

## Disabled And Read-Only

:::demo
```vue
<template>
  <div class="demo-col">
    <WtInput disabled placeholder="Disabled input" />
    <WtInput value="Read-only value" disabled />
  </div>
</template>

<script setup>
import { WtInput } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```
:::

## Event Handling

:::demo
```vue
<template>
  <div class="demo-col">
    <WtInput 
      :modelValue="value" 
      @updateModelValue="value = $event"
      placeholder="Type something..."
      @WtInput="handleInput"
      @wt-focus="handleFocus"
    />
    <p class="demo-note">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtInput } from '@lpcp/components/vue';

const value = ref('');
const status = ref('Not focused');

const handleInput = (e) => {
  status.value = `Input: ${e.detail}`;
};

const handleFocus = () => {
  status.value = 'Focused';
};
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo-note {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'password'` | `'text'` | Input type. |
| `placeholder` | `string` | `'Please input'` | Placeholder text. |
| `disabled` | `boolean` | `false` | Whether the input is disabled. |
| `error` | `boolean` | `false` | Whether to display the error state. |
| `size` | `'min' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Input size. |
| `modelValue` | `string` | - | Two-way bound value for `v-model`. |
| `defaultValue` | `string` | - | Default value. |
| `class` | `string` | - | Custom class name. |

### Events

| Event | Payload | Description |
|--------|---------|-------------|
| `wt-focus` | - | Triggered when the input gains focus. |
| `WtInput` | `string` | Triggered when the input value changes, carrying the new value. |
| `updateModelValue` | `string` | Used for `v-model` updates, carrying the new value. |
