<template>
  <article class="demo-card">
    <div class="heat-bar-out">
      <div class="heat-stage">
        <div class="heat-content-box">
          <div
            v-for="item in contentList"
            :key="`a-${item}`"
            class="content-box__item item1"
          >
            <p>Group A · Content Item {{ item }}</p>
          </div>

          <div
            v-for="item in contentList"
            :key="`b-${item}`"
            class="content-box__item item2"
          >
            <p>Group B · Content Item {{ item }}</p>
          </div>
        </div>

        <WtHeatBar
          v-if="showHeatBar"
          ref="WtHeatBarRef"
          direction="right"
          containerSelector=".heat-content-box"
          :heatItemData="heatItemData"
          blinkClass=".heat-content-box"
        />
      </div>
    </div>
  </article>
</template>
<script lang="ts" setup>
import { ref, onMounted, nextTick, onUnmounted, type ComponentPublicInstance } from "vue";
import { WtHeatBar, type WtHeatBarExpose } from "@lpcp/components/vue";
const showHeatBar = ref(false);
const heatItemData = ref([
  {
    targetSelector: ".item1",
    color: "#667eea",
    mode: "inner" as const,
  },
  {
    targetSelector: ".item2",
    color: "#764ba2",
    mode: "inner" as const,
  },
]);

const contentList = ref(Array.from({ length: 20 }, (_, i) => i + 1));

type WtHeatBarElement = HTMLElement & WtHeatBarExpose;
type WtHeatBarVueRef = ComponentPublicInstance & { $el: WtHeatBarElement };

const WtHeatBarRef = ref<WtHeatBarVueRef | null>(null);

onMounted(() => {
  showHeatBar.value = true;
  nextTick(() => {
    window.setTimeout(() => {
      void WtHeatBarRef.value?.$el.mounted?.();
    }, 100);
  });
});

onUnmounted(() => {
  void WtHeatBarRef.value?.$el.destroyed?.();
});
</script>
<style lang="scss">
@use "./scss/heat-bar.scss" as *;
</style>