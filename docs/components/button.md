# Button

`WtButton` is a feature-rich button component that supports multiple types, sizes, and states.

## Types

:::demo
```vue
<template>
  <div class="demo-row">
    <WtButton type="primary">Primary</WtButton>
    <WtButton type="dark">Dark</WtButton>
    <WtButton type="primary" plain>Plain Primary</WtButton>
    <WtButton type="dark" plain>Plain Dark</WtButton>
  </div>
</template>

<script setup>
import { WtButton } from '@mache-hangar/components/vue';
</script>
```
:::

## Sizes

:::demo
```vue
<template>
  <div class="demo-row">
    <WtButton size="large">Large</WtButton>
    <WtButton size="medium">Medium</WtButton>
    <WtButton size="small">Small</WtButton>
    <WtButton size="min">Min</WtButton>
  </div>
</template>

<script setup>
import { WtButton } from '@mache-hangar/components/vue';
</script>
```
:::

## Disabled State

:::demo
```vue
<template>
  <div class="demo-row">
    <WtButton disabled>Disabled</WtButton>
    <WtButton type="dark" disabled>Dark Disabled</WtButton>
    <WtButton plain disabled>Plain Disabled</WtButton>
  </div>
</template>

<script setup>
import { WtButton } from '@mache-hangar/components/vue';
</script>
```
:::

## Slot Placement
:::demo
```vue
<template>
  <div class="demo-row">
    <WtButton><WtIcon slot="after" name="add"></WtIcon>after</WtButton>
    <WtButton type="dark"><WtIcon slot="before" name="add"></WtIcon>before</WtButton>
    <WtButton plain disabled>Plain Disabled</WtButton>
  </div>
</template>

<script setup>
import { WtButton, WtIcon } from '@mache-hangar/components/vue';
</script>
```
:::

## Click Event

Clicking the button triggers the `click-btn` event, which carries timestamp information in the format `{ time: Date }`.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtButton type="primary" @click-btn="handleClick">Click Me</WtButton>
    <p class="demo-note">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton } from '@mache-hangar/components/vue';

const message = ref('No clicks yet');
const handleClick = (e) => {
  const time = e.detail.time.toLocaleTimeString();
  message.value = `Clicked at ${time}`;
};
</script>

<style scoped>
.demo-note {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 0;
}
</style>
```
:::

## Size Combinations

:::demo
```vue
<template>
  <div class="demo-matrix">
    <div class="demo-row" v-for="type in ['primary', 'dark']" :key="type">
      <WtButton v-for="size in ['large', 'medium', 'small', 'min']" :key="size" :type="type" :size="size">
        {{ type }} {{ size }}
      </WtButton>
    </div>
  </div>
</template>

<script setup>
import { WtButton } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-matrix {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.demo-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'primary' \| 'dark'` | `'primary'` | Button type. |
| `size` | `'min' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Button size. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `plain` | `boolean` | `false` | Whether to use the plain outline style. |

### Events

| Event | Payload | Description |
|--------|---------|-------------|
| `click-btn` | `{ time: Date }` | Triggered when the button is clicked. Not emitted when disabled. |
