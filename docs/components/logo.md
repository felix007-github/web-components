# Logo

`WtLogo` is a brand logo component used to display environment-specific logos, with support for custom size and text.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLogo></WtLogo>
  </div>
</template>

<script setup>
import { WtLogo } from '@lpcp/components/vue';
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

## Different Environments

Use the `environment` prop to switch logo styles. Supported environments are `prod`, `dev`, and `cert`.

:::demo
```vue
<template>
  <div class="demo-row">
    <div class="logo-group">
      <p>Production (Prod):</p>
      <WtLogo environment="prod"></WtLogo>
    </div>
    <div class="logo-group">
      <p>Development (Dev):</p>
      <WtLogo environment="dev"></WtLogo>
    </div>
    <div class="logo-group">
      <p>Certification (Cert):</p>
      <WtLogo environment="cert"></WtLogo>
    </div>
  </div>
</template>


<script setup>
import { WtLogo } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 32px;
}

.logo-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-group p {
  font-size: 12px;
  color: #666;
  margin: 0;
}
</style>
```
:::

## Custom Size

Use the `size` prop in pixels to customize the logo size.

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLogo :size="24"></WtLogo>
    <WtLogo :size="40"></WtLogo>
    <WtLogo :size="56"></WtLogo>
    <WtLogo :size="80"></WtLogo>
  </div>
</template>

<script setup>
import { WtLogo } from '@lpcp/components/vue';
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

## Custom Text

Use the `text` prop to customize the text displayed next to the logo, or pass an empty string to hide it.

:::demo
```vue
<template>
  <div class="demo-row">
    <WtLogo text="L+CP"></WtLogo>
    <WtLogo text="Company"></WtLogo>
    <WtLogo :text="''"></WtLogo>
  </div>
</template>

<script setup>
import { WtLogo } from '@lpcp/components/vue';
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

## Complete Example

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="logo-card">
      <p>Standard Setup</p>
      <WtLogo environment="prod" :size="48" text="L+CP"></WtLogo>
    </div>
    <div class="logo-card">
      <p>Development Environment</p>
      <WtLogo environment="dev" :size="40" text="Dev"></WtLogo>
    </div>
  </div>
</template>

<script setup>
import { WtLogo } from '@lpcp/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-card p {
  margin: 0;
  font-size: 14px;
  color: #666;
  min-width: 80px;
}
</style>
```
:::
