import pkg from './package.json';
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  modules: ['@nuxthub/core', 'nuxt-auth-utils', '@pinia/nuxt', '@pinia/colada-nuxt', '@nuxt/ui'],
  hub: {
    database: true,
  },
  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    public: {
      version: pkg.version,
    },
  },
  // Cloudflare Workers compatibility
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: true,
    },
  },
  // PWA manifest
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#22c55e' },
      ],
    },
  },
});
