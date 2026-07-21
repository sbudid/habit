import pkg from './package.json';
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  modules: ['@nuxthub/core', 'nuxt-auth-utils', '@pinia/nuxt', '@pinia/colada-nuxt', '@nuxt/ui', '@vite-pwa/nuxt'],
  hub: {
    database: true,
  },
  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 30, // 30 days — PWA stays logged in
    },
    public: {
      version: pkg.version,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Rutina — Habit Keluarga Indonesia',
      short_name: 'Rutina',
      description: 'Aplikasi rutinitas harian untuk pribadi dan keluarga Indonesia.',
      theme_color: '#84cc16',
      background_color: '#0a0a0a',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      // Don't cache API calls or auth endpoints
      runtimeCaching: [
        {
          urlPattern: /^\/api\/.*/i,
          handler: 'NetworkOnly',
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
});
