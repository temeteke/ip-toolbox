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
        { rel: 'icon', type: 'image/svg+xml', href: '/ip-toolbox/icon.svg' },
        { rel: 'manifest', href: '/ip-toolbox/manifest.webmanifest' }
      ]
    }
  },

  // 静的サイト生成
  ssr: false,

  // PWA設定
  pwa: {
    registerType: 'autoUpdate',
    registerWebManifestInRouteRules: true,
    manifest: {
      name: 'IP Toolbox',
      short_name: 'IP Toolbox',
      description: 'Network Calculator - IP address analysis and CIDR calculations',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/ip-toolbox/',
      scope: '/ip-toolbox/',
      icons: [
        {
          src: '/ip-toolbox/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/ip-toolbox/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/ip-toolbox/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/ip-toolbox/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      type: 'module',
      navigateFallback: '/ip-toolbox/'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
