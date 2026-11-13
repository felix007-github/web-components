# Scrollbar

Used to replace the browser's native scrollbar and provide a more consistent, polished scrolling experience.

## Basic Usage

Wrap the scrollable area with `WtScrollbar`. By default, the scrollbar appears only when the mouse hovers over it.

:::demo

```vue
<template>
  <div style="height: 200px; border: 1px solid var(--wt-color-gray-200);">
    <wt-scrollbar>
      <div style="padding: 20px;">
        <p v-for="i in 10" :key="i" style="padding: 10px 0; border-bottom: 1px solid var(--wt-color-gray-100);">
          Scrollable item {{ i }}
        </p>
      </div>
    </wt-scrollbar>
  </div>
</template>
```

:::

## Horizontal Scrolling

When the content width exceeds the container width, a horizontal scrollbar is shown automatically.

:::demo

```vue
<template>
  <div style="border: 1px solid var(--wt-color-gray-200);">
    <wt-scrollbar>
      <div style="display: flex; width: 1200px; padding: 20px;">
        <div v-for="i in 10" :key="i" :style="{ minWidth: '150px', padding: '10px', background: i % 2 === 0 ? 'var(--wt-color-gray-100)' : 'var(--wt-color-gray-50)', textAlign: 'center' }">
          Item {{ i }}
        </div>
      </div>
    </wt-scrollbar>
  </div>
</template>
```

:::

## Sizes

Three sizes are supported: `small` (2px), `medium` (4px, default), and `large` (6px).

:::demo

```vue
<template>
  <div style="display: flex; gap: 20px; text-align: center;">
    <div style="height: 150px; flex: 1; border: 1px solid var(--wt-color-gray-200);">
      <wt-scrollbar size="small">
        <div style="height: 300px; padding: 10px;">Small</div>
      </wt-scrollbar>
    </div>
    <div style="height: 150px; flex: 1; border: 1px solid var(--wt-color-gray-200);">
      <wt-scrollbar size="medium">
        <div style="height: 300px; padding: 10px;">Medium</div>
      </wt-scrollbar>
    </div>
    <div style="height: 150px; flex: 1; border: 1px solid var(--wt-color-gray-200);">
      <wt-scrollbar size="large">
        <div style="height: 300px; padding: 10px;">Large</div>
      </wt-scrollbar>
    </div>
  </div>
</template>
```

:::

## Always Visible

Set the `always` prop to keep the scrollbar visible instead of depending on hover.

:::demo

```vue
<template>
  <div style="height: 200px; border: 1px solid var(--wt-color-gray-200);">
    <wt-scrollbar always>
      <div style="padding: 20px;">
        <p v-for="i in 10" :key="i" style="padding: 10px 0; border-bottom: 1px solid var(--wt-color-gray-100);">
          Always visible item {{ i }}
        </p>
      </div>
    </wt-scrollbar>
  </div>
</template>
```

:::

## API

### Props

| Prop | Description | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- |
| size | Scrollbar width size | string | `small` / `medium` / `large` | `medium` |
| always | Always show the scrollbar | boolean | — | `false` |

### Events

| Event | Description | Payload |
| --- | --- | --- |
| wt-scroll | Triggered when scrolling occurs | `{ scrollTop: number, scrollLeft: number, originalEvent: Event }` |

### Methods

| Method | Description | Parameters | Return |
| --- | --- | --- | --- |
| `wtScrollTo` | Scrolls to the specified position. Accepts an options object with optional `left` and `top` values (in pixels). | `options: { left?: number; top?: number }` | `Promise<void>` |
| `wtSetScrollTop` | Sets the vertical scroll position to the given pixel value. | `top: number` | `Promise<void>` |
| `wtSetScrollLeft` | Sets the horizontal scroll position to the given pixel value. | `left: number` | `Promise<void>` |
| `wtWrapRef` | Returns a reference to the inner scroll container element, allowing direct access to its properties and methods. | — | `Promise<HTMLDivElement \| null>` |

## Programmatic Scrolling

In Vue, the ref points to the Vue wrapper instance. Access the underlying custom element via `$el`, then call exposed methods.

:::demo

```vue
<template>
  <div>
    <div style="margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
      <button @click="scrollToTop">Scroll to Top</button>
      <button @click="scrollToBottom">Scroll to Bottom</button>
      <button @click="scrollToPos">Scroll to 200px</button>
      <button @click="scrollHorizontal">Scroll Right 300px</button>
    </div>
    <div style="height: 200px; border: 1px solid var(--wt-color-gray-200);">
      <wt-scrollbar ref="scrollbarRef">
        <div style="width: 1200px; padding: 20px;">
          <p v-for="i in 20" :key="i" style="padding: 8px 0; border-bottom: 1px solid var(--wt-color-gray-100); white-space: nowrap;">
            Item {{ i }} — long content that extends horizontally for demo purposes
          </p>
        </div>
      </wt-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const scrollbarRef = ref(null);
const getScrollbarEl = () => scrollbarRef.value?.$el;

const scrollToTop = async () => {
  await getScrollbarEl()?.wtSetScrollTop(0);
};

const scrollToBottom = async () => {
  const scrollbarEl = getScrollbarEl();
  const wrap = await scrollbarEl?.wtWrapRef();
  if (wrap) {
    await scrollbarEl?.wtSetScrollTop(wrap.scrollHeight);
  }
};

const scrollToPos = async () => {
  await getScrollbarEl()?.wtScrollTo({ top: 200 });
};

const scrollHorizontal = async () => {
  await getScrollbarEl()?.wtSetScrollLeft(300);
};
</script>
```

:::

