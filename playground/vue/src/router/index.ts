import type { RouteComponent, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

type DemoRoute = {
  path: string;
  label: string;
  component: RouteComponent | (() => Promise<RouteComponent>);
};

export const demoRoutes: DemoRoute[] = [
  { path: '/wt-avatar', label: 'wt-avatar', component: () => import('../views/wt-avatar.vue') },
  { path: '/wt-badge', label: 'wt-badge', component: () => import('../views/wt-badge.vue') },
  { path: '/wt-button', label: 'wt-button', component: () => import('../views/wt-button.vue') },
  { path: '/wt-checkbox', label: 'wt-checkbox', component: () => import('../views/wt-checkbox.vue') },
  { path: '/wt-divider', label: 'wt-divider', component: () => import('../views/wt-divider.vue') },
  { path: '/wt-heat-bar', label: 'wt-heat-bar', component: () => import('../views/wt-heat-bar.vue') },
  { path: '/wt-icon', label: 'wt-icon', component: () => import('../views/wt-icon.vue') },
  { path: '/wt-input', label: 'wt-input', component: () => import('../views/wt-input.vue') },
  { path: '/wt-link', label: 'wt-link', component: () => import('../views/wt-link.vue') },
  { path: '/wt-loading', label: 'wt-loading', component: () => import('../views/wt-loading.vue') },
  { path: '/wt-logo', label: 'wt-logo', component: () => import('../views/wt-logo.vue') },
  { path: '/wt-modal', label: 'wt-modal', component: () => import('../views/wt-modal.vue') },
  { path: '/wt-notification', label: 'wt-notification', component: () => import('../views/wt-notification.vue') },
  { path: '/wt-progress', label: 'wt-progress', component: () => import('../views/wt-progress.vue') },
  { path: '/wt-radio', label: 'wt-radio', component: () => import('../views/wt-radio.vue') },
  { path: '/wt-raw-editor', label: 'wt-raw-editor', component: () => import('../views/wt-raw-editor.vue') },
  { path: '/wt-search', label: 'wt-search', component: () => import('../views/wt-search.vue') },
  { path: '/wt-switch', label: 'wt-switch', component: () => import('../views/wt-switch.vue') },
  { path: '/wt-tab-bar', label: 'wt-tab-bar', component: () => import('../views/wt-tab-bar.vue') },
  { path: '/wt-tag', label: 'wt-tag', component: () => import('../views/wt-tag.vue') },
  { path: '/wt-tree', label: 'wt-tree', component: () => import('../views/wt-tree.vue') },
  { path: '/wt-xml-editor', label: 'wt-xml-editor', component: () => import('../views/wt-xml-editor.vue') },
  { path: '/wt-scrollbar', label: 'wt-scrollbar', component: () => import('../views/wt-scrollbar.vue') },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: demoRoutes[0].path,
  },
  ...demoRoutes.map((route) => ({
    path: route.path,
    component: route.component,
  })),
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
