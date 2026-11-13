# Modal

`WtModal` is a dialog component for displaying important information or handling user interaction above the main content. It supports custom titles, positioning, and close behavior.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-row">
    <wt-button @click="modalOpen = true">Open Modal</wt-button>
    <WtModal v-model="modalOpen" titleText="Confirm Action">
      <div>This is a basic modal dialog. Click outside or use the close button to dismiss it.</div>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const modalOpen = ref(false);
</script>
```
:::

## Custom Title

Use `titleText` to set the modal title.

:::demo
```vue
<template>
  <div class="demo-row">
    <wt-button @click="isOpen = true">Open Modal</wt-button>
    <WtModal v-model="isOpen" titleText="User Notice">
      <p>This modal uses a custom title.</p>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const isOpen = ref(false);
</script>
```
:::

## Custom Position

Use `top` to control the distance between the modal and the top of the viewport.

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="demo-row">
      <wt-button @click="openAt(10)">Top (10%)</wt-button>
      <wt-button @click="openAt(30)">Middle (30%)</wt-button>
      <wt-button @click="openAt(50)">Lower (50%)</wt-button>
    </div>
    <WtModal v-model="isOpen" :top="position" titleText="Position Demo">
      <p>This modal changes position based on the selected setting.</p>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const isOpen = ref(false);
const position = ref('20%');

const openAt = (value) => {
  position.value = `${value}%`;
  isOpen.value = true;
};
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-row {
  display: flex;
  gap: 8px;
}
</style>
```
:::

## Hide The Overlay

Use `showOverlay` to control whether the background overlay is displayed.

:::demo
```vue
<template>
  <div class="demo-row">
    <wt-button @click="showWithOverlay = true">Show Overlay</wt-button>
    <wt-button @click="showWithoutOverlay = true">Hide Overlay</wt-button>
    
    <WtModal v-model="showWithOverlay" titleText="With Overlay" :showOverlay="true">
      <p>This modal includes a background overlay.</p>
    </WtModal>
    
    <WtModal v-model="showWithoutOverlay" titleText="Without Overlay" :showOverlay="false">
      <p>This modal does not include a background overlay.</p>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const showWithOverlay = ref(false);
const showWithoutOverlay = ref(false);
</script>
```
:::

## Hide The Close Icon

Use `showCloseIcon` to control whether the close button is shown.

:::demo
```vue
<template>
  <div class="demo-row">
    <wt-button @click="withIcon = true">Show Close Button</wt-button>
    <wt-button @click="withoutIcon = true">Hide Close Button</wt-button>
    
    <WtModal v-model="withIcon" titleText="With Close Button" :showCloseIcon="true">
      <p>This modal shows the close button.</p>
    </WtModal>
    
    <WtModal v-model="withoutIcon" titleText="Without Close Button" :showCloseIcon="false">
      <p>This modal has no close button, so it must be closed by clicking outside.</p>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const withIcon = ref(false);
const withoutIcon = ref(false);
</script>
```
:::

## Events

The modal emits `wt-open-change` and `updateModelValue` when its open state changes.

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-button @click="isOpen = true">Open Modal</wt-button>
    <p v-if="isOpen" style="color: #666; font-size: 12px;">Modal is open</p>
    
    <WtModal 
      v-model="isOpen" 
      titleText="Event Demo"
      @wt-open-change="handleChange"
    >
      <p>Check the console output for event details.</p>
    </WtModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtButton, WtModal } from '@lpcp/components/vue';

const isOpen = ref(false);

const handleChange = (event) => {
  console.log('Modal state changed:', event.detail);
};
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```
:::
