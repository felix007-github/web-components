# Switch

`WtSwitch` is used to quickly toggle between two mutually exclusive states.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSwitch v-model="enabled" />
    <span class="demo-text">Current State: {{ enabled ? 'On' : 'Off' }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtSwitch } from '@mache-hangar/components/vue';

const enabled = ref(false);
</script>

<style scoped>
.demo-col {
  display: flex;
  align-items: center;
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
  <div class="demo-row">
    <WtSwitch size="medium" v-model="mediumValue" />
    <WtSwitch size="small" v-model="smallValue" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtSwitch } from '@mache-hangar/components/vue';

const mediumValue = ref(false);
const smallValue = ref(true);
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

## Disabled State

:::demo
```vue
<template>
  <div class="demo-row">
    <WtSwitch disabled v-model="offDisabled" />
    <WtSwitch disabled v-model="onDisabled" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtSwitch } from '@mache-hangar/components/vue';

const offDisabled = ref(false);
const onDisabled = ref(true);
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

## Event Example

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSwitch v-model="value" @wt-change="handleChange" />
    <span class="demo-text">Last Changed Value: {{ log }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtSwitch } from '@mache-hangar/components/vue';

const value = ref(false);
const log = ref('None');

const handleChange = (e) => {
  log.value = String(e.detail);
};
</script>

<style scoped>
.demo-col {
  display: flex;
  align-items: center;
  gap: 10px;
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
| `modelValue` | `boolean` | `undefined` | Bound value. |
| `disabled` | `boolean` | `false` | Whether the switch is disabled. |
| `size` | `'large' \| 'medium' \| 'small'` | `undefined` | Switch size. |

### Events

| Event | Payload | Description |
|--------|---------|-------------|
| `wt-change` | `boolean` | Triggered when the value changes. |
| `updateModelValue` | `boolean` | Used for two-way binding updates. |
