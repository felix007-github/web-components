# Avatar

`WtAvatar` is used to display user avatars, with support for images, text, and custom styles.

`WtAvatar-group` is used to display a collection of avatars. It supports a maximum visible count and automatically shows `+N` for overflow.

## Basic Text Avatars

:::demo
```vue
<template>
	<div class="avatar-row">
		<WtAvatar text="Felix Li"></WtAvatar>
		<WtAvatar text="Alex Chen"></WtAvatar>
		<WtAvatar text="Dana Lee" shape="square"></WtAvatar>
	</div>
</template>

<script setup>
import { WtAvatar } from '@mache-hangar/components/vue';
</script>

<style scoped>
.avatar-row {
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}
</style>
```
:::

## Image Avatars

:::demo
```vue
<template>
	<div class="avatar-row">
		<WtAvatar
			src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
			alt="Felix avatar"
			size="large"
		></WtAvatar>
		<WtAvatar
			src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
			alt="Dana avatar"
			size="medium"
		></WtAvatar>
		<WtAvatar
			src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
			alt="Neo avatar"
			size="small"
			shape="square"
		></WtAvatar>
	</div>
</template>

<script setup>
import { WtAvatar } from '@mache-hangar/components/vue';
</script>

<style scoped>
.avatar-row {
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}
</style>
```
:::

## Sizes And Custom Styles

:::demo
```vue
<template>
	<div class="avatar-row">
		<WtAvatar text="FL" size="large"></WtAvatar>
		<WtAvatar text="DL" size="medium"></WtAvatar>
		<WtAvatar text="NL" size="small"></WtAvatar>
		<WtAvatar
			text="VIP"
			shape="square"
			:styles="{
				backgroundColor: '#0f172a',
				color: '#f8fafc'
			}"
		></WtAvatar>
	</div>
</template>

<script setup>
import { WtAvatar } from '@mache-hangar/components/vue';
</script>

<style scoped>
.avatar-row {
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}
</style>
```
:::

## Avatar Group (Slot Mode)

Pass multiple `WtAvatar` components through the default slot, then use `max` to control how many are visible.

:::demo
```vue
<template>
	<WtAvatarGroup max="4" size="medium">
		<WtAvatar text="Felix Li"></WtAvatar>
		<WtAvatar text="Dana Lee"></WtAvatar>
		<WtAvatar text="Neo Wang"></WtAvatar>
		<WtAvatar text="Alex North"></WtAvatar>
		<WtAvatar text="Aiden Zhou"></WtAvatar>
		<WtAvatar text="Mila Chen"></WtAvatar>
	</WtAvatarGroup>
</template>
<script setup>
import { WtAvatar, WtAvatarGroup } from '@mache-hangar/components/vue';
</script>
```
:::

## Avatar Group (List Mode)

When data is passed through `list`, `WtAvatar-group` will apply a unified `size` and `shape` to the avatars and automatically show `+N` when the count exceeds `max`.

:::demo
```vue
<template>
	<div class="avatar-col">
		<WtAvatarGroup :list="members" :max="3" size="large"></WtAvatarGroup>
		<WtAvatarGroup :list="members" :max="5" size="small" shape="square"></WtAvatarGroup>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { WtAvatarGroup } from '@mache-hangar/components/vue';

const members = ref([
	{ text: 'Felix Li' },
	{ text: 'Dana Lee' },
	{ text: 'Neo Wang' },
	{ text: 'Aiden Zhou' },
	{ text: 'Mila Chen' },
	{ text: 'Alex North' },
	{
		text: 'VIP',
		styles: {
			backgroundColor: '#0f172a',
			color: '#f8fafc'
		}
	}
]);
</script>

<style scoped>
.avatar-col {
	display: flex;
	flex-direction: column;
	gap: 14px;
}
</style>
```
:::

## API

### Avatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `''` | Image URL. When provided, the image is displayed first. |
| `alt` | `string` | `''` | Alternative text for the image. |
| `text` | `string` | `'User'` | Text content for the avatar. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Avatar size. |
| `shape` | `'circle' \| 'square'` | `'circle'` | Avatar shape. |
| `styles` | `{ [key: string]: string }` | `{}` | Custom styles for the inner avatar container. |

### Avatar Group Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `list` | `AvatarItem[]` | `[]` | Avatar data list. When provided, this render mode takes priority. |
| `max` | `number` | `5` | Maximum visible avatar count. Extra items are shown as `+N`. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Shared avatar size within the group. |
| `shape` | `'circle' \| 'square'` | `'circle'` | Shared avatar shape within the group. |

### AvatarItem

| Field | Type | Description |
|------|------|-------------|
| `src` | `string` | Avatar image URL. |
| `alt` | `string` | Alternative text for the image. |
| `text` | `string` | Text content for the avatar. |
| `styles` | `{ [key: string]: string }` | Style overrides for a single avatar. |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Accepts multiple `WtAvatar` components in slot mode. |
