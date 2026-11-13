<template>
  <main :class="`shell${isSidebarCollapsed ? ' is-sidebar-collapsed' : ''}`">
    <aside class="playground-sidebar">
      <div class="playground-sidebar__hero">
        <span class="playground-sidebar__eyebrow">Component Lab</span>
      </div>
      <div class="playground-sidebar__nav-scroll">
        <WtScrollbar
          :wrapper-class="{
            'playground-sidebar__scrollbar': true,
          }"
          :style="{ height: '100%', width: '100%' }"
        >
          <nav class="playground-nav" aria-label="Component demo routes">
            <RouterLink
              v-for="route in demoRoutes"
              :key="route.path"
              :to="route.path"
              class="playground-nav__link"
              active-class="is-active"
            >
              <span class="playground-nav__title">{{ route.label }}</span>
            </RouterLink>
          </nav>
        </WtScrollbar>
      </div>
      <div class="playground-sidebar__footer">
        <div class="playground-sidebar__metric">
          <span class="playground-sidebar__metric-value">{{ demoRoutes.length }}</span>
          <span class="playground-sidebar__metric-label">Routes</span>
        </div>
        <div class="playground-sidebar__metric">
          <span class="playground-sidebar__metric-value">Live</span>
          <span class="playground-sidebar__metric-label">Preview Mode</span>
        </div>
      </div>
    </aside>
    <section class="playground-main">
      <div class="playground-main__header">
        <div class="playground-main__header-left">
            <button
              type="button"
              class="playground-sidebar-toggle"
              aria-controls="playground-sidebar"
              :aria-expanded="!isSidebarCollapsed"
              @click="clicktoggleSidebar()"
            >
              {{ isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar' }}
            </button>
            <span class="playground-main__eyebrow">Workspace</span>
          </div>
        <div class="playground-main__status">
          <span class="playground-main__status-dot"></span>
          {{ activeRouterName }}
        </div>
      </div>
      <section class="playground-grid">
        <RouterView />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { WtScrollbar } from '@lpcp/components/vue';
import { demoRoutes } from './router';
import { computed, ref } from 'vue';

const isSidebarCollapsed = ref(localStorage.getItem('isSidebarCollapsed') === 'true');
const route = useRoute();

const activeRouterName = computed(
  () => demoRoutes.find(demoRoute => demoRoute.path === route.path)?.label || 'Unknown Route',
);

function clicktoggleSidebar() {
  localStorage.setItem('isSidebarCollapsed', String(!isSidebarCollapsed.value));
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}
</script>
