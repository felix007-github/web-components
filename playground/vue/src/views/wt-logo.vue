<template>
  <article class="demo-card">
    <div class="flex-col">
      <WtLogo environment="dev"></WtLogo>
      <WtLogo environment="cert"></WtLogo>
      <WtLogo environment="prod"></WtLogo>
      <WtLogo environment="dev" text="Lexis+ CP"></WtLogo>
    </div>
  </article>
</template>
<script setup lang="ts">
import { WtLogo } from "@mache-hangar/components/vue";
</script>
