<template>
  <article class="demo-card">
    <!-- Row 1 — Types -->
    <div class="flex-col" style="gap: 12px">
      <p style="margin: 0; font-size: 13px; color: #78909C">Types</p>
      <div style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap">
        <WtBadge value="5" type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="5" type="warning">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="5" type="primary">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="5" type="success">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="5" type="info">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
      </div>
    </div>

    <!-- Row 2 — Max value -->
    <div class="flex-col" style="gap: 12px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">Max value (max=99)</p>
      <div style="display: flex; align-items: center; gap: 32px">
        <WtBadge value="50" :max="99" type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="100" :max="99" type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="200" :max="99" type="warning">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
      </div>
    </div>

    <!-- Row 3 — Dot mode -->
    <div class="flex-col" style="gap: 12px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">Dot mode (is-dot)</p>
      <div style="display: flex; align-items: center; gap: 32px">
        <WtBadge is-dot type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge is-dot type="warning">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge is-dot type="success">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
      </div>
    </div>

    <!-- Row 4 — String value -->
    <div class="flex-col" style="gap: 12px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">String value</p>
      <div style="display: flex; align-items: center; gap: 32px">
        <WtBadge value="new" type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge value="hot" type="warning">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
      </div>
    </div>

    <!-- Row 5 — Hidden -->
    <div class="flex-col" style="gap: 12px; margin-top: 20px">
      <p style="margin: 0; font-size: 13px; color: #78909C">Hidden</p>
      <div style="display: flex; align-items: center; gap: 32px">
        <WtBadge value="5" hidden type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
        <WtBadge is-dot hidden type="danger">
          <div style="width: 40px; height: 40px; background: #f5f5f5; border-radius: 8px; border: 1px solid #e0e0e0" />
        </WtBadge>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { WtBadge } from '@mache-hangar/components/vue';
</script>
