<template>
  <div class="scrollbar-demo">
    <h3>wt-scrollbar 组件</h3>
    <div class="demo-section">
      <h4>基础用法</h4>
      <div style="height: 200px; border: 1px solid #ddd; border-radius: 4px;">
        <WtScrollbar>
          <div style="padding: 20px;">
            <p v-for="i in 10" :key="i" style="padding: 10px 0; border-bottom: 1px solid #eee;">
              Scrollable item {{ i }}
            </p>
          </div>
        </WtScrollbar>
      </div>
    </div>

    <div class="demo-section">
      <h4>横向滚动</h4>
      <div style="border: 1px solid #ddd; border-radius: 4px;">
        <wt-scrollbar>
          <div style="display: flex; width: 2000px; padding: 20px;">
            <div v-for="i in 10" :key="i" :style="{ minWidth: '200px', padding: '10px', background: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0', textAlign: 'center' }">
              Horizontal item {{ i }}
            </div>
          </div>
        </wt-scrollbar>
      </div>
    </div>

    <div class="demo-section">
      <h4>尺寸 (small, medium, large)</h4>
      <div style="display: flex; gap: 20px;">
        <div style="height: 150px; flex: 1; border: 1px solid #ddd;">
          <wt-scrollbar size="small">
            <div style="height: 300px; padding: 10px;">Small (2px)</div>
          </wt-scrollbar>
        </div>
        <div style="height: 150px; flex: 1; border: 1px solid #ddd;">
          <wt-scrollbar size="medium">
            <div style="height: 300px; padding: 10px;">Medium(4px) default</div>
          </wt-scrollbar>
        </div>
        <div style="height: 150px; flex: 1; border: 1px solid #ddd;">
          <wt-scrollbar size="large">
            <div style="height: 300px; padding: 10px;">Large (6px)</div>
          </wt-scrollbar>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>一直显示 (always = true) + 滚动事件</h4>
      <div style="height: 200px; border: 1px solid #ddd; border-radius: 4px;">
        <wt-scrollbar :always="true" @wt-scroll="handleScroll">
          <div style="padding: 20px;">
            <p v-for="i in 15" :key="i" style="padding: 10px 0; border-bottom: 1px solid #eee;">
              Item {{ i }} (Always visible scrollbar)
            </p>
          </div>
        </wt-scrollbar>
      </div>
    </div>

    <div class="demo-section">
      <h4>编程式滚动 (scrollTo / setScrollTop / setScrollLeft / wrapRef)</h4>
      <div class="btn-group" style="margin-bottom: 12px;">
        <button @click="scrollToTop">Scroll to Top</button>
        <button @click="scrollToBottom">Scroll to Bottom</button>
        <button @click="scrollToPos">Scroll to 200px</button>
        <button @click="scrollRight">Scroll Right 300px</button>
        <button @click="logWrapRef">Log wrapRef</button>
      </div>
      <div style="height: 200px; border: 1px solid #ddd; border-radius: 4px;">
        <wt-scrollbar ref="scrollbarRef">
          <div style="width: 1200px; padding: 20px;">
            <p
              v-for="i in 20"
              :key="i"
              style="padding: 8px 0; border-bottom: 1px solid #eee; white-space: nowrap;"
            >
              Item {{ i }} — long content that extends horizontally for demo purposes
            </p>
          </div>
        </wt-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';
import { WtScrollbar } from '@lpcp/components/vue'; 

type WtScrollbarVueRef = ComponentPublicInstance & {
  $el: HTMLWtScrollbarElement;
};

const scrollbarRef = ref<WtScrollbarVueRef | null>(null);

const getScrollbarEl = () => scrollbarRef.value?.$el;

const handleScroll = (e: CustomEvent) => {
  console.log('Scroll event in Vue:', e.detail);
};

const scrollToTop = async () => {
  await getScrollbarEl()?.wtSetScrollTop(0);
};

const scrollToBottom = async () => {
  const scrollbarEl = getScrollbarEl();
  const wrap = await scrollbarEl?.wtWrapRef();
  if (wrap) {
    await scrollbarEl?.wtSetScrollTop(wrap.scrollHeight);
  }
};

const scrollToPos = async () => {
  await getScrollbarEl()?.wtScrollTo({ top: 200 });
};

const scrollRight = async () => {
  await getScrollbarEl()?.wtSetScrollLeft(300);
};

const logWrapRef = async () => {
  const wrap = await getScrollbarEl()?.wtWrapRef();
  console.log('wrapRef element:', wrap);
};
</script>

<style scoped>
.scrollbar-demo {
  padding: 20px;
  overflow: auto;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-section h4 {
  margin-bottom: 16px;
  color: #333;
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-group button {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: #fff;
  font-size: 13px;
}

.btn-group button:hover {
  background: #f5f5f5;
}
</style>

