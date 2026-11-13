# Tag

`wt-tag` is used to display status, categories, or lightweight informational hints. It supports 5 semantic colors and 2 visual variants.

## Basic Usage

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-tag type="primary">Primary</wt-tag>
		<wt-tag type="success">Success</wt-tag>
		<wt-tag type="warning">Warning</wt-tag>
		<wt-tag type="info">Info</wt-tag>
		<wt-tag type="error">Error</wt-tag>
	</div>
</template>

<script setup>
import { WtTag } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
	display: flex;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}
</style>
```
:::

## Outlined Style

Use `variant="outlined"` to switch to the outlined style.

:::demo
```vue
<template>
	<div class="demo-row">
		<wt-tag variant="outlined" type="primary">Primary</wt-tag>
		<wt-tag variant="outlined" type="success">Success</wt-tag>
		<wt-tag variant="outlined" type="warning">Warning</wt-tag>
		<wt-tag variant="outlined" type="info">Info</wt-tag>
		<wt-tag variant="outlined" type="error">Error</wt-tag>
	</div>
</template>

<script setup>
import { WtTag } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-row {
	display: flex;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}
</style>
```
:::

## List Scenario

In list views, you can map business states to different tag types.

:::demo
```vue
<template>
	<div class="demo-col">
		<div class="demo-row" v-for="item in statusList" :key="item.id">
			<span class="demo-label">{{ item.name }}</span>
			<wt-tag :type="item.type" :variant="item.variant">{{ item.status }}</wt-tag>
		</div>
	</div>
</template>

<script setup>
import { WtTag } from '@mache-hangar/components/vue';

const statusList = [
	{ id: 1, name: 'Build', status: 'Running', type: 'info', variant: 'solid' },
	{ id: 2, name: 'Deploy', status: 'Success', type: 'success', variant: 'outlined' },
	{ id: 3, name: 'Scan', status: 'Warning', type: 'warning', variant: 'solid' },
	{ id: 4, name: 'Alert', status: 'Error', type: 'error', variant: 'outlined' }
];
</script>

<style scoped>
.demo-col {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.demo-row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.demo-label {
	min-width: 64px;
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
| `type` | `'primary' \| 'success' \| 'warning' \| 'info' \| 'error'` | `'primary'` | Semantic tag type. |
| `variant` | `'solid' \| 'outlined'` | `'solid'` | Visual tag style. |

### Slots

| Slot | Description |
|--------|-------------|
| `default` | Tag content. |

### Events

This component does not expose custom events.
