# Tab Bar

`wt-tab-bar` is a tab bar component used to switch between multiple content panels. It supports custom tab lists and active states.

## Basic Usage

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-tab-bar 
      :list="[
        { label: 'Tab 1', value: 'tab1' },
        { label: 'Tab 2', value: 'tab2' },
        { label: 'Tab 3', value: 'tab3' }
      ]"
      activeValue="tab1"
    ></wt-tab-bar>
    <div class="content">
      <p>Select a tab above to switch content</p>
    </div>
  </div>
</template>

<script setup>
import { WtTabBar } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.content p {
  margin: 0;
  color: #666;
}
</style>
```
:::

## Multiple Tabs

Supports any number of tab items.

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-tab-bar 
      :list="tabList"
      :activeValue="activeTab"
      @wt-tab-change="activeTab = $event.detail"
    ></wt-tab-bar>
    <div class="content">
      <h4>{{ getTabLabel(activeTab) }}</h4>
      <p>{{ getTabContent(activeTab) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtTabBar } from '@mache-hangar/components/vue';

const activeTab = ref('home');
const tabList = [
  { label: 'Home', value: 'home' },
  { label: 'Docs', value: 'docs' },
  { label: 'Examples', value: 'examples' },
  { label: 'About', value: 'about' }
];

const getTabLabel = (value) => {
  return tabList.find(item => item.value === value)?.label || '';
};

const getTabContent = (value) => {
  const contents = {
    home: 'This is the home tab content',
    docs: 'This is the documentation tab content',
    examples: 'This is the examples tab content',
    about: 'This is the about tab content'
  };
  return contents[value] || '';
};
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.content h4 {
  margin: 0 0 8px 0;
}

.content p {
  margin: 0;
  color: #666;
}
</style>
```
:::

## Reactive Tabs

You can implement reactive tab switching by dynamically updating the `list` prop.

:::demo
```vue
<template>
  <div class="demo-column">
    <div class="controls">
      <wt-button @click="mode = 'basic'">Basic Tabs</wt-button>
      <wt-button @click="mode = 'advanced'">Advanced Tabs</wt-button>
    </div>
    <wt-tab-bar 
      :list="currentTabs"
      :activeValue="activeValue"
    ></wt-tab-bar>
    <div class="content">
      <p>Current Mode: {{ mode }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { WtTabBar, WtButton } from '@mache-hangar/components/vue';

const mode = ref('basic');
const activeValue = ref('tab1');

const basicTabs = [
  { label: 'Tab 1', value: 'tab1' },
  { label: 'Tab 2', value: 'tab2' }
];

const advancedTabs = [
  { label: 'Advanced 1', value: 'tab1' },
  { label: 'Advanced 2', value: 'tab2' },
  { label: 'Advanced 3', value: 'tab3' },
  { label: 'Advanced 4', value: 'tab4' }
];

const currentTabs = computed(() => {
  return mode.value === 'basic' ? basicTabs : advancedTabs;
});
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.controls {
  display: flex;
  gap: 8px;
}

.content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.content p {
  margin: 0;
  color: #666;
}
</style>
```
:::

## Disabled State

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-tab-bar 
      :list="[
        { label: 'Enabled', value: 'enabled', disabled: false },
        { label: 'Disabled', value: 'disabled', disabled: true },
        { label: 'Enabled', value: 'enabled2', disabled: false }
      ]"
      activeValue="enabled"
    ></wt-tab-bar>
    <div class="content">
      <p>The middle tab item is disabled</p>
    </div>
  </div>
</template>

<script setup>
import { WtTabBar } from '@mache-hangar/components/vue';
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.content p {
  margin: 0;
  color: #666;
}
</style>
```
:::

## Complete Example

:::demo
```vue
<template>
  <div class="demo-column">
    <wt-tab-bar 
      :list="tabs"
      :activeValue="currentTab"
    ></wt-tab-bar>
    <div class="panel">
      <div class="panel-header">
        <h3>{{ getCurrentTabLabel() }}</h3>
      </div>
      <div class="panel-body">
        <div v-if="currentTab === 'profile'" class="panel-content">
          <p>User Profile Page</p>
          <ul>
            <li>Username: John Doe</li>
            <li>Email: john@example.com</li>
            <li>Joined: 2024</li>
          </ul>
        </div>
        <div v-if="currentTab === 'settings'" class="panel-content">
          <p>Settings Page</p>
          <ul>
            <li>Language settings</li>
            <li>Theme settings</li>
            <li>Privacy settings</li>
          </ul>
        </div>
        <div v-if="currentTab === 'notifications'" class="panel-content">
          <p>Notifications Page</p>
          <ul>
            <li>Email notifications</li>
            <li>System notifications</li>
            <li>Push notifications</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WtTabBar } from '@mache-hangar/components/vue';

const currentTab = ref('profile');
const tabs = [
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Notifications', value: 'notifications' }
];

const getCurrentTabLabel = () => {
  return tabs.find(t => t.value === currentTab.value)?.label || '';
};
</script>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.panel-body {
  padding: 16px;
}

.panel-content ul {
  margin: 0;
  padding-left: 20px;
}

.panel-content li {
  margin: 8px 0;
  color: #666;
}

.panel-content p {
  margin: 0 0 8px 0;
  color: #333;
}
</style>
```
:::
