# Heat Bar

`wt-heat-bar` renders a heat-map style minimap on the side of long lists. It helps users quickly locate content areas and supports click-to-jump and dragging the current viewport window.

## Basic Usage

In `inner` mode, colored segments are rendered inside the heat bar, which is useful for marking content distribution inside a list.

:::demo
```vue
<template>
	<div class="heat-demo">
		<div class="heat-stage heat-stage1">
			<div class="heat-content hs1">
				<div v-for="item in items" :key="`a-${item}`" class="heat-item item-a">
					Group A · Item {{ item }}
				</div>
				<div v-for="item in items" :key="`b-${item}`" class="heat-item item-b">
					Group B · Item {{ item }}
				</div>
			</div>

			<WtHeatBar
        v-if="showHeatBar1"
        ref="vtHeatBarRef"
				direction="right"
				containerSelector=".hs1"
				:heatItemData="heatItemData"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, type ComponentPublicInstance } from "vue";
import { WtHeatBar, type WtHeatBarExpose } from "@mache-hangar/components/vue";

const showHeatBar1 = ref(false)

const items = Array.from({ length: 20 }, (_, i) => i + 1);

const heatItemData = [
	{
		targetSelector: '.item-a',
		color: '#667eea',
		mode: 'inner' as const,
		tooltip: 'Group A',
	},
	{
		targetSelector: '.item-b',
		color: '#22c55e',
		mode: 'inner' as const,
		tooltip: 'Group B',
	},
];

type WtHeatBarElement = HTMLElement & WtHeatBarExpose;
type WtHeatBarVueRef = ComponentPublicInstance & { $el: WtHeatBarElement };

const vtHeatBarRef = ref<WtHeatBarVueRef | null>(null);

onMounted(() => {
  showHeatBar1.value = true;
  nextTick(() => {
    window.setTimeout(() => {
      void vtHeatBarRef.value?.$el.mounted?.();
    }, 2000);
  });
});
onUnmounted(() => {
  void vtHeatBarRef.value?.$el.destroyed?.();
});
</script>

<style scoped>
.heat-stage {
	position: relative;
	border: 1px solid var(--vp-c-divider);
	border-radius: 10px;
	padding: 12px 80px 12px 12px;
	background: var(--vp-c-bg-soft);
}

.heat-content {
	height: 360px;
	overflow: auto;
	padding-right: 6px;
}

.heat-item {
	height: 44px;
	margin-bottom: 10px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	border: 1px solid var(--vp-c-divider);
}

.item-a {
	border-left: 3px solid #667eea;
}

.item-b {
	border-left: 3px solid #22c55e;
}

.heat-blink {
	animation: heatBlink 1s ease;
}

@keyframes heatBlink {
	0% { box-shadow: 0 0 0 0 rgba(66, 94, 242, 0.45); }
	100% { box-shadow: 0 0 0 8px rgba(66, 94, 242, 0); }
}
</style>
```
:::

## Outer Mode

In `outer` mode, clickable navigation labels are rendered outside the heat bar, which works well for chapter-style content navigation.

:::demo
```vue
<template>
	<div class="heat-demo">
		<div class="heat-stage heat-stage2">
			<div class="chapter-content hs2">
				<section v-for="chapter in chapters" :key="chapter.id" class="chapter">
					<h4 :class="`chapter-${chapter.id}`">{{ chapter.title }}</h4>
					<p v-for="n in 8" :key="`${chapter.id}-${n}`">{{ chapter.title }} / line {{ n }}</p>
				</section>
			</div>

			<WtHeatBar
        v-if="showHeatBar2"
        ref="vtHeatBarRef"
				direction="left"
				containerSelector=".hs2"
				:heatItemData="chapterHeatData"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, type ComponentPublicInstance } from "vue";
import { WtHeatBar, type WtHeatBarExpose } from "@mache-hangar/components/vue";

const showHeatBar2 = ref(false)

const chapters = [
	{ id: 'intro', title: 'Introduction' },
	{ id: 'usage', title: 'Usage' },
	{ id: 'advanced', title: 'Advanced' },
];

const chapterHeatData = [
	{
		targetSelector: '.chapter-intro',
		color: '#3b82f6',
		mode: 'outer' as const,
		tooltip: 'Introduction',
	},
	{
		targetSelector: '.chapter-usage',
		color: '#10b981',
		mode: 'outer' as const,
		tooltip: 'Usage',
	},
	{
		targetSelector: '.chapter-advanced',
		color: '#f97316',
		mode: 'outer' as const,
		tooltip: 'Advanced',
	},
];

type WtHeatBarElement = HTMLElement & WtHeatBarExpose;
type WtHeatBarVueRef = ComponentPublicInstance & { $el: WtHeatBarElement };

const vtHeatBarRef = ref<WtHeatBarVueRef | null>(null);

onMounted(() => {
  showHeatBar2.value = true;
  nextTick(() => {
    window.setTimeout(() => {
      void vtHeatBarRef.value?.$el.mounted?.();
    }, 1000);
  });
});
onUnmounted(() => {
  void vtHeatBarRef.value?.$el.destroyed?.();
});
</script>

<style scoped>
.heat-stage {
	position: relative;
	border: 1px solid var(--vp-c-divider);
	border-radius: 10px;
	padding: 12px 12px 12px 150px;
	background: var(--vp-c-bg-soft);
}

.chapter-content {
	height: 320px;
	overflow: auto;
	padding-right: 6px;
}

.chapter {
	margin-bottom: 24px;
}

h4 {
	margin: 0 0 8px 0;
}

p {
	margin: 0 0 6px 0;
	color: var(--vp-c-text-2);
}

</style>
```
:::


## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'left' \| 'right'` | `'left'` | Heat bar direction. Affects tooltip and outer navigation placement. |
| `containerSelector` | `string` | - | Selector for the scroll container. Must point to a scrollable element. |
| `heatItemData` | `HeatItemData[]` | `[]` | Configuration data for heat items. |
| `blinkClass` | `string` | - | Class name added to the target element during jump highlighting. |

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `mounted` | `() => Promise<void>` | Manually triggers initialization. Usually not needed. |
| `getHeatBarInstance` | `() => Promise<HeatBar>` | Returns the underlying `HeatBar` instance for advanced usage. |

### HeatItemData

| Field | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `targetSelector` | `string` | Yes | - | Selector for the target element. |
| `color` | `string` | Yes | - | Segment color. |
| `height` | `number` | No | Calculated from the target element | Height of the heat segment. |
| `tooltip` | `string` | No | Target element text | Tooltip text shown on hover. |
| `mode` | `'inner' \| 'outer'` | No | `'inner'` | `inner` for internal segments, `outer` for external navigation. |
| `fullWidth` | `boolean` | No | `false` | Whether to draw at full width. |

## Recommendations

- The element referenced by `containerSelector` should have a fixed height and `overflow: auto`.
- `targetSelector` should match stable nodes inside the container to avoid frequent teardown and recreation.
- Pass the class name itself to `blinkClass` (for example, `heat-blink`) without the `.` prefix.
