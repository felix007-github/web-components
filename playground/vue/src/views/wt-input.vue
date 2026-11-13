<template>
  <article class="demo-card">
    <WtInput v-model="inputValue" placeholder="Stencil + Vue" size="medium">
      <WtIcon slot="after" name="search" />
    </WtInput>

    <div class="echo-panel">
      <span class="status-label">Vue state mirror</span>
      <code>{{ inputValue || 'Empty' }}</code>
    </div>
  </article>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { WtInput, WtIcon } from "@lpcp/components/vue";
const inputValue = ref('');
</script>