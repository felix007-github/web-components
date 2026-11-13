<template>
  <article class="demo-card">
    <div class="button-stack">
      <WtButton size="large" @click-btn="handleButtonClick">
        <wt-icon name="add" slot="before" />
        Primary action
      </WtButton>
      <WtButton size="medium" plain>
        Primary action
      </WtButton>
      <WtButton size="small" plain>
        Primary action
      </WtButton>
      <WtButton size="min" type="dark">
        Dark action
      </WtButton>
      <WtButton type="dark" plain>
        Secondary action
      </WtButton>
      <WtButton disabled>Disabled action</WtButton>
      <WtTooltip :trigger="'hover'" content="Tooltip content">
        <WtButton>Hover me</WtButton>
      </WtTooltip>
      <WtTooltip :trigger="'click'" content="Tooltip content">
        <WtButton>click me</WtButton>
      </WtTooltip>
    </div>
    <div class="echo-panel">
        <span class="status-label">Last button event: </span>
        <strong>{{ lastButtonClick }}</strong>
      </div>
  </article>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { WtButton, WtIcon, WtTooltip, type WtButtonCustomEvent } from "@mache-hangar/components/vue";

const lastButtonClick = ref('Not fired yet');
const handleButtonClick = (event: WtButtonCustomEvent<{ time: Date }>) => {
  const clickedAt = new Date(event.detail.time);
  lastButtonClick.value = clickedAt.toLocaleTimeString('en-US', { hour12: false });
};

</script>