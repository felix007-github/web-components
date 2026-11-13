import { defineConfig } from 'vitepress'
import { demoblockVitePlugin, demoblock } from 'vitepress-theme-demoblock'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "WT UI Components",
  description: "A component library built with Stencil",
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' }]
  ],
  themeConfig: {
    logo: '/favicon.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' },
            { text: 'Icon', link: '/components/icon' },
            { text: 'Avatar', link: '/components/avatar' },
            { text: 'Avatar Group', link: '/components/avatar-group' },
            { text: 'Tag', link: '/components/tag' },
            { text: 'Loading', link: '/components/loading' },
            { text: 'Heat Bar', link: '/components/heat-bar' },
            { text: 'Notification', link: '/components/notification' },
            { text: 'Checkbox', link: '/components/checkbox' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Switch', link: '/components/switch' },
            { text: 'Badge', link: '/components/badge' },
            { text: 'Logo', link: '/components/logo' },
            { text: 'Modal', link: '/components/modal' },
            { text: 'Progress', link: '/components/progress' },
            { text: 'Tab Bar', link: '/components/tab-bar' },
            { text: 'Divider', link: '/components/divider' },
            { text: 'Link', link: '/components/link' },
            { text: 'Search', link: '/components/search' },
            { text: 'Scrollbar', link: '/components/scrollbar' },
          ]
        }
      ],
      '/components/': [
        {
          text: 'Guide',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' },
            { text: 'Icon', link: '/components/icon' },
            { text: 'Avatar', link: '/components/avatar' },
            { text: 'Avatar Group', link: '/components/avatar-group' },
            { text: 'Tag', link: '/components/tag' },
            { text: 'Loading', link: '/components/loading' },
            { text: 'Heat Bar', link: '/components/heat-bar' },
            { text: 'Notification', link: '/components/notification' },
            { text: 'Checkbox', link: '/components/checkbox' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Switch', link: '/components/switch' },
            { text: 'Badge', link: '/components/badge' },
            { text: 'Logo', link: '/components/logo' },
            { text: 'Modal', link: '/components/modal' },
            { text: 'Progress', link: '/components/progress' },
            { text: 'Tab Bar', link: '/components/tab-bar' },
            { text: 'Divider', link: '/components/divider' },
            { text: 'Link', link: '/components/link' },
            { text: 'Search', link: '/components/search' },
            { text: 'Scrollbar', link: '/components/scrollbar' },
          ]
        }
      ]
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('wt-')
      }
    }
  },
  markdown: {
    config: (md) => {
      md.use(demoblock)
    }
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          const warningSource = `${warning.id || warning.loc?.file || ''} ${warning.message || ''}`
          const isDemoblockDemo = /vitepress-theme-demoblock[\\/].*dist[\\/]client[\\/]components[\\/]Demo\.vue/.test(warningSource)
          const isKnownDemoblockWarning =
            warning.code === 'EVAL' ||
            warning.code === 'SOURCEMAP_ERROR' ||
            (warning.code === 'PLUGIN_WARNING' && /(Use of eval|Error when using sourcemap)/.test(warning.message || ''))

          if (isDemoblockDemo && isKnownDemoblockWarning) {
            return
          }

          warn(warning)
        },
      },
    },
    plugins: [
      {
        name: 'wt-docs-favicon-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/favicon.ico')) {
              res.statusCode = 302
              res.setHeader('Location', '/favicon.png')
              res.end()
              return
            }
            next()
          })
        },
      },
      demoblockVitePlugin() as any
    ],
  }
})
