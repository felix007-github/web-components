<template>
  <article class="demo-card">
    <!-- Row 1 — Basic radio group -->
    <div class="flex-col" style="gap: 16px">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Basic radio group (Medium size)
      </p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio
          name="basic-group"
          value="option1"
          v-model="selectedValue"
        />
        <WtRadio
          name="basic-group"
          value="option2"
          v-model="selectedValue"
        />
        <WtRadio
          name="basic-group"
          value="option3"
          v-model="selectedValue"
        />
      </div>
    </div>

    <!-- Row 2 — Size variations -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">size</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio
          size="small"
          name="small-group"
          value="small1"
          v-model="selectedSize"
        />
        <WtRadio
          size="medium"
          name="small-group"
          value="medium"
          v-model="selectedSize"
        />
        <WtRadio
          size="large"
          name="large-group"
          value="large2"
          v-model="selectedSize"
        />
      </div>
    </div>

    <!-- Row 3 — Disabled state -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Disabled state
      </p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio
          disabled
          name="disabled-group"
          value="disabled1"
          :model-value="disabledValue"
        />
        <WtRadio
          disabled
          name="disabled-group"
          value="disabled2"
          :model-value="disabledValue"
        />
        <WtRadio
          disabled
          name="disabled-group"
          value="disabled3"
          :model-value="disabledValue"
        />
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { WtRadio } from '@mache-hangar/components/vue';

const selectedValue = ref('option1');
const selectedSize = ref('medium');
const disabledValue = ref('enabled');
</script>
