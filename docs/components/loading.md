# Loading

`wt-loading` is used to display a loading state indicator, with support for preset sizes, numeric sizes, and text control.

> You can use the `wt-loading` custom element directly in the docs site without importing anything else.

## Basic Usage

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-loading></wt-loading>
	</div>
</template>

<style scoped>
.demo-row {
	display: flex;
	align-items: center;
	gap: 16px;
}
</style>
```
:::

## Preset Sizes

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-loading size="small" text="Small"></wt-loading>
		<wt-loading size="medium" text="Medium"></wt-loading>
		<wt-loading size="large" text="Large"></wt-loading>
	</div>
</template>

<style scoped>
.demo-row {
	display: flex;
	align-items: flex-start;
	gap: 18px;
	flex-wrap: wrap;
}
</style>
```
:::

## Numeric Sizes

`size` also accepts a number, which is treated as pixels.

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-loading :size="18" text="18px"></wt-loading>
		<wt-loading :size="32" text="32px"></wt-loading>
		<wt-loading :size="56" text="56px"></wt-loading>
	</div>
</template>

<style scoped>
.demo-row {
	display: flex;
	align-items: flex-start;
	gap: 18px;
	flex-wrap: wrap;
}
</style>
```
:::

## Text Control

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-loading text="Fetching data..."></wt-loading>
		<wt-loading text="Please wait..."></wt-loading>
		<wt-loading :show-text="false"></wt-loading>
	</div>
</template>

<style scoped>
.demo-row {
	display: flex;
	align-items: flex-start;
	gap: 18px;
	flex-wrap: wrap;
}
</style>
```
:::

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large' \| number` | `24` | Size of the loading icon. Numbers are treated as pixels. |
| `showText` | `boolean` | `true` | Whether to display the text label. |
| `text` | `string` | `'Loading...'` | Text shown below or beside the indicator. |
