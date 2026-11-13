# Progress

`wt-progress` is a progress bar component used to display task progress. It supports both linear and circular shapes, along with multiple types and colors.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-progress :percentage="30"></wt-progress>
    <wt-progress :percentage="60"></wt-progress>
    <wt-progress :percentage="100"></wt-progress>
  </div>
</template>

<script setup>
import { WtProgress } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```
:::

## Different Types

Use the `type` prop to set the color style of the progress bar. Supported values are `primary`, `success`, and `error`.

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="progress-item">
      <span>Primary:</span>
      <wt-progress type="primary" :percentage="50"></wt-progress>
    </div>
    <div class="progress-item">
      <span>Success:</span>
      <wt-progress type="success" :percentage="75"></wt-progress>
    </div>
    <div class="progress-item">
      <span>Error:</span>
      <wt-progress type="error" :percentage="25"></wt-progress>
    </div>
  </div>
</template>

<script setup>
import { WtProgress } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-item span {
  min-width: 70px;
  font-size: 14px;
}
</style>
```
:::

## With Labels

Use the `label` prop to add a text label to the progress bar.

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-progress label="Loading..." :percentage="33" type="primary"></wt-progress>
    <wt-progress label="Processing..." :percentage="66" type="success"></wt-progress>
    <wt-progress label="Failed" :percentage="20" type="error"></wt-progress>
  </div>
</template>

<script setup>
import { WtProgress } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```
:::

## Circular Progress

Set `shape="circle"` to switch to a circular progress bar.

:::demo
```vue
<template>
  <div class="demo-row">
    <div class="circle-item">
      <wt-progress shape="circle" type="primary" :percentage="25"></wt-progress>
      <p>25%</p>
    </div>
    <div class="circle-item">
      <wt-progress shape="circle" type="success" :percentage="50"></wt-progress>
      <p>50%</p>
    </div>
    <div class="circle-item">
      <wt-progress shape="circle" type="error" :percentage="75"></wt-progress>
      <p>75%</p>
    </div>
    <div class="circle-item">
      <wt-progress shape="circle" type="primary" :percentage="100"></wt-progress>
      <p>100%</p>
    </div>
  </div>
</template>

<script setup>
import { WtProgress } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.circle-item p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
```
:::

## Dynamic Progress Updates

Update the value of `percentage` to change the progress dynamically.

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="demo-row">
      <wt-button @click="percentage -= 10">-10%</wt-button>
      <wt-button @click="percentage += 10">+10%</wt-button>
      <wt-button @click="percentage = 0">Reset</wt-button>
    </div>
    <wt-progress type="primary" :percentage="percentage" label="Progress"></wt-progress>
    <p>Current Progress: {{ percentage }}%</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtProgress, WtButton } from '@mache-hangar/components/vue';

const percentage = ref(0);
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-row {
  display: flex;
  gap: 8px;
}

p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
```
:::
