# Components

WT UI provides a flexible and easy-to-use collection of Web Components with support for modern frontend frameworks such as Vue and React.

## Component List

### Button

A versatile button component with multiple types, sizes, and states.

- **Types**: primary, dark
- **Sizes**: min, small, medium, large
- **States**: normal, plain, disabled
- **Events**: click-btn

[View Button Docs →](/components/button.md)

### Link

A lightweight text link component with configurable font size, underline, disabled state, and custom color.

- **Sizes**: small, medium, large
- **Underline**: `underline` toggle
- **States**: normal, disabled (`opacity: 0.24`)
- **Interaction**: removes underline on hover and shows a 2px border

[View Link Docs →](/components/link.md)

### Search

A search input component that includes an input field, clear icon, and search button.

- **Sizes**: small (36px), medium (40px), large (56px)
- **Clear**: `clearable` toggle, shows a clear icon when content exists
- **States**: normal, disabled
- **Events**: wt-input, wt-clear, wt-search, updateModelValue
- **Features**: supports two-way binding with `v-model` and custom width

[View Search Docs →](/components/search.md)

### Scrollbar

A scrollbar component that enhances the native browser scrollbar.

- **Sizes**: small, medium, large
- **Mode**: supports always-visible mode with `always`
- **Events**: scroll

[View Scrollbar Docs →](/components/scrollbar.md)

### Input

A flexible input component with multiple input types and validation states.

- **Types**: text, password
- **Sizes**: min, small, medium, large
- **States**: normal, error, disabled
- **Events**: wt-focus, wt-input, updateModelValue
- **Features**: `v-model` support

[View Input Docs →](/components/input.md)

### Icon

A scalable SVG icon component with support for 260+ Material Design icons.

- **Sizes**: flexible sizing with px values or CSS lengths
- **Colors**: supports custom colors
- **Effects**: rotate, spin
- **Count**: 260+ icon set

[View Icon Docs →](/components/icon.md)

### Avatar

Displays user avatars with support for text avatars, image avatars, and avatar groups.

- **Types**: single avatar, avatar group
- **Shapes**: circle, square
- **Sizes**: small, medium, large
- **Features**: `max` visible count and overflow display as `+N`

[View Avatar Docs →](/components/avatar.md)

### Tag

Used to display status, categories, and short informational hints.

- **Types**: primary, success, warning, info, error
- **Styles**: solid, outlined
- **Features**: lightweight status markers and list status mapping

[View Tag Docs →](/components/tag.md)

### Loading

Displays loading states during async requests or computations.

- **Sizes**: small, medium, large, number(px)
- **Text**: customizable with `text`
- **Display control**: supports hiding text with `showText`

[View Loading Docs →](/components/loading.md)

### Checkbox

Used to select one or more options, with support for indeterminate state and custom bound values.

- **Sizes**: small, medium, large
- **States**: checked, disabled, indeterminate
- **Features**: supports `trueValue` / `falseValue` value mapping
- **Events**: wt-change, updateModelValue

[View Checkbox Docs →](/components/checkbox.md)

### Switch

A switch component for toggling between two mutually exclusive states.

- **Sizes**: small, medium, large
- **States**: on / off, disabled
- **Features**: keyboard accessible with Enter/Space
- **Events**: wt-change, updateModelValue

[View Switch Docs →](/components/switch.md)

### Radio

A radio component for selecting a single value from multiple mutually exclusive options.

- **Sizes**: small (14px), medium (16px), large (18px)
- **States**: checked, unchecked, disabled
- **Features**: keyboard accessible with Enter/Space and supports grouping by `name`
- **Events**: wt-change, updateModelValue
- **Style**: 2px border with a filled dot when selected

[View Radio Docs →](/components/radio.md)

### Badge

Used to display message counts, status dots, or lightweight reminders.

- **Types**: primary, success, warning, danger, info
- **Modes**: number, text, dot
- **Features**: supports `max` and `hidden`

[View Badge Docs →](/components/badge.md)

### Avatar Group

Used to display multiple user avatars with a maximum visible count and overflow indicator.

- **List mode**: pass avatar data through the `list` prop
- **Maximum visible count**: controlled by `max`, extra items are shown as `+N`
- **Sizes**: small, medium, large
- **Shapes**: circle, square
- **Features**: supports both slot mode and avatar grouping

[View Avatar Group Docs →](/components/avatar-group.md)

### Logo

A brand logo component used to display different logos for different environments.

- **Environments**: prod, dev, cert
- **Sizes**: supports custom px values
- **Text**: customizable or hideable
- **Features**: adapts the logo based on environment

[View Logo Docs →](/components/logo.md)

### Modal

A dialog component for displaying important information or handling user interactions above the main content.

- **Title**: customizable title text
- **Position**: configurable distance from the top
- **Overlay**: supports showing or hiding the background mask
- **Close button**: supports showing or hiding the close icon
- **Events**: wt-open-change, updateModelValue

[View Modal Docs →](/components/modal.md)

### Progress

A progress component for showing task completion.

- **Shapes**: line, circle
- **Types**: primary, success, error
- **Label**: customizable progress label text
- **Percentage**: supports any value from 0 to 100
- **Animation**: smooth transition animation

[View Progress Docs →](/components/progress.md)

### Tab Bar

A tab bar component for switching between multiple content panels.

- **Tab list**: configured through the `list` prop
- **Active state**: `activeValue` controls the current active tab
- **Value binding**: each tab item contains `label` and `value`
- **Events**: supports selection event listeners
- **Responsive**: supports dynamically updating the tab list

[View Tab Bar Docs →](/components/tab-bar.md)

### Divider

A divider component for separating content horizontally or vertically.

- **Direction**: horizontal, vertical
- **Styles**: solid, dashed
- **Variants**: default, subdued, strong
- **Features**: supports custom color and width

[View Divider Docs →](/components/divider.md)

## Quick Start

### Installation

```bash
npm install @mache-hangar/components
# or
pnpm add @mache-hangar/components
```

### Using With Vue 3

```vue
<template>
  <div>
    <wt-button type="primary">Click me</wt-button>
    <wt-input v-model="value" placeholder="Type here..." />
    <wt-icon name="add" size="24" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { WtButton, WtInput, WtIcon } from '@mache-hangar/components/vue'

const value = ref('')
</script>
```

### Using With React

```jsx
import { WtButton, WtInput, WtIcon } from '@mache-hangar/components/react'

export function App() {
  const [value, setValue] = useState('')
  
  return (
    <div>
      <WtButton type="primary">Click me</WtButton>
      <WtInput value={value} onChange={(e) => setValue(e.target.value)} />
      <WtIcon name="add" size="24" />
    </div>
  )
}
```

### Native HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@mache-hangar/components@latest/dist/lpcp-components/lpcp-components.css">
</head>
<body>
  <wt-button type="primary">Click me</wt-button>
  <wt-input placeholder="Type here..."></wt-input>
  <wt-icon name="add" size="24"></wt-icon>

  <script crossorigin src="https://unpkg.com/@mache-hangar/components@latest/dist/lpcp-components.esm.js"></script>
</body>
</html>
```

## Design Tokens

The component library uses a complete design token system with support for CSS variable customization.

### Colors

- **Primary**: `--wt-color-primary: #425ef2`
- **Gray**: `--wt-color-gray-50` to `--wt-color-gray-900`
- **Success**: `--wt-color-green-*`
- **Warning**: `--wt-color-yellow-*`
- **Error**: `--wt-color-red-*`

### Spacing

- `--wt-space-1` to `--wt-space-64` (4px to 256px)

### Borders

- `--wt-radius-sm` to `--wt-radius-full`

### Typography

- `--wt-font-size-xs` to `--wt-font-size-6xl`
- `--wt-font-weight-thin` to `--wt-font-weight-black`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
