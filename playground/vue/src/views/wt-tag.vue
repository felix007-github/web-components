<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtTag type="primary">primary</WtTag>
      <WtTag type="success">success</WtTag>
      <WtTag type="warning">warning</WtTag>
      <WtTag type="info">info</WtTag>
      <WtTag type="error">error</WtTag>
    </div>
    <div style="margin-top: 20px" class="flex-col">
      <WtTag variant="outlined" type="primary">primary</WtTag>
      <WtTag variant="outlined" type="success">success</WtTag>
      <WtTag variant="outlined" type="warning">warning</WtTag>
      <WtTag variant="outlined" type="info">info</WtTag>
      <WtTag variant="outlined" type="error">error</WtTag>
    </div>
    <div style="margin-top: 20px" class="flex-col">
      <WtTag variant="solid" type="primary">primary</WtTag>
      <WtTag variant="solid" type="success">success</WtTag>
      <WtTag variant="solid" type="warning">warning</WtTag>
      <WtTag variant="solid" type="info">info</WtTag>
      <WtTag variant="solid" type="error">error</WtTag>
    </div>
  </article>
</template>
<script setup lang="ts">
import { WtTag } from "@mache-hangar/components/vue";
</script>