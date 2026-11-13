<template>
  <article class="demo-card" style="gap: 18px; display: flex; flex-direction: column">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">三种字号</p>
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <WtLink size="small">Small Link</WtLink>
        <WtLink size="medium">Medium Link</WtLink>
        <WtLink size="large">Large Link</WtLink>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">下划线 / 无下划线</p>
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <WtLink underline>Underline Link</WtLink>
        <WtLink>No Underline Link</WtLink>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">可用 / 不可用</p>
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <WtLink href="https://example.com" target="_blank">Available Link</WtLink>
        <WtLink disabled underline>Disabled Link</WtLink>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">自定义颜色</p>
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
        <WtLink color="rgba(0, 122, 204, 1)">Blue Link</WtLink>
        <WtLink color="rgba(2, 136, 99, 1)" underline>Green Link</WtLink>
        <WtLink color="rgba(216, 27, 96, 1)">Pink Link</WtLink>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { WtLink } from '@mache-hangar/components/vue';
</script>
