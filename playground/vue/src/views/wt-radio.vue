<template>
  <article class="demo-card">
    <!-- Row 1 — Basic radio group -->
    <div class="flex-col" style="gap: 16px">
      <p style="margin: 0; font-size: 13px; color: #78909c">Basic radio group (Medium size)</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio v-model="selectedValue" name="basic-group" value="option1" />
        <WtRadio v-model="selectedValue" name="basic-group" value="option2" />
        <WtRadio v-model="selectedValue" name="basic-group" value="option3" />
      </div>
    </div>

    <!-- Row 2 — Size variations -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909c">size</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio v-model="selectedSize" size="small" name="small-group" value="small1" />
        <WtRadio v-model="selectedSize" size="medium" name="small-group" value="medium" />
        <WtRadio v-model="selectedSize" size="large" name="large-group" value="large2" />
      </div>
    </div>

    <!-- Row 3 — Disabled state -->
    <div class="flex-col" style="gap: 16px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909c">Disabled state</p>
      <div style="display: flex; align-items: center; gap: 24px">
        <WtRadio disabled name="disabled-group" value="disabled1" :model-value="disabledValue" />
        <WtRadio disabled name="disabled-group" value="disabled2" :model-value="disabledValue" />
        <WtRadio disabled name="disabled-group" value="disabled3" :model-value="disabledValue" />
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
