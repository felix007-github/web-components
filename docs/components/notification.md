# Notification

`wt-notification` is used to display status messages inside the page, with support for titles, action buttons, and close events.

`WtNotificationService` is used to show toast-style notifications at the bottom of the page, which works well for global feedback.

> You can use the `wt-notification` custom element directly in the docs site without extra imports. When using the service API, import `WtNotificationService` in your script.

## Basic Types

:::demo
```vue
<template>
	<div class="demo-col">
		<wt-notification type="success" message="Saved successfully. Your configuration is now active."></wt-notification>
		<wt-notification type="info" message="You have a new system notification."></wt-notification>
		<wt-notification type="warning" message="Disk space is running low. Please clean up soon."></wt-notification>
		<wt-notification type="error" message="Upload failed. Please try again later."></wt-notification>
	</div>
</template>

<style scoped>
.demo-col {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
</style>
```
:::

## Title And Action

Use `titleText` and `actionLabel` to build richer notifications. Clicking the action button triggers `wt-action`.

:::demo
```vue
<template>
	<div class="demo-col">
		<wt-notification
			type="warning"
			title-text="Version Update Available"
			message="A new version v2.3.0 has been detected. We recommend upgrading soon."
			action-label="Update Now"
			@wt-action="handleAction"
		></wt-notification>

		<p class="demo-note">Action Click Count: {{ actionCount }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const actionCount = ref(0);

const handleAction = () => {
	actionCount.value += 1;
};
</script>

<style scoped>
.demo-col {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.demo-note {
	margin: 0;
	font-size: 13px;
	color: var(--vp-c-text-2);
}
</style>
```
:::

## Full Width Mode

When `isFullWidth` is `true`, the notification stretches to the full width of its parent container. This is useful for top-of-page or in-container banner messages.

:::demo
```vue
<template>
	<div class="banner-wrap">
		<wt-notification
			type="info"
			:is-full-width="true"
			title-text="Maintenance Notice"
			message="System maintenance is scheduled for tonight from 23:00 to 23:30."
			action-label="View Details"
		></wt-notification>
	</div>
</template>

<style scoped>
.banner-wrap {
	border: 1px solid var(--vp-c-divider);
	overflow: hidden;
}
</style>
```
:::

## Close Event

Clicking the close button on the right triggers `wt-close`.

:::demo
```vue
<template>
	<div class="demo-col">
		<wt-notification
			type="error"
			title-text="Release Failed"
			message="The current release failed. Please review the pipeline logs."
			@wt-close="handleClose"
		></wt-notification>

		<p class="demo-note">Close Count: {{ closeCount }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const closeCount = ref(0);

const handleClose = () => {
	closeCount.value += 1;
};
</script>

<style scoped>
.demo-col {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.demo-note {
	margin: 0;
	font-size: 13px;
	color: var(--vp-c-text-2);
}
</style>
```
:::

## Service Usage

`WtNotificationService.open` creates a notification container under `body`, which is ideal for global toast messages.

:::demo
```vue
<template>
	<div class="demo-actions">
		<button class="demo-btn" @click="openSuccess">Success Notification</button>
		<button class="demo-btn" @click="openWarning">Warning Notification</button>
		<button class="demo-btn" @click="openAction">With Action Button</button>
	</div>
</template>

<script setup>
import { WtNotificationService } from '@lpcp/components/vue';

const openSuccess = () => {
	WtNotificationService.open({
		type: 'success',
		title: 'Saved Successfully',
		message: 'Your changes have been saved.',
		duration: 2500,
	});
};

const openWarning = () => {
	WtNotificationService.open({
		type: 'warning',
		title: 'Network Fluctuation',
		message: 'The connection is unstable, and some actions may be delayed.',
		duration: 3000,
	});
};

const openAction = () => {
	WtNotificationService.open({
		type: 'info',
		title: 'New Version Available',
		message: 'v2.3.0 has been released. You can review the changelog.',
		actionLabel: 'View Update',
		duration: 0,
		onActionClick: () => {
			window.alert('You clicked the action button');
		},
		onClose: () => {
			console.log('notification closed');
		},
	});
};
</script>

<style scoped>
.demo-actions {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.demo-btn {
	padding: 6px 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	background: var(--vp-c-bg);
	cursor: pointer;
	font-size: 13px;
}

.demo-btn:hover {
	background: var(--vp-c-bg-soft);
}
</style>
```
:::

## API

### Notification Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'primary' \| 'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Notification type. |
| `titleText` | `string` | - | Title text. |
| `message` | `string` | - | Main message text. |
| `actionLabel` | `string` | - | Action button label. |
| `isFullWidth` | `boolean` | `false` | Whether to fill the full width of the parent container. |
| `showClose` | `boolean` | `true` | Whether to show the close button. |

### Notification Events

| Event | Payload | Description |
|--------|----------|-------------|
| `wt-action` | `CustomEvent<any>` | Triggered when the action button is clicked. |
| `wt-close` | `CustomEvent<any>` | Triggered when the close button is clicked. |

### WtNotificationService.open(options)

| Field | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'primary' \| 'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Notification type. |
| `title` | `string` | `''` | Title text. |
| `message` | `string` | `''` | Main message text. Takes precedence over `text`. |
| `text` | `string` | `''` | Compatibility field for the main message text. |
| `actionLabel` | `string` | `''` | Action button label. Takes precedence over `actionText`. |
| `actionText` | `string` | `''` | Compatibility field for the action button label. |
| `showClose` | `boolean` | `true` | Whether to show the close button. |
| `duration` | `number` | `0` | Auto-close duration in milliseconds. `0` means it stays open. |
| `onActionClick` | `() => void` | - | Callback fired when the action button is clicked. |
| `onClose` | `() => void` | - | Callback fired when the notification closes. |

### WtNotificationHandle

| Field | Type | Description |
|------|------|-------------|
| `element` | `HTMLWtNotificationElement` | The current notification element instance. |
| `close` | `() => void` | Manually closes the current notification. |

## Recommendations

- For business scenarios, `success / info / warning / error` are the recommended semantic types.
- When using the service API, use a short `duration` for transient tips and `duration: 0` plus a close button for important operations.
- If you need to respond to user interaction, prefer `onActionClick` and `onClose` for unified tracking and state updates.
