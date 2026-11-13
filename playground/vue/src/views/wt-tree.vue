<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtTree :tree="treeData"></WtTree>
    </div>
    <div class="flex-col" style="margin-top: 20px">
      <WtTree :tree="treeData1"></WtTree>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { WtTree, WtTreeNode } from "@mache-hangar/components/vue";

const treeData = ref<WtTreeNode[]>([
  {
    id: "node1",
    title: "Node 1",
    value: "node1",
    expanded: true,
    childs: [
      { id: "node1-1", title: "Node 1-1", value: "node1-1", childs: [] },
      { id: "node1-2", title: "Node 1-2", value: "node1-2", childs: [] },
    ],
  },
  {
    id: "node2",
    title: "Node 2",
    value: "node2",
    expanded: true,
    childs: [
      { id: "node2-1", title: "Node 2-1", value: "node2-1", childs: [] },
      { id: "node2-2", title: "Node 2-2", value: "node2-2", childs: [] },
    ],
  },
]);
const treeData1 = ref<WtTreeNode[]>([
  {
    id: "node1",
    title: "Node 1",
    value: "node1",
    expanded: true,
    childs: [
      { id: "node1-1", title: "Node 1-1", value: "node1-1", childs: [] },
      { id: "node1-2", title: "Node 1-2", value: "node1-2", expanded: true, childs: [
        { id: "node1-2-1", title: "Node 1-2-1", value: "node1-2-1", expanded: true, childs: [
          { id: "node1-2-1-1", title: "Node 1-2-1-1", value: "node1-2-1-1", childs: [] },
          { id: "node1-2-1-2", title: "Node 1-2-1-2", value: "node1-2-1-2", childs: [] },
        ] },
        { id: "node1-2-2", title: "Node 1-2-2", value: "node1-2-2", childs: [] },
      ] },
    ],
  },
  {
    id: "node2",
    title: "Node 2",
    value: "node2",
    expanded: true,
    childs: [
      { id: "node2-1", title: "Node 2-1", value: "node2-1", expanded: true, childs: [
        { id: "node2-1-1", title: "Node 2-1-1", value: "node2-1-1", childs: [] },
        { id: "node2-1-2", title: "Node 2-1-2", value: "node2-1-2", expanded: true, childs: [
          { id: "node2-1-2-1", title: "Node 2-1-2-1", value: "node2-1-2-1", childs: [] },
          { id: "node2-1-2-2", title: "Node 2-1-2-2", value: "node2-1-2-2", childs: [] },
        ] },
      ] },
      { id: "node2-2", title: "Node 2-2", value: "node2-2", childs: [] },
    ],
  },
  {
    id: "node3",
    title: "Node 3",
    value: "node3",
    expanded: true,
    childs: [
      { id: "node3-1", title: "Node 3-1", value: "node3-1", childs: [] },
      { id: "node3-2", title: "Node 3-2", value: "node3-2", childs: [] },
    ],
  }
]);
</script>
