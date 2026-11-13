<template>
  <article class="demo-card">
    <!-- Row 1 — Normal size -->
    <div class="flex-col" style="gap: 16px">
      <p style="margin: 0; font-size: 13px; color: #78909c">Normal size222</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtSwitch v-model="value1" />
        <WtSwitch v-model="value2" />
      </div>
    </div>

    <!-- Row 2 — Small size -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909c">Small size</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtSwitch
          size="small"
          :model-value="value3"
          @update:model-value="value3 = $event.detail"
        />
        <WtSwitch
          size="small"
          :model-value="value4"
          @update:model-value="value4 = $event.detail"
        />
      </div>
    </div>

    <!-- Row 3 — Disabled -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909c">Disabled</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtSwitch disabled />
        <WtSwitch disabled />
        <WtSwitch size="small" disabled />
        <WtSwitch size="small" disabled />
      </div>
    </div>

    <div class="echo-panel" style="margin-top: 16px">
      <span class="status-label">Switch 1: </span>
      <strong>{{ value1 ? "ON" : "OFF" }}</strong>
      <span class="status-label" style="margin-left: 16px"> Switch 2: </span>
      <strong>{{ value2 ? "ON" : "OFF" }}</strong>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { WtSwitch } from "@mache-hangar/components/vue";

const value1 = ref(false);
const value2 = ref(true);
const value3 = ref(false);
const value4 = ref(true);
</script>
