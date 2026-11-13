<template>
  <article class="demo-card">
    <WtLoading :size="60"></WtLoading>
    <WtLoading size="large"></WtLoading>
    <WtLoading size="medium"></WtLoading>
    <WtLoading size="small"></WtLoading>
    <WtLoading text="Loading text"></WtLoading>
  </article>
</template>
<script lang="ts" setup>
import { WtLoading } from "@lpcp/components/vue";
</script>