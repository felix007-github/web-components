<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtProgress :percentage="0"></WtProgress>
      <WtProgress :percentage="50"></WtProgress>
      <WtProgress :percentage="100"></WtProgress>
      <WtProgress :percentage="60" type="error"></WtProgress>
      <WtProgress :percentage="100" type="success"></WtProgress>
    </div>
    <div style="margin-top: 10px" class="flex-col">
      <WtProgress :percentage="0" shape="circle"></WtProgress>
      <WtProgress :percentage="50" shape="circle"></WtProgress>
      <WtProgress :percentage="100" shape="circle"></WtProgress>
      <WtProgress :percentage="60" shape="circle" type="error"></WtProgress>
      <WtProgress :percentage="100" shape="circle" type="success"></WtProgress>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { WtProgress } from '@mache-hangar/components/vue';
</script>
