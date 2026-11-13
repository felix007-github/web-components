# Search

`WtSearch` is a search box component that includes an input field, a clear icon, and a search button. It supports three sizes, a disabled state, and two-way binding.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch placeholder="Please enter search content" />
  </div>
</template>

<script setup>
import { WtSearch } from '@lpcp/components/vue'; 
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

## Three Sizes

Use the `size` prop to control the component size. Supported values are `small`, `medium` (default), and `large`.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch size="small" placeholder="Small (36px height)" />
    <WtSearch size="medium" placeholder="Medium (40px height)" />
    <WtSearch size="large" placeholder="Large (56px height)" />
  </div>
</template>

<script setup>
import { WtSearch } from '@lpcp/components/vue'; 
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

## Two-Way Binding

Use `v-model` for two-way binding of the input value. Clicking the search button triggers the `WtSearch` event.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch
      v-model="keyword"
      placeholder="Enter keywords..."
      @WtSearch="onSearch"
    />
    <p class="echo">Current Value: {{ keyword || '(empty)' }}</p>
    <p v-if="lastSearch" class="echo" style="color: #51B5FC">
      Search Triggered: {{ lastSearch }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtSearch } from '@lpcp/components/vue'; 
const keyword = ref('');
const lastSearch = ref('');
const onSearch = (e) => { lastSearch.value = e.detail; };
</script>

<style scoped>
.demo-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.echo {
  margin: 0;
  font-size: 13px;
  color: #455A64;
}
</style>
```
:::

## Clear Icon

When the input contains text, a clear icon is shown. `clearable` defaults to `true`. Set `:clearable="false"` to disable it.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch default-value="This text can be cleared" :clearable="true" placeholder="clearable=true" />
    <WtSearch default-value="This text cannot be cleared" :clearable="false" placeholder="clearable=false" />
  </div>
</template>

<script setup>
import { WtSearch } from '@lpcp/components/vue'; 
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

Set `disabled` to disable the component. When disabled, the user cannot type, clear, or search.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch disabled placeholder="Disabled search box" />
    <WtSearch disabled default-value="Disabled with content" clearable />
  </div>
</template>

<script setup>
import { WtSearch } from '@lpcp/components/vue'; 
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

## Custom Width

Use the `width` prop to set the component width, such as `100%` or `500px`. If omitted, the default width for the selected size is used.

:::demo
```vue
<template>
  <div class="demo-col">
    <WtSearch width="100%" placeholder="Width 100%" />
    <WtSearch width="220px" size="small" placeholder="Width 220px" />
  </div>
</template>

<script setup>
import { WtSearch } from '@lpcp/components/vue'; 
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

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size. |
| `placeholder` | `string` | `'Please enter search content'` | Placeholder text. |
| `disabled` | `boolean` | `false` | Whether the component is disabled. |
| `clearable` | `boolean` | `true` | Whether to show the clear icon. |
| `modelValue` | `string` | — | Bound value for `v-model` in Vue. |
| `defaultValue` | `string` | `''` | Default value in React. |
| `width` | `string` | — | Custom width. If omitted, the default width for the selected size is used. |

### Size Specs

| size | Height | Font Size | Default Width |
|------|--------|-----------|---------------|
| `small` | 36px | 14px | 320px |
| `medium` | 40px | 16px | 340px |
| `large` | 56px | 18px | 360px |

### Events

| Event | Description | Payload |
|--------|-------------|---------|
| `wt-input` | Triggered when the input value changes | `CustomEvent<string>` |
| `wt-clear` | Triggered when the clear icon is clicked | `CustomEvent<void>` |
| `WtSearch` | Triggered when the search button is clicked | `CustomEvent<string>` |
| `updateModelValue` | `v-model` sync event | `CustomEvent<string>` |
