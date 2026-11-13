<template>
  <article class="demo-card" style="gap: 20px; display: flex; flex-direction: column">
    <!-- Row 1 — Horizontal / Variants -->
    <div style="gap: 12px; display: flex; flex-direction: column">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Horizontal — Variants (default / subdued / strong)
      </p>
      <WtDivider direction="horizontal" variant="default" />
      <WtDivider direction="horizontal" variant="subdued" />
      <WtDivider direction="horizontal" variant="strong" />
    </div>

    <!-- Row 2 — Dashed -->
    <div style="gap: 12px; display: flex; flex-direction: column">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Dashed style
      </p>
      <WtDivider
        direction="horizontal"
        border-style="dashed"
        variant="default"
      />
      <WtDivider
        direction="horizontal"
        border-style="dashed"
        variant="subdued"
      />
      <WtDivider
        direction="horizontal"
        border-style="dashed"
        variant="strong"
      />
    </div>

    <!-- Row 3 — Custom Color -->
    <div style="gap: 12px; display: flex; flex-direction: column">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Custom color
      </p>
      <WtDivider direction="horizontal" color="rgba(108, 133, 248, 1)" />
      <WtDivider
        direction="horizontal"
        color="rgba(75, 171, 82, 1)"
        border-style="dashed"
      />
      <WtDivider
        direction="horizontal"
        color="rgba(232, 23, 31, 1)"
        border-width="2px"
      />
    </div>

    <!-- Row 4 — Custom Width -->
    <div style="gap: 12px; display: flex; flex-direction: column">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Custom width
      </p>
      <WtDivider direction="horizontal" border-width="1px" variant="strong" />
      <WtDivider direction="horizontal" border-width="2px" variant="strong" />
      <WtDivider direction="horizontal" border-width="4px" variant="strong" />
    </div>

    <!-- Row 5 — Vertical -->
    <div style="gap: 12px; display: flex; flex-direction: column">
      <p style="margin: 0; font-size: 13px; color: #78909C">
        Vertical
      </p>
      <div style="display: flex; align-items: center; height: 32px">
        <span style="font-size: 13px">Text A</span>
        <WtDivider direction="vertical" variant="default" />
        <span style="font-size: 13px">Text B</span>
        <WtDivider direction="vertical" variant="subdued" />
        <span style="font-size: 13px">Text C</span>
        <WtDivider direction="vertical" variant="strong" />
        <span style="font-size: 13px">Text D</span>
        <WtDivider
          direction="vertical"
          border-style="dashed"
          color="rgba(108, 133, 248, 1)"
        />
        <span style="font-size: 13px">Text E</span>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { WtDivider } from '@lpcp/components/vue';
</script>
