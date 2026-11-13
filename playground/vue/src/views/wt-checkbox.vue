<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtCheckbox v-model="checkedValue" label="Receive product updates" />
      <WtCheckbox label="Marketing emails" />
      <WtCheckbox label="Partially selected" indeterminate />
      <WtCheckbox label="Disabled option" disabled checked />
    </div>

    <div class="echo-panel">
      <span class="status-label">Vue state mirror</span>
      <code>{{ checkedValue ? 'Checked' : 'Unchecked' }}</code>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { WtCheckbox } from '@lpcp/components/vue';

const checkedValue = ref(true);
</script>