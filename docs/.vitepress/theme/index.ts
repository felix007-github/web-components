import type { Theme, EnhanceAppContext } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Demo from 'vitepress-theme-demoblock/dist/client/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/dist/client/components/DemoBlock.vue'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import '@mache-hangar/components/dist/components/wt-avatar.js'
import '@mache-hangar/components/dist/components/wt-avatar-group.js'
import '@mache-hangar/components/dist/components/wt-badge.js'
import '@mache-hangar/components/dist/components/wt-button.js'
import '@mache-hangar/components/dist/components/wt-checkbox.js'
import '@mache-hangar/components/dist/components/wt-heat-bar.js'
import '@mache-hangar/components/dist/components/wt-icon.js'
import '@mache-hangar/components/dist/components/wt-link.js'
import '@mache-hangar/components/dist/components/wt-input.js'
import '@mache-hangar/components/dist/components/wt-loading.js'
import '@mache-hangar/components/dist/components/wt-logo.js'
import '@mache-hangar/components/dist/components/wt-modal.js'
import '@mache-hangar/components/dist/components/wt-notification.js'
import '@mache-hangar/components/dist/components/wt-progress.js'
import '@mache-hangar/components/dist/components/wt-switch.js'
import '@mache-hangar/components/dist/components/wt-radio.js'
import '@mache-hangar/components/dist/components/wt-tab-bar.js'
import '@mache-hangar/components/dist/components/wt-tag.js'
import '@mache-hangar/components/dist/components/wt-divider.js'
import '@mache-hangar/components/dist/components/wt-search.js'
import '@mache-hangar/components/dist/components/wt-scrollbar.js'
import './index.css'


export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
  }
} satisfies Theme
