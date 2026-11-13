import type { Theme, EnhanceAppContext } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import '@lpcp/components/dist/components/wt-avatar.js'
import '@lpcp/components/dist/components/wt-avatar-group.js'
import '@lpcp/components/dist/components/wt-badge.js'
import '@lpcp/components/dist/components/wt-button.js'
import '@lpcp/components/dist/components/wt-checkbox.js'
import '@lpcp/components/dist/components/wt-heat-bar.js'
import '@lpcp/components/dist/components/wt-icon.js'
import '@lpcp/components/dist/components/wt-link.js'
import '@lpcp/components/dist/components/wt-input.js'
import '@lpcp/components/dist/components/wt-loading.js'
import '@lpcp/components/dist/components/wt-logo.js'
import '@lpcp/components/dist/components/wt-modal.js'
import '@lpcp/components/dist/components/wt-notification.js'
import '@lpcp/components/dist/components/wt-progress.js'
import '@lpcp/components/dist/components/wt-switch.js'
import '@lpcp/components/dist/components/wt-radio.js'
import '@lpcp/components/dist/components/wt-tab-bar.js'
import '@lpcp/components/dist/components/wt-tag.js'
import '@lpcp/components/dist/components/wt-divider.js'
import '@lpcp/components/dist/components/wt-search.js'
import '@lpcp/components/dist/components/wt-scrollbar.js'
import './index.css'


export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
  }
} satisfies Theme
