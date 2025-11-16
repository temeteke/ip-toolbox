// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

  // GitHub Pages用の設定
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/ip-toolbox/' : '/',
    buildAssetsDir: 'assets',
    head: {
      title: 'IP Toolbox - Network Calculator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A PWA network calculator for IP address analysis and CIDR calculations' },
        { name: 'theme-color', content: '#3b82f6' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/ip-toolbox/icon.svg' }
      ]
    }
  },

  // 静的サイト生成
  ssr: false,

  // PWA設定
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'IP Toolbox',
      short_name: 'IP Toolbox',
      description: 'Network Calculator - IP address analysis and CIDR calculations',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/ip-toolbox/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/ip-toolbox/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
