<template>
  <article class="demo-card">
    <p class="icon-total">Total: {{iconList.length}}</p>
    <div class="icon-grid">
      <div v-for="iconName in iconList" class="icon-item" :key="iconName">
        <WtIcon :name="iconName" size="20" />
        <span class="icon-name">{{iconName}}</span>
      </div>
    </div>
  </article>
</template>
<script lang="ts" setup>
import { icons } from "@mache-hangar/icons";
import { WtIcon } from "@mache-hangar/components/vue";
const iconList = [...icons].filter(Boolean).sort((a, b) => a.localeCompare(b));
</script>
<style scoped lang="scss">
@use "./scss/wt-icon.scss" as *;
</style>