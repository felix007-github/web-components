<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtTabBar :list="tabList" activeValue="tab1"></WtTabBar>
      <WtTabBar :list="tabList2" activeValue="tab1-1"></WtTabBar>
      <WtTabBar :list="tabList3" activeValue="tab1-2"></WtTabBar>
    </div>
    <div class="flex-col" style="margin-top: 20px">
      <WtTabBar :list="tabList4" activeValue="tab1"></WtTabBar>
      <WtTabBar :list="tabList5" activeValue="tab1-1"></WtTabBar>
      <WtTabBar :list="tabList6" activeValue="tab1-2"></WtTabBar>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { WtTabBar } from "@mache-hangar/components/vue";

const tabList = ref([
  { label: "Tab 1", value: "tab1" },
  { label: "Tab 2", value: "tab2" },
]);

const tabList2 = ref([
  { label: "Tab 1-1", value: "tab1-1" },
  { label: "Tab 2-1", value: "tab2-1" },
  { label: "Tab 3-1", value: "tab3-1" },
]);

const tabList3 = ref([
  { label: "Tab 1-2", value: "tab1-2" },
  { label: "Tab 2-2", value: "tab2-2" },
  { label: "Tab 3-2", value: "tab3-2" },
  { label: "Tab 4-2", value: "tab4-2" },
]);

const tabList4 = ref([
  { label: "this is a very long tab label", value: "tab1" },
  { label: "Tab 2", value: "tab2" },
]);
const tabList5 = ref([
  { label: "Tab 1-1", value: "tab1-1" },
  { label: "Tab 2-1", value: "tab2-1" },
  { label: "Tab 3-1", value: "tab3-1" },
]);
const tabList6 = ref([
  { label: "Tab 1-2", value: "tab1-2" },
  { label: "Tab 2-2", value: "tab2-2" },
  { label: "Tab 3-2", value: "tab3-2" },
  { label: "Tab 4-2", value: "tab4-2" },
]);
</script>
